'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, ORDERING_OPTIONS, splitValues, toggleValue } from '@/domain/catalog';
import { LANGUAGES } from '@/domain/productTraits';
import { getServices } from '@/services/container';
import { signalNavigationStart } from '@/components/layout/NavigationProgress';

const SETS_PREVIEW = 8;
const FACET_PARAMS = ['set', 'rarity', 'condition', 'language'];

const normalize = (text) => (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Lista con casillas: cada opción con su cantidad en stock. */
function OptionList({ options, selected, onToggle, emptyText = 'Sin opciones con stock para esta búsqueda.' }) {
  if (!options.length) return <p className="px-1 py-3 text-[12px] text-uns-muted">{emptyText}</p>;
  return (
    <ul className="space-y-0.5">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <li key={o.value}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onToggle(o.value)}
              className="flex w-full items-center gap-3 px-2 py-2 text-left text-[13px] transition-colors hover:bg-uns-stage"
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center border ${on ? 'border-black bg-black text-white' : 'border-uns-border'}`}>
                {on && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {o.label}
                {o.hint && <span className="ml-1.5 text-[11px] text-uns-muted">{o.hint}</span>}
              </span>
              <span className="text-[11px] tabular-nums text-uns-muted">{o.count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Expansiones: las de más stock y un buscador para el resto (son cientos). */
function SetOptions({ sets, selected, onToggle }) {
  const [query, setQuery] = useState('');
  const [all, setAll] = useState(false);
  const term = normalize(query.trim());
  const filtered = useMemo(() => {
    if (!term) return sets;
    return sets.filter((s) => normalize(`${s.name} ${s.abbreviation}`).includes(term));
  }, [sets, term]);
  // Las elegidas siempre a la vista, aunque no estén entre las primeras.
  const visible = term || all ? filtered : [...sets.filter((s) => selected.includes(s.slug)), ...sets.filter((s) => !selected.includes(s.slug)).slice(0, SETS_PREVIEW)];
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 border border-uns-border px-3 focus-within:border-black">
        <Search size={14} className="shrink-0 text-uns-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Buscar entre ${sets.length} expansiones`}
          aria-label="Buscar expansión"
          className="w-full bg-transparent py-2.5 text-[13px] outline-none"
        />
      </label>
      <div className="max-h-72 overflow-y-auto pr-1">
        <OptionList
          options={visible.map((s) => ({ value: s.slug, label: s.name, hint: s.abbreviation, count: s.count }))}
          selected={selected}
          onToggle={onToggle}
          emptyText="No hay stock de esa expansión."
        />
      </div>
      {!term && !all && sets.length > SETS_PREVIEW && (
        <button type="button" onClick={() => setAll(true)} className="w-full py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] underline underline-offset-2">
          Ver las {sets.length} expansiones
        </button>
      )}
    </div>
  );
}

/** Botón con menú desplegable (en mobile ocupa todo el ancho). */
function Dropdown({ label, count, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div ref={ref} className="sm:relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
          count ? 'border-black bg-black text-white' : 'border-uns-border bg-white hover:border-black'
        }`}
      >
        {label}
        {count > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] text-black">{count}</span>}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-4 right-4 z-30 mt-2 border border-black bg-white p-3 shadow-xl sm:left-0 sm:right-auto sm:w-80">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [facets, setFacets] = useState(null);

  // Opciones de los filtros para lo que se está viendo (sin página ni orden: no cambian las opciones).
  const facetQuery = useMemo(() => {
    const qs = new URLSearchParams(params.toString());
    qs.delete('page');
    qs.delete('ordering');
    return qs.toString();
  }, [params]);
  useEffect(() => {
    let alive = true;
    getServices().catalog.getFacets(Object.fromEntries(new URLSearchParams(facetQuery))).then((data) => alive && setFacets(data));
    return () => { alive = false; };
  }, [facetQuery]);

  const push = (next) => {
    next.delete('page');
    signalNavigationStart();
    startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false }));
  };
  const setParam = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  };
  const toggleParam = (key, value) => setParam(key, toggleValue(params.get(key), value));
  const selected = (key) => splitValues(params.get(key));

  const chip = (on) =>
    `border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
      on ? 'border-black bg-black text-white' : 'border-uns-border bg-white text-black hover:border-black'
    }`;
  const flag = (key, value) => setParam(key, params.get(key) === value ? '' : value);

  // Etiquetas legibles de lo elegido (para los chips de "filtros activos").
  const labelFor = {
    set: (v) => facets?.sets.find((s) => s.slug === v)?.name || v,
    rarity: (v) => v,
    condition: (v) => facets?.conditions.find((c) => c.value === v)?.name || v,
    language: (v) => LANGUAGES[v]?.label || v,
  };
  const activeChips = FACET_PARAMS.flatMap((key) => selected(key).map((value) => ({ key, value, label: labelFor[key](value) })));
  // La categoría ya se ve en los botones de arriba: «Limpiar todo» aparece con algún filtro más.
  const hasFilters = [...params.keys()].some((k) => !['page', 'ordering', 'category'].includes(k));

  const sets = facets?.sets || [];
  const rarities = facets?.rarities || [];
  const conditions = facets?.conditions || [];
  const languages = facets?.languages || [];

  return (
    <div className={`space-y-4 transition-opacity ${pending ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.slug} type="button" className={chip(params.get('category') === c.slug)} onClick={() => flag('category', c.slug)}>
            {c.name}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-uns-border sm:block" />
        <button type="button" className={chip(params.get('has_discount') === 'true')} onClick={() => flag('has_discount', 'true')}>
          En oferta
        </button>
        <button type="button" className={chip(params.get('in_stock') === 'true')} onClick={() => flag('in_stock', 'true')}>
          Con stock
        </button>
      </div>

      <div className="relative flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-uns-muted">
          <SlidersHorizontal size={14} /> Filtrar
        </span>
        {sets.length > 0 && (
          <Dropdown label="Expansión" count={selected('set').length}>
            <SetOptions sets={sets} selected={selected('set')} onToggle={(v) => toggleParam('set', v)} />
          </Dropdown>
        )}
        {rarities.length > 0 && (
          <Dropdown label="Rareza" count={selected('rarity').length}>
            <div className="max-h-80 overflow-y-auto pr-1">
              <OptionList options={rarities.map((r) => ({ value: r.value, label: r.value, count: r.count }))} selected={selected('rarity')} onToggle={(v) => toggleParam('rarity', v)} />
            </div>
          </Dropdown>
        )}
        {conditions.length > 0 && (
          <Dropdown label="Estado" count={selected('condition').length}>
            <OptionList options={conditions.map((c) => ({ value: c.value, label: c.name, hint: c.value, count: c.count }))} selected={selected('condition')} onToggle={(v) => toggleParam('condition', v)} />
          </Dropdown>
        )}
        {languages.length > 0 && (
          <Dropdown label="Idioma" count={selected('language').length}>
            <OptionList options={languages.map((l) => ({ value: l.value, label: LANGUAGES[l.value]?.label || l.value, count: l.count }))} selected={selected('language')} onToggle={(v) => toggleParam('language', v)} />
          </Dropdown>
        )}
        <select aria-label="Ordenar" className="input ml-auto w-auto py-2 text-[13px]" value={params.get('ordering') || ''} onChange={(e) => setParam('ordering', e.target.value)}>
          {ORDERING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {(activeChips.length > 0 || hasFilters) && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <button
              key={`${c.key}:${c.value}`}
              type="button"
              onClick={() => toggleParam(c.key, c.value)}
              className="inline-flex items-center gap-1.5 bg-uns-stage px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-black hover:text-white"
              aria-label={`Quitar filtro ${c.label}`}
            >
              {c.label} <X size={12} />
            </button>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                const category = params.get('category');
                signalNavigationStart();
                startTransition(() => router.push(category ? `${pathname}?category=${category}` : pathname, { scroll: false }));
              }}
              className="inline-flex items-center gap-1 px-1 text-[12px] font-bold uppercase tracking-[0.1em] text-coast-red-dark hover:underline"
            >
              <X size={13} /> Limpiar todo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
