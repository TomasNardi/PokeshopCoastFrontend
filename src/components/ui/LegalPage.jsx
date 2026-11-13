import PageHeader from './PageHeader';

/** Plantilla para páginas legales. El texto final lo provee el cliente. */
export default function LegalPage({ title, sections }) {
  return (
    <>
      <PageHeader eyebrow="Legales" title={title} />
      <div className="container-site max-w-3xl space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
            <p className="text-[14px] leading-relaxed text-coast-gray">{s.body}</p>
          </section>
        ))}
        <p className="text-[12px] text-coast-mist">Texto provisorio — pendiente de revisión legal del cliente.</p>
      </div>
    </>
  );
}
