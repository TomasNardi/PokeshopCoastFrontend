'use client';
import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { CATEGORIES, ORDERING_OPTIONS } from '@/domain/catalog';
import { CONDITION_FILTERS } from '@/domain/conditions';
import { LANGUAGES } from '@/domain/productTraits';
import { signalNavigationStart } from '@/components/layout/NavigationProgress';

/**
 * Los filtros viven en la URL (compartibles, y el botón atrás los respeta).
 * Cambiar un filtro resetea la página a 1.
 */
export default function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    signalNavigationStart();
    startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false }));
  };

  const toggle = (key, value) => setParam(key, params.get(key) === value ? '' : value);
  const active = (key, value) => params.get(key) === value;
  const chip = (on) =>
    `border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
      on ? 'border-black bg-black text-white' : 'border-uns-border bg-white text-black hover:border-black'
    }`;
  const hasFilters = [...params.keys()].some((k) => k !== 'page' && k !== 'ordering');

  return (
    <div className={`space-y-5 transition-opacity ${pending ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.slug} type="button" className={chip(active('category', c.slug))} onClick={() => toggle('category', c.slug)}>
            {c.name}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-uns-border sm:block" />
        <button type="button" className={chip(active('has_discount', 'true'))} onClick={() => toggle('has_discount', 'true')}>
          En oferta
        </button>
        <button type="button" className={chip(active('in_stock', 'true'))} onClick={() => toggle('in_stock', 'true')}>
          Con stock
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Estado" className="input w-auto py-2 text-[13px]" value={params.get('condition') || ''} onChange={(e) => setParam('condition', e.target.value)}>
          <option value="">Estado: todos</option>
          {CONDITION_FILTERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select aria-label="Idioma" className="input w-auto py-2 text-[13px]" value={params.get('language') || ''} onChange={(e) => setParam('language', e.target.value)}>
          <option value="">Idioma: todos</option>
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <option key={code} value={code}>
              {lang.label}
            </option>
          ))}
        </select>
        <select aria-label="Ordenar" className="input w-auto py-2 text-[13px]" value={params.get('ordering') || ''} onChange={(e) => setParam('ordering', e.target.value)}>
          {ORDERING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              signalNavigationStart();
              startTransition(() => router.push(pathname, { scroll: false }));
            }}
            className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.1em] text-coast-red-dark hover:underline"
          >
            <X size={13} /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
