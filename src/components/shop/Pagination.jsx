import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Páginas a mostrar: primera, última y las vecinas de la actual, con "…" en
 * los saltos. Con 100+ páginas entra igual en un celular.
 *   pageWindow(50, 106, 1) → [1, '…', 49, 50, 51, '…', 106]
 */
export function pageWindow(page, totalPages, radius = 1) {
  const pages = new Set([1, totalPages]);
  for (let n = page - radius; n <= page + radius; n += 1) if (n >= 1 && n <= totalPages) pages.add(n);
  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (i > 0) {
      const gap = n - sorted[i - 1];
      if (gap === 2) out.push(n - 1); // un solo número escondido: se muestra en vez de "…"
      else if (gap > 2) out.push('…');
    }
    out.push(n);
  });
  return out;
}

const item = 'flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-[13px] font-bold';

/** Paginación por URL (server component): conserva los filtros actuales. */
export default function Pagination({ page, totalPages, filters, basePath = '/tienda' }) {
  if (totalPages <= 1) return null;
  const hrefFor = (n) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (key !== 'page' && value) qs.set(key, value);
    if (n > 1) qs.set('page', String(n));
    const str = qs.toString();
    return `${basePath}${str ? `?${str}` : ''}`;
  };
  const arrow = (n, label, Icon) =>
    n >= 1 && n <= totalPages ? (
      <Link href={hrefFor(n)} aria-label={label} className={`${item} text-coast-ink hover:bg-coast-sand/60`}>
        <Icon size={18} />
      </Link>
    ) : (
      <span aria-hidden className={`${item} text-coast-ink/25`}><Icon size={18} /></span>
    );

  return (
    <nav aria-label="Paginación" className="mt-14 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      {arrow(page - 1, 'Página anterior', ChevronLeft)}
      {pageWindow(page, totalPages).map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} aria-hidden className={`${item} text-coast-gray`}>…</span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`${item} ${n === page ? 'bg-coast-ink text-white' : 'text-coast-ink hover:bg-coast-sand/60'}`}
          >
            {n}
          </Link>
        ),
      )}
      {arrow(page + 1, 'Página siguiente', ChevronRight)}
    </nav>
  );
}
