/** Contenedor de las pantallas de auth: tarjeta centrada con el sol de fondo. */
export default function AuthCard({ eyebrow, title, subtitle, children }) {
  return (
    <section className="container-site relative flex justify-center overflow-hidden py-10 sm:py-20">
      <div className="sunset -top-10 left-1/2 w-[min(440px,100%)] -translate-x-1/2 opacity-30" style={{ '--stripe': '20px' }} aria-hidden="true" />
      <div className="fade-up relative w-full max-w-md border border-uns-hairline bg-white p-6 shadow-card sm:p-10">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="mt-2 text-[14px] text-coast-gray">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
