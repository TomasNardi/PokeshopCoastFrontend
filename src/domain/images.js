/**
 * Versiones de una foto nuestra (bucket R2): cada imagen se guarda como
 * `<hash>.webp` con sus hermanas `<hash>_medium.webp` y `<hash>_thumb.webp`
 * (mismo esquema que `rendition_url` del backend). Usarlas en vez de la grande
 * es la diferencia entre bajar ~300 KB o ~44 KB por miniatura (medido): la grilla, el
 * carrito y las miniaturas piden la chica; la ficha deja elegir al navegador.
 *
 * Una URL externa, de mocks o que ya es una versión devuelve null: se usa tal cual.
 */

// Catálogo (TCGplayer) y versiones sin fondo: 200 / 600 / 660 px.
// Fotos subidas desde el admin: 320 / 800 / 1400 px (pk_images.js; las viejas, 1600).
const CATALOG_WIDTHS = { thumb: 200, medium: 600, full: 660 };
const UPLOAD_WIDTHS = { thumb: 320, medium: 800, full: 1400 };

const isOurBucket = (url) => /^https:\/\/[^/]+\.r2\.dev\//.test(url) || /\/media\//.test(url);

export function imageRenditions(url) {
  if (typeof url !== 'string' || !url.endsWith('.webp') || /_(thumb|medium)\.webp$/.test(url) || !isOurBucket(url)) {
    return null;
  }
  const base = url.slice(0, -'.webp'.length);
  const widths = /\/(singles|sin-fondo)\//.test(url) ? CATALOG_WIDTHS : UPLOAD_WIDTHS;
  const thumb = `${base}_thumb.webp`;
  const medium = `${base}_medium.webp`;
  return {
    thumb,
    medium,
    full: url,
    srcSet: `${thumb} ${widths.thumb}w, ${medium} ${widths.medium}w, ${url} ${widths.full}w`,
  };
}

/** La versión chica si existe el esquema; si no, la misma URL. */
export const thumbOf = (url) => imageRenditions(url)?.thumb || url;

/** Qué ancho ocupa la imagen en pantalla, para que el navegador elija la versión. */
export const IMAGE_SIZES = {
  card: '(max-width: 749px) 50vw, (max-width: 1099px) 33vw, 25vw',
  detail: '(max-width: 1023px) 100vw, 50vw',
};
