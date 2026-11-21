import Image from 'next/image';
import { CONTACT } from '@/config/site';
import DevAccess from './DevAccess';

export const DEFAULT_TITLE = 'Volvemos pronto';
export const DEFAULT_MESSAGE = 'Estamos haciendo unos ajustes. Muy pronto vas a poder ver la tienda.';

/**
 * Abanico de slabs (de atrás hacia adelante). Coordenadas en un lienzo de
 * 640×520 (más margen): el CSS las pasa a porcentajes y el abanico escala solo.
 * `wide`: solo se ven en pantallas anchas (en mobile quedan tres).
 */
const SLABS = [
  { file: 'umbreon-v', alt: 'Umbreon V PSA 10', cx: 70, cy: 280, h: 380, rot: -15, wide: true },
  { file: 'raikou-v', alt: 'Raikou V PSA 10', cx: 570, cy: 280, h: 380, rot: 15, wide: true },
  { file: 'pikachu-skull', alt: 'Pikachu Team Skull PSA 10', cx: 190, cy: 262, h: 420, rot: -7 },
  { file: 'pikachu-van-gogh', alt: 'Pikachu con sombrero gris PSA 10', cx: 450, cy: 262, h: 420, rot: 7 },
  { file: 'charizard-holo', alt: 'Charizard Holo PSA 8', cx: 320, cy: 250, h: 460, rot: 0, front: true },
];
// Margen de 50 a cada lado: las de las puntas giradas no se salen del lienzo.
const STAGE = { w: 740, h: 540, x: 50 };

function slabStyle({ cx, cy, h, rot }, index) {
  const w = h * 0.6;
  return {
    left: `${((cx + STAGE.x - w / 2) / STAGE.w) * 100}%`,
    top: `${((cy - h / 2) / STAGE.h) * 100}%`,
    width: `${(w / STAGE.w) * 100}%`,
    '--rot': `${rot}deg`,
    '--delay': `${index * 90}ms`,
  };
}

/**
 * Sitio apagado desde el admin (mantenimiento, desarrollo o suspensión): se
 * muestra en todas las URLs. Título y subtítulo salen del admin; vacíos, los
 * de por defecto.
 */
export default function MaintenancePage({ title, message }) {
  return (
    <main className="maintenance">
      <span className="wordmark maintenance__brand">
        <span className="wordmark__name">PokeShop</span>
        <span className="wordmark__sub">Coast</span>
      </span>

      <div className="maintenance__layout">
        <div className="maintenance__stage" aria-hidden="true">
          <div className="maintenance__aura" />
          <div className="maintenance__light" />
          {SLABS.map((slab, index) => (
            <div key={slab.file} className={`maintenance__slab ${slab.wide ? 'is-wide' : ''}`} style={slabStyle(slab, index)}>
              <Image
                src={`/maintenance/${slab.file}.webp`}
                alt=""
                width={552}
                height={920}
                sizes="(min-width: 1024px) 280px, 45vw"
                priority={slab.front}
              />
            </div>
          ))}
        </div>

        <div className="maintenance__copy">
          <span className="maintenance__accent" />
          <h1 className="maintenance__title">{title || DEFAULT_TITLE}</h1>
          <p className="maintenance__message">{message || DEFAULT_MESSAGE}</p>
        </div>
      </div>

      <footer className="maintenance__footer">
        <p>
          ¿Tenés un pedido en curso? Escribinos por{' '}
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a> o{' '}
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>.
        </p>
        <DevAccess />
      </footer>
    </main>
  );
}
