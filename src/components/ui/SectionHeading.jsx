import Link from 'next/link';

export default function SectionHeading({ title, href, linkLabel = 'Ver todo' }) {
  return (
    <div className="mb-[15px] flex items-end justify-between gap-6">
      <h2 className="section-heading">{title}</h2>
      {href && (
        <Link href={href} className="text-[12px] font-bold uppercase tracking-[0.1em] text-uns-muted hover:text-black">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
