import Link from 'next/link';

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

  return (
    <nav aria-label="Paginación" className="mt-14 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold ${
            n === page ? 'bg-coast-ink text-white' : 'text-coast-ink hover:bg-coast-sand/60'
          }`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
