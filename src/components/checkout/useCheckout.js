'use client';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';
import { EMPTY_CHECKOUT_FORM } from '@/services/orders/orderService';
import { getShippingMethod, quoteShipping } from '@/services/shipping/shippingMethods';
import { enabledPaymentMethods, getPaymentMethod } from '@/services/payments/paymentMethods';
import { cardSurchargePercent } from '@/domain/pricing';
import { computeTotals, subtotalOf } from '@/domain/cart';
import { useCartStore } from '@/store/cartStore';
import { useSession } from '@/components/auth/SessionProvider';

function reducer(state, action) {
  switch (action.type) {
    case 'field':
      return { ...state, form: { ...state.form, [action.name]: action.value }, errors: { ...state.errors, [action.name]: undefined } };
    case 'shipping': {
      // Cambiar entre sucursal y domicilio limpia la dirección: no son la misma.
      const prevNeeds = getShippingMethod(state.form.shipping_method)?.needsAddress;
      const nextNeeds = getShippingMethod(action.value)?.needsAddress;
      const clearAddress = prevNeeds && nextNeeds && state.form.shipping_method !== action.value;
      return {
        ...state,
        form: {
          ...state.form,
          shipping_method: action.value,
          ...(clearAddress ? { shipping_address: '', shipping_city: '', shipping_zip: '' } : {}),
        },
        errors: {},
      };
    }
    case 'prefill':
      return { ...state, form: Object.fromEntries(Object.entries(state.form).map(([k, v]) => [k, v || action.values[k] || ''])) };
    case 'errors':
      return { ...state, errors: action.errors };
    default:
      return state;
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
  const discount = useMemo(
    () => ({ code: discountCode, percent: discountPercent, fixed: discountFixed }),
    [discountCode, discountPercent, discountFixed]
  );
  const applyDiscount = useCartStore((s) => s.applyDiscount);
  const sync = useCartStore((s) => s.sync);
  const { profile, user } = useSession();

  const [state, dispatch] = useReducer(reducer, { form: { ...EMPTY_CHECKOUT_FORM }, errors: {} });
  const [config, setConfig] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Config de pagos/envíos + precios y stock frescos del carrito.
  useEffect(() => {
    services.orders.getPaymentConfig().then(setConfig).catch(() => setConfig({}));
    const ids = items.map((i) => i.id);
    if (ids.length) services.catalog.getProductsByIds(ids).then(sync).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return computeTotals({
      subtotal: subtotalOf(items),
      discountPercent: discount.percent,
      discountFixed: discount.fixed,
      shipping: quoteShipping(state.form.shipping_method, state.form, config),
      surchargePercent: payment?.surchargePercent(config) || 0,
      // Solo para comparar: con los dos medios activos se muestra la diferencia.
      cardSurchargePercent: paymentMethods.length > 1 ? cardSurchargePercent(config) : 0,
    });
  }, [items, discount.percent, discount.fixed, state.form, config, paymentMethods]);

  const submit = async (event) => {
    event?.preventDefault();
    setSubmitting(true);
    try {
      const { next } = await services.orders.placeOrder({
        form: state.form,
        items,
        discountCode: discount.code,
        receiptFile,
        origin: window.location.origin,
      });
      // El carrito se vacía en la confirmación: si MP falla, el comprador vuelve con su carrito.
      if (next.type === 'redirect') window.location.assign(next.url);
      else router.push(next.href);
    } catch (error) {
      if (error.fieldErrors) dispatch({ type: 'errors', errors: error.fieldErrors });
      toast.error(error.message || 'No pudimos crear el pedido.');
      setSubmitting(false);
    }
  };

  const redeem = async (code) => {
    try {
      const result = await services.orders.validateDiscount(code);
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
    receiptFile,
    setReceiptFile,
    setField: (name, value) => dispatch({ type: 'field', name, value }),
    setShipping: (value) => dispatch({ type: 'shipping', value }),
    redeem,
    submit,
  };
}
