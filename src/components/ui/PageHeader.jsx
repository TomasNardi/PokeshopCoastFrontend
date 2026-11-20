export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="container-site pb-8 pt-10 md:pb-10 md:pt-14">
      {eyebrow && <p className="eyebrow fade-up mb-3">{eyebrow}</p>}
      <h1 className="fade-up break-words font-heading text-[34px] font-bold leading-none sm:text-[40px] md:text-[64px]" style={{ '--delay': '0.08s' }}>{title}</h1>
      {children && <div className="fade-up mt-4 max-w-2xl text-[15px] leading-relaxed text-uns-muted">{children}</div>}
    </header>
  );
}
