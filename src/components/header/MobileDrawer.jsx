'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';
import { CONTACT } from '@/config/site';
import Wordmark from '@/components/layout/Wordmark';

/** Menú mobile: panel desde la izquierda con submenús en acordeón. */
export default function MobileDrawer({ menu, open, onClose, accountHref }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__underlay" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-label="Menú">
        <div className="drawer__head">
          <Wordmark />
          <button type="button" onClick={onClose} aria-label="Cerrar menú" className="p-2" tabIndex={open ? 0 : -1}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <ul className="drawer__menu">
          {menu.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <li key={item.id} className="drawer__item">
                {item.links ? (
                  <>
                    <button
                      type="button"
                      className="drawer__toplink"
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      tabIndex={open ? 0 : -1}
                    >
                      {item.label}
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`drawer__sub ${isOpen ? 'is-open' : ''}`}>
                      <div className="overflow-hidden">
                        {item.links.map((link) => (
                          <Link key={link.href + link.label} href={link.href} onClick={onClose} className="drawer__sublink" tabIndex={open && isOpen ? 0 : -1}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={item.href} onClick={onClose} className={`drawer__toplink ${item.highlight ? 'text-coast-red' : ''}`} tabIndex={open ? 0 : -1}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="drawer__foot">
          <Link href={accountHref} onClick={onClose} tabIndex={open ? 0 : -1}>Mi cuenta</Link>
          <Link href="/envios" onClick={onClose} tabIndex={open ? 0 : -1}>Envíos</Link>
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>WhatsApp</a>
        </div>
      </aside>
    </div>
  );
}
