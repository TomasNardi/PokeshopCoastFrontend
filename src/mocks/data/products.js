/**
 * Productos mock con la MISMA forma que el serializer de Django en Crack
 * (`/api/v1/products/`). Los usan:
 *   - el repositorio en memoria (solo tests)
 *   - los handlers de MSW de los tests de contrato
 * Si el serializer cambia, se cambia acá y los tests de contrato lo detectan.
 */

const card = (set, number) => `https://images.pokemontcg.io/${set}/${number}_hires.png`;
const category = (slug, name) => ({ id: slug.length, slug, name });

const SINGLES = category('singles', 'Singles');
const SLABS = category('slabs', 'Slabs');
const SELLADOS = category('sellados', 'Sellados');
const ACCESORIOS = category('accesorios', 'Accesorios');

const base = {
  description: '',
  discount_percent: 0,
  in_stock: true,
  stock_quantity: 1,
  language: 'en',
  finish: 'Holofoil',
  altered: false,
  signed: false,
  stamped: false,
  freshly_opened: false,
  condition: null,
  certification_entity: null,
  certification_grade: null,
  catalog: null,
  is_featured: false,
  // Outlet: productos con detalles. `damage_note` describe el daño (lo carga el admin).
  is_outlet: false,
  damage_note: '',
};

const product = (id, fields) => {
  const price = fields.price_ars;
  const discount = fields.discount_percent || 0;
  return {
    ...base,
    id,
    final_price: String(Math.round(price * (1 - discount / 100))),
    created_at: new Date(Date.UTC(2026, 9, 30 - id)).toISOString(),
    ...fields,
    price_ars: String(price),
  };
};

export const MOCK_PRODUCTS = [
  product(1, {
    slug: 'charizard-ex-199-151',
    name: 'Charizard ex 199/165 — Scarlet & Violet 151',
    category: SINGLES,
    price_ars: 289000,
    image_url: card('sv3pt5', '199'),
    // Fotos extra para ver la galería de la ficha (placeholders de otras cartas).
    images: [card('sv3pt5', '6'), card('sv4pt5', '234'), card('base1', '4'), card('sv3pt5', '4')],
    condition: { id: 2, name: 'Near Mint' },
    finish: 'Holofoil',
    is_featured: true,
    catalog: { name: 'Charizard ex', number: '199/165', set_name: 'Scarlet & Violet 151', rarity: 'Special Illustration Rare', language: 'en' },
  }),
  product(2, {
    slug: 'umbreon-vmax-215-evolving-skies-psa-10',
    name: 'Umbreon VMAX 215/203 — Evolving Skies',
    category: SLABS,
    price_ars: 2150000,
    image_url: card('swsh7', '215'),
    certification_entity: 'PSA',
    certification_grade: '10.0',
    is_featured: true,
    catalog: { name: 'Umbreon VMAX', number: '215/203', set_name: 'Evolving Skies', rarity: 'Secret Rare', language: 'en' },
  }),
  product(3, {
    slug: 'pikachu-025-151-reverse',
    name: 'Pikachu 025/165 — Scarlet & Violet 151',
    category: SINGLES,
    price_ars: 6500,
    image_url: card('sv3pt5', '25'),
    condition: { id: 1, name: 'Mint' },
    finish: 'Reverse Holofoil',
    stock_quantity: 6,
    catalog: { name: 'Pikachu', number: '025/165', set_name: 'Scarlet & Violet 151', rarity: 'Common', language: 'en' },
  }),
  product(4, {
    slug: 'charizard-004-base-set-lp',
    name: 'Charizard 4/102 — Base Set',
    category: SINGLES,
    price_ars: 920000,
    discount_percent: 10,
    image_url: card('base1', '4'),
    condition: { id: 3, name: 'Lightly Played' },
    finish: 'Unlimited Holofoil',
    is_featured: true,
    catalog: { name: 'Charizard', number: '4/102', set_name: 'Base Set', rarity: 'Rare Holo', language: 'en' },
  }),
  product(5, {
    slug: 'rayquaza-vmax-218-evolving-skies-cgc-9-5',
    name: 'Rayquaza VMAX 218/203 — Evolving Skies',
    category: SLABS,
    price_ars: 1380000,
    image_url: card('swsh7', '218'),
    certification_entity: 'CGC',
    certification_grade: '9.5',
    catalog: { name: 'Rayquaza VMAX', number: '218/203', set_name: 'Evolving Skies', rarity: 'Secret Rare', language: 'en' },
  }),
  product(6, {
    slug: 'mew-ex-151-151-jp',
    name: 'Mew ex 151/165 — Scarlet & Violet 151',
    category: SINGLES,
    price_ars: 54000,
    image_url: card('sv3pt5', '151'),
    condition: { id: 2, name: 'Near Mint' },
    language: 'ja',
    stock_quantity: 2,
    catalog: { name: 'Mew ex', number: '151/165', set_name: 'Scarlet & Violet 151', rarity: 'Double Rare', language: 'ja' },
  }),
  product(7, {
    slug: 'blastoise-002-base-set-mp',
    name: 'Blastoise 2/102 — Base Set',
    category: SINGLES,
    price_ars: 210000,
    image_url: card('base1', '2'),
    condition: { id: 4, name: 'Moderately Played' },
    finish: 'Unlimited Holofoil',
    catalog: { name: 'Blastoise', number: '2/102', set_name: 'Base Set', rarity: 'Rare Holo', language: 'en' },
  }),
  product(8, {
    slug: 'venusaur-015-base-set-damaged',
    name: 'Venusaur 15/102 — Base Set',
    category: SINGLES,
    price_ars: 48000,
    discount_percent: 15,
    image_url: card('base1', '15'),
    condition: { id: 5, name: 'Damaged' },
    finish: 'Unlimited Holofoil',
    is_outlet: true,
    damage_note: 'Doblez marcado en la esquina inferior derecha y desgaste fuerte en los bordes. El frente se ve bien.',
    catalog: { name: 'Venusaur', number: '15/102', set_name: 'Base Set', rarity: 'Rare Holo', language: 'en' },
  }),
  product(9, {
    slug: 'lugia-009-neo-genesis-1st-edition',
    name: 'Lugia 9/111 — Neo Genesis',
    category: SINGLES,
    price_ars: 1650000,
    image_url: card('neo1', '9'),
    condition: { id: 2, name: 'Near Mint' },
    finish: '1st Edition Holofoil',
    signed: true,
    catalog: { name: 'Lugia', number: '9/111', set_name: 'Neo Genesis', rarity: 'Rare Holo', language: 'en' },
  }),
  product(10, {
    slug: 'charizard-ex-234-paldean-fates-psa-9',
    name: 'Charizard ex 234/091 — Paldean Fates',
    category: SLABS,
    price_ars: 640000,
    discount_percent: 8,
    image_url: card('sv4pt5', '234'),
    certification_entity: 'PSA',
    certification_grade: '9.0',
    catalog: { name: 'Charizard ex', number: '234/091', set_name: 'Paldean Fates', rarity: 'Special Illustration Rare', language: 'en' },
  }),
  product(11, {
    slug: 'charizard-ex-006-151-sin-stock',
    name: 'Charizard ex 006/165 — Scarlet & Violet 151',
    category: SINGLES,
    price_ars: 38000,
    image_url: card('sv3pt5', '6'),
    condition: { id: 2, name: 'Near Mint' },
    in_stock: false,
    stock_quantity: 0,
    language: 'pt',
    catalog: { name: 'Charizard ex', number: '006/165', set_name: 'Scarlet & Violet 151', rarity: 'Double Rare', language: 'pt' },
  }),
  product(12, {
    slug: 'booster-box-151-japones',
    name: 'Booster Box Pokémon 151 (Japonés)',
    category: SELLADOS,
    price_ars: 245000,
    image_url: '/products/booster-box-151-jp.webp',
    language: 'ja',
    finish: '',
    stock_quantity: 4,
    is_featured: true,
    description: 'Caja sellada de 20 sobres de la expansión 151 en japonés.',
  }),
  product(13, {
    slug: 'elite-trainer-box-paldean-fates',
    name: 'Elite Trainer Box — Paldean Fates',
    category: SELLADOS,
    price_ars: 132000,
    image_url: '/products/etb-paldean-fates.webp',
    finish: '',
    stock_quantity: 3,
  }),
  product(14, {
    slug: 'sleeves-coast-sunset-x100',
    name: 'Sleeves Coast Sunset x100',
    category: ACCESORIOS,
    price_ars: 9800,
    image_url: '/mock/sleeves.svg',
    language: '',
    finish: '',
    stock_quantity: 25,
  }),
];

MOCK_PRODUCTS.push(
  product(15, {
    slug: 'gengar-005-fossil-outlet',
    name: 'Gengar 5/62 — Fossil',
    category: SINGLES,
    price_ars: 32000,
    discount_percent: 20,
    image_url: card('base3', '5'),
    condition: { id: 5, name: 'Damaged' },
    finish: 'Unlimited Holofoil',
    is_outlet: true,
    damage_note: 'Rayón en el holo a la altura del nombre y una mancha chica en el dorso.',
    catalog: { name: 'Gengar', number: '5/62', set_name: 'Fossil', rarity: 'Rare Holo', language: 'en' },
  }),
  product(16, {
    slug: 'elite-trainer-box-caja-golpeada-outlet',
    name: 'Elite Trainer Box — Surging Sparks (caja golpeada)',
    category: SELLADOS,
    price_ars: 128000,
    discount_percent: 25,
    image_url: '/products/etb-surging-sparks.webp',
    finish: '',
    stock_quantity: 1,
    is_outlet: true,
    damage_note: 'Sellado de fábrica intacto. La caja exterior tiene un golpe en una esquina y el film está algo marcado.',
  }),
  product(17, {
    slug: 'mewtwo-010-base-set-outlet',
    name: 'Mewtwo 10/102 — Base Set',
    category: SINGLES,
    price_ars: 26000,
    discount_percent: 15,
    image_url: card('base1', '10'),
    condition: { id: 4, name: 'Moderately Played' },
    finish: 'Unlimited Holofoil',
    is_outlet: true,
    damage_note: 'Pliegue leve en el centro (se nota a contraluz) y bordes blanqueados.',
    catalog: { name: 'Mewtwo', number: '10/102', set_name: 'Base Set', rarity: 'Rare Holo', language: 'en' },
  }),
  product(18, {
    slug: 'booster-bundle-prismatic-evolutions',
    name: 'Booster Bundle — Prismatic Evolutions',
    category: SELLADOS,
    price_ars: 89000,
    image_url: '/products/booster-bundle-prismatic.webp',
    finish: '',
    stock_quantity: 5,
    description: 'Bundle sellado con 6 sobres de Scarlet & Violet — Prismatic Evolutions.',
  })
);

export const MOCK_CATEGORIES = [SINGLES, SLABS, SELLADOS, ACCESORIOS];

export const MOCK_CONDITIONS = [
  { id: 1, name: 'Mint' },
  { id: 2, name: 'Near Mint' },
  { id: 3, name: 'Lightly Played' },
  { id: 4, name: 'Moderately Played' },
  { id: 5, name: 'Damaged' },
];

export const MOCK_CERTIFICATION_ENTITIES = [
  { id: 1, name: 'PSA', abbreviation: 'PSA' },
  { id: 2, name: 'CGC', abbreviation: 'CGC' },
  { id: 3, name: 'BGS', abbreviation: 'BGS' },
];

/** /payments/config/ — mismo shape que Crack. */
export const MOCK_PAYMENT_CONFIG = {
  card_surcharge_enabled: true,
  card_surcharge_percent: 10,
  mercadopago_enabled: true,
  transfer: { bank: 'Banco Mock', holder: 'PokeShop Coast', cbu: '0000000000000000000000', alias: 'POKESHOP.COAST' },
  free_shipping: { enabled: true, min_total: 300000 },
  shipping_prices: {
    branch: { ba: { normal: 6500, express: 9500 }, province: { normal: 8900, express: 12900 } },
    home: { ba: { normal: 8500 }, province: { normal: 11900 } },
  },
};
