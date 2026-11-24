/**
 * Idioma, acabado y particularidades (campos `language`, `finish`, `altered`,
 * `signed`, `stamped`, `freshly_opened`). Mismas etiquetas que el backend.
 */

export const LANGUAGES = Object.freeze({
  en: { label: 'Inglés', flag: '/flags/flag-en.svg' },
  es: { label: 'Español', flag: '/flags/flag-es.svg' },
  pt: { label: 'Portugués', flag: '/flags/flag-br.svg' },
  ja: { label: 'Japonés', flag: '/flags/flag-jp.svg' },
  // focus: qué parte de la bandera queda en el círculo (la china tiene las estrellas arriba a la izquierda).
  zh: { label: 'Chino', flag: '/flags/flag-cn.svg', focus: '18% 30%' },
});

export const languageOf = (product) => {
  const code = product?.language || product?.catalog?.language || '';
  return LANGUAGES[code] ? { code, ...LANGUAGES[code] } : null;
};

const FINISH_LABELS = {
  Normal: 'Normal',
  Holofoil: 'Holo',
  'Reverse Holofoil': 'Reverse Holo',
  Unlimited: 'Unlimited',
  'Unlimited Holofoil': 'Unlimited Holo',
  '1st Edition': '1st Edition',
  '1st Edition Holofoil': '1st Edition Holo',
  Foil: 'Foil',
  'Cold Foil': 'Cold Foil',
};

export const finishLabel = (finish) => (finish ? FINISH_LABELS[finish] || finish : '');

// Impresiones "de base": no se destacan. Lo demás es una variante que vale distinto.
const BASE_FINISHES = new Set(['', 'Normal', 'Holofoil', 'Unlimited', 'Unlimited Holofoil']);

export const isSpecialFinish = (finish) => !BASE_FINISHES.has(finish || '');

export const ATTRIBUTES = [
  ['altered', 'Alterada'],
  ['signed', 'Firmada'],
  ['stamped', 'Estampada'],
  ['freshly_opened', 'Recién abierta'],
];

export const attributesOf = (product) =>
  ATTRIBUTES.filter(([field]) => product?.[field]).map(([, label]) => label);

/**
 * Insignias con ícono (como TCG Fans): solo las que aplican a la carta.
 * Mismos íconos que la carga de stock del admin (public/insignias).
 */
const ATTRIBUTE_ICONS = {
  altered: '/insignias/alterada.svg',
  signed: '/insignias/firmada.svg',
  stamped: '/insignias/estampada.svg',
  freshly_opened: '/insignias/recien_abierta.svg',
};

export function traitBadgesOf(product) {
  const finish = product?.finish || '';
  const badges = [];
  if (finish === 'Reverse Holofoil') badges.push({ key: 'reverse', label: 'Reverse Holo', icon: '/insignias/reverse.svg' });
  if (finish.startsWith('1st Edition')) badges.push({ key: '1st', label: '1st Edition', icon: '/insignias/primera.svg' });
  ATTRIBUTES.forEach(([field, label]) => {
    if (product?.[field]) badges.push({ key: field, label, icon: ATTRIBUTE_ICONS[field] });
  });
  return badges;
}
