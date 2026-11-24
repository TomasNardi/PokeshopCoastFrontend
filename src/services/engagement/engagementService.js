import { isValidEmail } from '@/domain/passwordRules';

export const CONTACT_SUBJECTS = [
  { value: 'compra', label: 'Consulta sobre una compra' },
  { value: 'envio', label: 'Envíos' },
  { value: 'venta', label: 'Quiero vender mis cartas' },
  { value: 'otro', label: 'Otro' },
];

export function validateContact(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = 'Ingresá tu nombre.';
  if (!isValidEmail(form.email)) errors.email = 'Ingresá un email válido.';
  if ((form.message?.trim() || '').length < 10) errors.message = 'Contanos un poco más (mínimo 10 caracteres).';
  return errors;
}

const ORDER_CODE_RE = /^[A-Za-z]{2,4}-?[A-Za-z0-9]{4,10}$/;

export function validateWithdrawal(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = 'Ingresá tu nombre y apellido.';
  if (!isValidEmail(form.email)) errors.email = 'Ingresá el email con el que compraste.';
  if (!ORDER_CODE_RE.test(form.order_code?.trim() || '')) errors.order_code = 'Revisá el código (por ejemplo PSC-AB12CD). Está en el mail de la compra.';
  return errors;
}

export function createEngagementService(repository) {
  return {
    async sendContact(form) {
      const errors = validateContact(form);
      if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos marcados.'), { fieldErrors: errors });
      const subject = CONTACT_SUBJECTS.find((s) => s.value === form.subject)?.label || '';
      return repository.sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || '',
        message: subject ? `[${subject}] ${form.message.trim()}` : form.message.trim(),
      });
    },
    async sendWithdrawal(form) {
      const errors = validateWithdrawal(form);
      if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos marcados.'), { fieldErrors: errors });
      return repository.sendWithdrawal({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || '',
        order_code: form.order_code.trim().toUpperCase(),
        reason: form.reason?.trim() || '',
      });
    },
    /** `source`: de dónde vino (ej. "lanzamiento"), queda en el admin de suscriptores. */
    async subscribe(email, { source = '' } = {}) {
      if (!isValidEmail(email)) throw new Error('Ingresá un email válido.');
      return repository.subscribe(email.trim().toLowerCase(), source);
    },
    unsubscribe: (token) => repository.unsubscribe(token),
    getSiteConfig: () => repository.getSiteConfig().catch(() => ({ is_active: true, show_top_banner: true })),
  };
}
