export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="container-site pb-8 pt-10 md:pb-10 md:pt-14">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="font-heading text-[40px] font-bold leading-none md:text-[64px]">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-uns-muted">{children}</div>}
    </header>
  );
}
