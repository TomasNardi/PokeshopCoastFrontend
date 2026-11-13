/**
 * Estados de una carta. Mismas claves que el backend de Crack/Delta (el nombre
 * de la condición se normaliza en minúscula), así que cargar productos con el
 * mismo servicio no requiere mapear nada.
 *
 * Los colores son funcionales (semáforo), no de marca: verde = impecable,
 * rojo = dañada. No se tematizan con la paleta del sitio a propósito.
 */

const PLAYED_MODERATE = {
  abbr: 'MP',
  label: 'Moderately Played',
  tone: 'bg-orange-500 text-white',
  description: 'Desgaste moderado: marcas, rayones o bordes notablemente gastados.',
};

const DAMAGED = {
  abbr: 'D',
  label: 'Damaged',
  tone: 'bg-red-600 text-white',
  description: 'Daño significativo: dobleces, roturas, manchas o desgaste severo.',
};

export const CONDITIONS = Object.freeze({
  mint: {
    abbr: 'M',
    label: 'Mint',
    tone: 'bg-emerald-600 text-white',
    description: 'Perfecto estado, sin marcas, rayones ni imperfecciones.',
  },
  'near mint': {
    abbr: 'NM',
    label: 'Near Mint',
    tone: 'bg-green-500 text-white',
    description: 'Desgaste mínimo, casi imperceptible. Excelente estado general.',
  },
  'lightly played': {
    abbr: 'LP',
    label: 'Lightly Played',
    tone: 'bg-yellow-400 text-yellow-950',
    description: 'Leve desgaste visible: pequeñas marcas o bordes apenas gastados.',
  },
  'moderately played': PLAYED_MODERATE,
  'moderate played': PLAYED_MODERATE,
  damage: DAMAGED,
  damaged: DAMAGED,
});

/** Orden de los filtros de la tienda. */
export const CONDITION_FILTERS = ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Damaged'];

export function getCondition(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().trim();
  return (
    CONDITIONS[key] || {
      abbr: key.charAt(0).toUpperCase(),
      label: String(name).trim(),
      tone: 'bg-coast-gray text-white',
      description: '',
    }
  );
}
