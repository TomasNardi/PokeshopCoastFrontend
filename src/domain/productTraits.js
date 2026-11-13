/**
 * Idioma, acabado y particularidades (campos `language`, `finish`, `altered`,
 * `signed`, `stamped`, `freshly_opened`). Mismas etiquetas que el backend.
 */

export const LANGUAGES = Object.freeze({
  en: { label: 'Inglés', flag: '/flags/flag-en.svg' },
  es: { label: 'Español', flag: '/flags/flag-es.svg' },
  pt: { label: 'Portugués', flag: '/flags/flag-br.svg' },
  ja: { label: 'Japonés', flag: '/flags/flag-jp.svg' },
  zh: { label: 'Chino', flag: '/flags/flag-cn.svg' },
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
