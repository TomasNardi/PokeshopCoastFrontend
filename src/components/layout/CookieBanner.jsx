'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export const CONSENT_KEY = 'psc-cookie-consent';

const readConsent = () => {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
};

/**
 * Aviso de cookies (mismo texto que el sitio anterior). Guarda la elección y
 * avisa por evento + Consent Mode de Google si ya está cargado: cuando se
 * integre Analytics/Ads, el script lee `psc-cookie-consent` y escucha
 * `psc:cookie-consent` sin tocar este componente.
 */
export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readConsent()) {
      const timer = setTimeout(() => setOpen(true), 800); // no compite con la carga
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const decide = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* sin storage: se cierra solo por esta visita */
    }
    if (typeof window.gtag === 'function' && value === 'accepted') {
      window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    }
    window.dispatchEvent(new CustomEvent('psc:cookie-consent', { detail: value }));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div role="region" aria-label="Aviso de cookies" className="cookie-banner fade-up">
      <p className="text-[13px] leading-relaxed text-coast-ink">
        Usamos cookies para mejorar la experiencia de nuestros usuarios. Para más información sobre las cookies y cómo
        gestionarlas consultá nuestra{' '}
        <Link href="/privacidad" className="font-semibold underline underline-offset-4">Política de Privacidad</Link>.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => decide('accepted')} className="bg-coast-ink px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-white hover:opacity-90">
          Aceptar
        </button>
      </div>
      <button type="button" onClick={() => decide('dismissed')} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-coast-gray hover:text-coast-ink" aria-label="Cerrar aviso de cookies">
        <X size={16} />
      </button>
    </div>
  );
}
