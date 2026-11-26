'use client';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';
import { EMPTY_CHECKOUT_FORM, validateCheckout } from '@/services/orders/orderService';
import { useShipping } from './useShipping';
import { formatPrice } from '@/domain/money';
import { enabledPaymentMethods, getPaymentMethod } from '@/services/payments/paymentMethods';
import { cardSurchargePercent } from '@/domain/pricing';
import { computeTotals, freeShippingStatus, subtotalOf } from '@/domain/cart';
import { useCartStore } from '@/store/cartStore';
import { useSession } from '@/components/auth/SessionProvider';
import { forgetGuestEmail, rememberGuestEmail, rememberOrderClaim } from '@/domain/guestSignup';

function reducer(state, action) {
  switch (action.type) {
    case 'field':
      return { ...state, form: { ...state.form, [action.name]: action.value }, errors: { ...state.errors, [action.name]: undefined } };
    case 'fields': {
      // Varios campos juntos (opción de envío, dirección guardada): limpia sus errores.
      const cleared = Object.fromEntries(Object.keys(action.values).map((k) => [k, undefined]));
      return { ...state, form: { ...state.form, ...action.values }, errors: { ...state.errors, ...cleared, shipping_method: undefined } };
    }
    case 'restore':
      // Link del recordatorio: lo guardado manda sobre el formulario vacío.
      return { ...state, form: { ...state.form, ...Object.fromEntries(Object.entries(action.values).filter(([, v]) => v)) } };
    case 'prefill':
      return { ...state, form: Object.fromEntries(Object.entries(state.form).map(([k, v]) => [k, v || action.values[k] || ''])) };
    case 'errors':
      return { ...state, errors: action.errors };
    default:
      return state;
  }
}

// Token del checkout pendiente (carrito abandonado). Sobrevive recargas.
const CHECKOUT_TOKEN_KEY = 'pokeshop:checkout-token';
const SAVE_DELAY_MS = 1500;

function readToken() {
  try {
    return window.localStorage.getItem(CHECKOUT_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) window.localStorage.setItem(CHECKOUT_TOKEN_KEY, token);
    else window.localStorage.removeItem(CHECKOUT_TOKEN_KEY);
  } catch {
    /* sin storage: el recordatorio igual sale, solo no se reusa el token */
  }
}

/**
 * Toda la lógica del checkout fuera de la vista. Los componentes de
 * src/components/checkout solo reciben `form`, `errors` y handlers.
 */
export function useCheckout() {
  const router = useRouter();
  const services = getServices();
  const items = useCartStore((s) => s.items);
  // Selectores separados: un selector que arma un objeto nuevo re-renderiza en loop (zustand v5).
  const discountCode = useCartStore((s) => s.discountCode);
  const discountPercent = useCartStore((s) => s.discountPercent);
  const discountFixed = useCartStore((s) => s.discountFixed);
  const discountMinTotal = useCartStore((s) => s.discountMinTotal) || 0;
  const clearDiscount = useCartStore((s) => s.clearDiscount);
  // Un código con compra mínima no descuenta (ni viaja) si el carrito no llega: se avisa y se puede quitar.
  const cartSubtotal = subtotalOf(items);
  const discountBlocked = Boolean(discountCode) && cartSubtotal < discountMinTotal;
  const discount = useMemo(
    () => (discountBlocked
      ? { code: discountCode, percent: 0, fixed: 0, minTotal: discountMinTotal, blocked: true }
      : { code: discountCode, percent: discountPercent, fixed: discountFixed, minTotal: discountMinTotal, blocked: false }),
    [discountCode, discountPercent, discountFixed, discountMinTotal, discountBlocked]
  );
  const applyDiscount = useCartStore((s) => s.applyDiscount);
  const sync = useCartStore((s) => s.sync);
  const addToCart = useCartStore((s) => s.add);
  const clearCart = useCartStore((s) => s.clear);
  const checkoutToken = useRef(null);
  // Mientras se crea el pedido (y después) no se guarda más el checkout pendiente:
  // un guardado tardío reabriría el carrito y llegaría el recordatorio a alguien que ya compró.
  const placing = useRef(false);
  const [recovering, setRecovering] = useState(false);
  const { profile, user, status: sessionStatus } = useSession();

  const [state, dispatch] = useReducer(reducer, { form: { ...EMPTY_CHECKOUT_FORM }, errors: {} });
  const setFields = useCallback((values) => dispatch({ type: 'fields', values }), []);
  const shipping = useShipping({ form: state.form, items, setFields, loggedIn: Boolean(user) });
  const [config, setConfig] = useState(null);
  // Comprobante: se sube apenas se elige, así el error (o el OK) se ve en el momento.
  // status: idle | uploading | ready | error
  const [receipt, setReceipt] = useState({ status: 'idle', file: null, data: null, error: '' });
  const receiptSeq = useRef(0);
  const pickReceipt = async (file) => {
    const seq = ++receiptSeq.current;
    if (!file) {
      setReceipt({ status: 'idle', file: null, data: null, error: '' });
      return;
    }
    setReceipt({ status: 'uploading', file, data: null, error: '' });
    try {
      const data = await services.orders.uploadReceipt(file);
      if (seq === receiptSeq.current) setReceipt({ status: 'ready', file, data, error: '' });
    } catch (error) {
      if (seq !== receiptSeq.current) return;
      setReceipt({ status: 'error', file, data: null, error: error.message || 'No pudimos subir el comprobante.' });
    }
  };
  const [submitting, setSubmitting] = useState(false);
  // Transferencia: paso final con datos bancarios + comprobante. La orden se crea recién ahí.
  const [transferOpen, setTransferOpen] = useState(false);

  // Config de pagos/envíos + precios y stock frescos del carrito.
  useEffect(() => {
    services.orders.getPaymentConfig().then(setConfig).catch(() => setConfig({}));
    const ids = items.map((i) => i.id);
    if (ids.length) services.catalog.getProductsByIds(ids).then(sync).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Link del mail de recordatorio (`/checkout?recuperar=<token>`): rearma el
  // carrito con lo que siga en stock y completa el formulario como lo dejó.
  useEffect(() => {
    checkoutToken.current = readToken();
    const token = new URLSearchParams(window.location.search).get('recuperar');
    if (!token) return;
    setRecovering(true);
    (async () => {
      try {
        const saved = await services.orders.recoverCheckout(token);
        if (saved.finished) {
          toast('Esa compra ya se completó. ¡Gracias!');
          return;
        }
        const products = saved.items.length
          ? await services.catalog.getProductsByIds(saved.items.map((i) => i.product_id))
          : [];
        const byId = new Map(products.map((p) => [p.id, p]));
        clearCart();
        saved.items.forEach((i) => byId.has(i.product_id) && addToCart(byId.get(i.product_id), i.quantity));
        dispatch({ type: 'restore', values: saved.form || {} });
        checkoutToken.current = saved.token;
        writeToken(saved.token);
        if (saved.items.length < (saved.items_total ?? saved.items.length) || !saved.items.length) {
          toast.error('Algunos productos de tu carrito ya no tienen stock.');
        } else {
          toast.success('Recuperamos tu carrito.');
        }
      } catch {
        toast.error('Este link ya no está disponible.');
      } finally {
        setRecovering(false);
        router.replace('/checkout');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrito abandonado: con email válido y carrito, guarda el checkout (con
  // espera, para no pegarle al backend en cada tecla). Si se va sin comprar,
  // el backend le manda UN recordatorio por mail.
  const { form } = state;
  useEffect(() => {
    if (recovering || !items.length) return undefined;
    const timer = setTimeout(async () => {
      if (placing.current) return;
      try {
        const token = await services.orders.savePendingCheckout({
          form, items, discountCode: discount.code, token: checkoutToken.current,
        });
        if (token && token !== checkoutToken.current) {
          checkoutToken.current = token;
          writeToken(token);
        }
      } catch {
        /* nunca frena el checkout */
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    recovering, items, discount.code, form.customer_email, form.customer_name, form.customer_phone,
    form.shipping_method, form.shipping_address, form.shipping_street_number, form.shipping_apartment,
    form.shipping_city, form.shipping_province, form.shipping_zip, form.payment_method,
  ]);

  // Con sesión, completa lo vacío una sola vez. Nunca pisa lo que tipeó.
  useEffect(() => {
    if (!user) return;
    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.name;
    dispatch({ type: 'prefill', values: { customer_name: name, customer_email: user.email, customer_phone: profile?.phone } });
  }, [user, profile]);

  // Si el dueño apagó un medio en el backoffice, se elige solo el que queda.
  const paymentMethods = useMemo(() => enabledPaymentMethods(config), [config]);
  useEffect(() => {
    if (!config || !paymentMethods.length) return;
    if (!paymentMethods.some((m) => m.id === state.form.payment_method)) {
      dispatch({ type: 'field', name: 'payment_method', value: paymentMethods[0].id });
    }
  }, [config, paymentMethods, state.form.payment_method]);

  const totals = useMemo(() => {
    const payment = getPaymentMethod(state.form.payment_method);
    const subtotal = subtotalOf(items);
    const productsTotal = subtotal - Math.min(subtotal, subtotal * ((discount.percent || 0) / 100) + (discount.fixed || 0));
    const freeShipping = freeShippingStatus(config, productsTotal);
    // Envío: lo cotizado por Envia para la opción elegida (null = todavía sin cotizar).
    const quoted = shipping.delivery === 'pickup' ? 0 : (shipping.selected?.price ?? null);
    const totals = computeTotals({
      subtotal,
      discountPercent: discount.percent,
      discountFixed: discount.fixed,
      shipping: freeShipping.applies && quoted != null ? 0 : quoted,
      surchargePercent: payment?.surchargePercent(config) || 0,
      // Solo para comparar: con los dos medios activos se muestra la diferencia.
      cardSurchargePercent: paymentMethods.length > 1 ? cardSurchargePercent(config) : 0,
    });
    return { ...totals, freeShipping };
  }, [items, discount.percent, discount.fixed, state.form.payment_method, config, paymentMethods, shipping.delivery, shipping.selected]);

  const submit = async (event) => {
    event?.preventDefault();
    if (state.form.payment_method === 'transfer' && !transferOpen) {
      // Primero se validan los datos (sin comprobante) y se abre el paso de transferencia.
      const errors = validateCheckout(state.form, { receipt: true });
      dispatch({ type: 'errors', errors });
      if (Object.keys(errors).length) {
        toast.error('Revisá los datos marcados.');
        return;
      }
      setTransferOpen(true);
      return;
    }
    setSubmitting(true);
    placing.current = true;
    try {
      const { next, claimToken } = await services.orders.placeOrder({
        form: state.form,
        items,
        discountCode: discount.blocked ? '' : discount.code,
        receipt: receipt.data,
        origin: window.location.origin,
        checkoutToken: checkoutToken.current,
      });
      writeToken(null);
      await shipping.saveNewAddress();
      // Invitado: en la confirmación le ofrecemos crear la cuenta con este email.
      if (user) forgetGuestEmail(); else rememberGuestEmail(state.form.customer_email);
      // Constancia del pedido en este navegador: al entrar con cualquier cuenta, aparece en "Mi cuenta".
      rememberOrderClaim(claimToken);
      // El carrito se vacía en la confirmación: si MP falla, el comprador vuelve con su carrito.
      if (next.type === 'redirect') window.location.assign(next.url);
      else router.push(next.href);
    } catch (error) {
      // La cotización venció o el carrito cambió: se recotiza sola y el comprador elige de nuevo.
      if (error.data?.code === 'shipping_quote_expired') shipping.retry();
      // El código dejó de servir (vencido, sin usos, compra mínima): se saca para que pueda seguir.
      if (error.fieldErrors?.discount_code) clearDiscount();
      if (error.fieldErrors) {
        dispatch({ type: 'errors', errors: error.fieldErrors });
        // Si el problema está en los datos (no en el comprobante), volvemos al formulario.
        if (Object.keys(error.fieldErrors).some((k) => k !== 'receipt')) setTransferOpen(false);
      }
      toast.error(error.message || 'No pudimos crear el pedido.');
      placing.current = false;
      setSubmitting(false);
    }
  };

  const redeem = async (code) => {
    try {
      const result = await services.orders.validateDiscount(code);
      const minTotal = Number(result.min_order_total) || 0;
      if (cartSubtotal < minTotal) {
        toast.error(`El código ${result.code} es para compras desde ${formatPrice(minTotal)}.`);
        return;
      }
      applyDiscount(result);
      toast.success(`Código ${result.code} aplicado`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return {
    items,
    form: state.form,
    errors: state.errors,
    config,
    paymentMethods,
    totals,
    discount,
    submitting,
    receipt,
    pickReceipt,
    transferOpen,
    guest: sessionStatus === 'anonymous',
    loggedIn: Boolean(user),
    closeTransfer: () => setTransferOpen(false),
    setField: (name, value) => dispatch({ type: 'field', name, value }),
    setFields,
    shipping,
    redeem,
    removeDiscount: () => {
      clearDiscount();
      toast('Código quitado');
    },
    submit,
  };
}
