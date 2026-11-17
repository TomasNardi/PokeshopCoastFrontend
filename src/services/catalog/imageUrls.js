import { env } from '@/config/env';

const IMAGE_KEYS = ['image_url', 'image_url_thumb', 'image_url_medium'];

/**
 * El backend devuelve URLs absolutas (las necesitan los mails). Las imágenes que
 * vive en el propio front (`/products/…`, `/mock/…`) vuelven a ser relativas:
 * el optimizador de Next rechaza su propio origen como imagen remota.
 */
export function localizeImageUrl(url, origin = env.siteUrl) {
  if (typeof url !== 'string' || !origin) return url;
  const base = origin.replace(/\/+$/, '');
  return url.startsWith(`${base}/`) ? url.slice(base.length) : url;
}

export function localizeProductImages(product, origin) {
  if (!product || typeof product !== 'object') return product;
  const out = { ...product };
  for (const key of IMAGE_KEYS) if (key in out) out[key] = localizeImageUrl(out[key], origin);
  if (Array.isArray(out.images)) {
    out.images = out.images.map((img) =>
      typeof img === 'string'
        ? localizeImageUrl(img, origin)
        : img && typeof img === 'object'
          ? Object.fromEntries(Object.entries(img).map(([k, v]) => [k, IMAGE_KEYS.includes(k) || k === 'url' ? localizeImageUrl(v, origin) : v]))
          : img,
    );
  }
  return out;
}

/** Aplica a una respuesta paginada ({results}), a una lista o a un producto. */
export function localizeImages(data, origin) {
  if (Array.isArray(data)) return data.map((p) => localizeProductImages(p, origin));
  if (data && Array.isArray(data.results)) return { ...data, results: data.results.map((p) => localizeProductImages(p, origin)) };
  return localizeProductImages(data, origin);
}
