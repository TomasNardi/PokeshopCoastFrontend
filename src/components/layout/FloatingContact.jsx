'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { buildWhatsappMessage, WHATSAPP_DISPLAY, whatsappUrl } from '@/config/whatsapp';
import WhatsappIcon from './WhatsappIcon';

/**
 * Botón flotante de WhatsApp: solo el logo, sin adornos.
 * El mensaje se arma según la página (en un producto manda el link).
 */
export default function FloatingContact() {
  const pathname = usePathname();
  const [href, setHref] = useState(() => whatsappUrl(buildWhatsappMessage({ pathname })));

  // La URL completa solo existe en el browser.
  useEffect(() => {
    setHref(whatsappUrl(buildWhatsappMessage({ pathname, pageUrl: window.location.href })));
  }, [pathname]);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${WHATSAPP_DISPLAY}`} className="wa-float">
      <WhatsappIcon size={30} />
    </a>
  );
}
