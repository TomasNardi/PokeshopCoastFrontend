'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { getServices } from '@/services/container';
import { POPULAR_SEARCH_LINKS } from '@/config/navigation';
import { productView } from '@/domain/product';
import { formatPrice } from '@/domain/money';
import { linkStaggerDelays } from './menuData';
import { LoadingRegion, Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { signalNavigationStart } from '@/components/layout/NavigationProgress';
import { thumbOf } from '@/domain/images';

const MIN_CHARS = 2;

function ResultCardSkeleton() {
  return (
    <span className="search-card" aria-hidden="true">
      <Skeleton as="span" className="search-card__media rounded-none" />
      <span className="search-card__title"><SkeletonText width="80%" /></span>
      <span className="search-card__category"><SkeletonText width="50%" /></span>
      <span className="search-card__price"><SkeletonText width="30%" /></span>
    </span>
  );
}

function ResultCard({ product, index, onNavigate }) {
  const view = productView(product);
  return (
    <Link href={view.href} onClick={onNavigate} className="search-card" style={{ transitionDelay: `${300 + index * 60}ms` }}>
      <span className="search-card__media">
        {view.imageUrl && <img src={thumbOf(view.imageUrl)} width={600} height={838} decoding="async" onError={(e) => { if (e.currentTarget.src !== view.imageUrl) e.currentTarget.src = view.imageUrl; }} alt="" loading="lazy" />}
      </span>
      <span className="search-card__title">{view.name}</span>
      <span className="search-card__category">{view.subtitle}</span>
      <span className="search-card__price">{formatPrice(view.price)}</span>
    </Link>
  );
}

/**
 * Búsqueda desplegable (como la de unsobremas): input grande + "Populares" +
 * "Productos populares". Al tipear busca en vivo (debounce) y Enter lleva a la tienda.
 */
export default function SearchPopdown({ open, onClose, popularProducts = [] }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const delays = linkStaggerDelays(POPULAR_SEARCH_LINKS.length);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery('');
      setResults(null);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_CHARS) {
      setResults(null);
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const page = await getServices().catalog.getProductPage({ search: q });
        if (!cancelled) setResults(page.items.slice(0, 4));
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const submit = (event) => {
    event.preventDefault();
    const q = query.trim();
    signalNavigationStart();
    router.push(q ? `/tienda?search=${encodeURIComponent(q)}` : '/tienda');
    onClose();
  };

  const products = results ?? popularProducts.slice(0, 4);

  return (
    <div className={`mega search-pop ${open ? 'is-visible' : ''}`} aria-hidden={!open} role="dialog" aria-label="Buscar">
      <form onSubmit={submit} role="search" className="search-pop__form">
        <Search size={22} strokeWidth={2} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="BUSCAR"
          aria-label="Buscar productos"
          tabIndex={open ? 0 : -1}
          className="search-pop__input"
        />
        <button type="button" onClick={onClose} aria-label="Cerrar búsqueda" tabIndex={open ? 0 : -1} className="search-pop__close">
          <X size={22} strokeWidth={2} />
        </button>
      </form>

      <div className="search-pop__layout">
        <div className="search-pop__column">
          <p className="search-pop__heading">Populares</p>
          {POPULAR_SEARCH_LINKS.map((link, index) => (
            <Link key={link.href} href={link.href} onClick={onClose} className="mega__link" style={{ transitionDelay: `${delays[index]}ms` }} tabIndex={open ? 0 : -1}>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
        <div className="search-pop__column search-pop__column--wide">
          <p className="search-pop__heading">{results || searching ? `Resultados para “${query.trim()}”` : 'Productos populares'}</p>
          {searching ? (
            <LoadingRegion label="Buscando" className="search-pop__grid">
              {[0, 1, 2, 3].map((i) => (
                <ResultCardSkeleton key={i} />
              ))}
            </LoadingRegion>
          ) : products.length ? (
            <div className="search-pop__grid">
              {products.map((product, index) => (
                <ResultCard key={product.id} product={product} index={index} onNavigate={onClose} />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-uns-muted">No encontramos productos para esa búsqueda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
