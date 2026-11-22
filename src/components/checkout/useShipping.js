'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getServices } from '@/services/container';
import { BRANCH, HOME, canQuote, methodForKind, quoteKey, sameOption } from '@/services/shipping/shippingMethods';

const QUOTE_DELAY_MS = 450;
const ADDRESS_FIELDS = ['shipping_address', 'shipping_street_number', 'shipping_apartment', 'shipping_city', 'shipping_province', 'shipping_zip'];

const defaultOption = (options) => options.find((o) => o.kind === HOME) || options[0] || null;

/**
 * Envío del checkout, fuera de la vista:
 *   - modo: envío (Envia) o retiro en persona
 *   - cotización con espera (no le pega al backend en cada tecla) y descarte de respuestas viejas
 *   - opción elegida (se conserva al recotizar si el mismo correo/servicio sigue disponible)
 *   - sucursales del correo cuando la opción es "a sucursal"
 *   - direcciones guardadas del cliente y "guardar esta dirección"
 */
export function useShipping({ form, items, setFields, loggedIn }) {
  const services = getServices();
  const delivery = form.shipping_method === 'pickup_store' ? 'pickup' : 'ship';
  const key = delivery === 'ship' && canQuote(form) ? quoteKey(form, items) : '';

  const [quotes, setQuotes] = useState({ status: 'idle', options: [], error: '', key: '' });
  const [retries, setRetries] = useState(0);
  const sequence = useRef(0);
  const selected = quotes.options.find((o) => o.token === form.shipping_quote) || null;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const formRef = useRef(form);
  formRef.current = form;

  const choose = useCallback((option, { keepBranch = false } = {}) => {
    if (!option) {
      setFields({ shipping_quote: '', shipping_branch_code: '', shipping_branch: '' });
      return;
    }
    setFields({
      shipping_quote: option.token,
      shipping_method: methodForKind(option.kind),
      ...(keepBranch ? {} : { shipping_branch_code: '', shipping_branch: '' }),
    });
  }, [setFields]);

  // Cotizar cuando hay destino completo; cada cambio de CP, ciudad, provincia o carrito recotiza.
  useEffect(() => {
    if (!key) {
      setQuotes((q) => (q.status === 'idle' ? q : { status: 'idle', options: [], error: '', key: '' }));
      if (formRef.current.shipping_quote) setFields({ shipping_quote: '', shipping_branch_code: '', shipping_branch: '' });
      return undefined;
    }
    const mine = ++sequence.current;
    setQuotes((q) => ({ ...q, status: 'loading', error: '' }));
    const timer = setTimeout(async () => {
      const f = formRef.current;
      try {
        const { options = [] } = await services.shipping.quote({
          items, zip: f.shipping_zip.trim(), province: f.shipping_province, city: f.shipping_city.trim(),
          street: f.shipping_address?.trim() || '', number: f.shipping_street_number?.trim() || '',
        });
        if (mine !== sequence.current) return;
        setQuotes({ status: 'ready', options, error: '', key });
        const previous = selectedRef.current;
        const same = options.find((o) => sameOption(o, previous));
        choose(same || defaultOption(options), { keepBranch: Boolean(same) });
      } catch (error) {
        if (mine !== sequence.current) return;
        setQuotes({ status: 'error', options: [], error: error.message || 'No pudimos cotizar el envío.', key });
        choose(null);
      }
    }, QUOTE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retries]);

  // Sucursales del correo de la opción elegida, cerca del CP.
  const [branches, setBranches] = useState({ status: 'idle', list: [], error: '', key: '' });
  const branchKey = selected?.kind === BRANCH ? `${selected.carrier}|${form.shipping_zip.trim()}` : '';
  useEffect(() => {
    if (!branchKey) return undefined;
    let alive = true;
    setBranches({ status: 'loading', list: [], error: '', key: branchKey });
    const [carrier, zip] = branchKey.split('|');
    services.shipping.branches(carrier, zip)
      .then((list) => alive && setBranches({ status: 'ready', list, error: '', key: branchKey }))
      .catch((error) => alive && setBranches({ status: 'error', list: [], error: error.message || 'No pudimos traer las sucursales.', key: branchKey }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchKey]);

  // Direcciones guardadas (solo domicilios) del cliente con sesión.
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('new');
  const [saveAddress, setSaveAddress] = useState(true);
  const applyAddress = useCallback((address) => {
    setAddressId(address.id);
    setFields({
      shipping_address: address.address || '', shipping_street_number: address.street_number || '',
      shipping_apartment: address.apartment || '', shipping_city: address.city || '',
      shipping_province: address.province || '', shipping_zip: address.zip_code || '',
    });
  }, [setFields]);
  useEffect(() => {
    if (!loggedIn) return undefined;
    let alive = true;
    services.customer.getAddresses().then((list) => {
      if (!alive) return;
      const homes = (Array.isArray(list) ? list : []).filter((a) => a.kind === 'home');
      setAddresses(homes);
      const preferred = homes.find((a) => a.is_default) || homes[0];
      // Solo si todavía no escribió una dirección: nunca pisa lo tipeado.
      if (preferred && !formRef.current.shipping_zip) applyAddress(preferred);
    }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const useNewAddress = () => {
    setAddressId('new');
    setFields(Object.fromEntries(ADDRESS_FIELDS.map((f) => [f, f === 'shipping_province' ? formRef.current.shipping_province : ''])));
  };

  /** Después de comprar: guarda la dirección nueva en la cuenta (nunca frena la compra). */
  const saveNewAddress = async () => {
    const f = formRef.current;
    if (!loggedIn || addressId !== 'new' || !saveAddress || f.shipping_method !== 'envia_home') return;
    try {
      await services.customer.createAddress({
        kind: 'home', address: f.shipping_address.trim(), street_number: f.shipping_street_number.trim(),
        apartment: f.shipping_apartment?.trim() || '', city: f.shipping_city.trim(), province: f.shipping_province,
        zip_code: f.shipping_zip.trim(), recipient_name: f.customer_name.trim(), phone: f.customer_phone.trim(),
        is_default: addresses.length === 0,
      });
    } catch {
      /* la compra ya salió: la dirección se puede cargar después en Mi cuenta */
    }
  };

  return {
    delivery,
    setDelivery: (mode) => {
      if (mode === 'pickup') {
        setFields({ shipping_method: 'pickup_store', shipping_quote: '', shipping_branch_code: '', shipping_branch: '' });
        return;
      }
      // Volver a "Envío" recotiza (el backend lo tiene en cache) y elige la opción a domicilio más barata.
      setFields({ shipping_method: 'envia_home' });
    },
    canQuote: Boolean(key),
    quotes,
    selected,
    select: (option) => choose(option, { keepBranch: sameOption(option, selected) }),
    retry: () => setRetries((n) => n + 1),
    branches,
    selectBranch: (branch) => setFields({ shipping_branch_code: branch.code, shipping_branch: `${branch.name} — ${branch.address}` }),
    addresses,
    addressId,
    selectAddress: (address) => (address === 'new' ? useNewAddress() : applyAddress(address)),
    saveAddress,
    setSaveAddress,
    saveNewAddress,
  };
}
