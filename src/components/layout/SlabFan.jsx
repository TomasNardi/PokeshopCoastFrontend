import Image from 'next/image';

/**
 * Abanico de slabs iluminado (de atrás hacia adelante). Lo comparten la página
 * de mantenimiento y la de lanzamiento. Coordenadas en un lienzo de 640×520
 * (más margen): el CSS las pasa a porcentajes y el abanico escala solo.
 * `wide`: solo se ven en pantallas anchas (en mobile quedan tres).
 */
const SLABS = [
  { file: 'umbreon-v', cx: 70, cy: 280, h: 380, rot: -15, wide: true },
  { file: 'raikou-v', cx: 570, cy: 280, h: 380, rot: 15, wide: true },
  { file: 'pikachu-skull', cx: 190, cy: 262, h: 420, rot: -7 },
  { file: 'pikachu-van-gogh', cx: 450, cy: 262, h: 420, rot: 7 },
  { file: 'charizard-holo', cx: 320, cy: 250, h: 460, rot: 0, front: true },
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

export default function SlabFan({ className = '' }) {
  return (
    <div className={`maintenance__stage ${className}`} aria-hidden="true">
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
  );
}
