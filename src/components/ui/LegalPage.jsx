import PageHeader from './PageHeader';

/**
 * Plantilla para páginas legales.
 *
 *   intro:    párrafos antes de las secciones
 *   sections: [{ title, body }]  — un párrafo (formato simple)
 *             [{ title, blocks }] — varios: string = párrafo,
 *                                   { list: [...] } = viñetas,
 *                                   { strong: '...' } = párrafo destacado
 *   updated:  "Última actualización: …"
 *   final:    true cuando el texto ya es el definitivo del cliente
 */
function Block({ block }) {
  if (typeof block === 'string') return <p>{block}</p>;
  if (block.list) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {block.list.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  if (block.strong) return <p className="font-bold text-coast-ink">{block.strong}</p>;
  return null;
}

export default function LegalPage({ title, intro = [], sections, updated, final = false }) {
  return (
    <>
      <PageHeader eyebrow="Legales" title={title} />
      <div className="container-site max-w-3xl space-y-8 pb-16">
        {updated && <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-coast-mist">{updated}</p>}
        {intro.length > 0 && (
          <div className="space-y-4 text-[14px] leading-relaxed text-coast-gray">
            {intro.map((p) => <p key={p}>{p}</p>)}
          </div>
        )}
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-coast-gray">
              {s.blocks ? s.blocks.map((b, i) => <Block key={i} block={b} />) : <p>{s.body}</p>}
            </div>
          </section>
        ))}
        {!final && <p className="text-[12px] text-coast-mist">Texto provisorio — pendiente de revisión legal del cliente.</p>}
      </div>
    </>
  );
}
