import Link from 'next/link';

/** Botones del tema: rectos, Roboto 700 12px, mayúsculas, tracking 0.075em. */
const VARIANTS = {
  primary: 'border border-black bg-black text-white hover:border-coast-red hover:bg-coast-red',
  dark: 'border border-black bg-black text-white hover:border-coast-red hover:bg-coast-red',
  accent: 'border border-coast-red bg-coast-red text-white hover:border-coast-red-dark hover:bg-coast-red-dark',
  outline: 'border border-black text-black hover:bg-black hover:text-white',
  light: 'border border-uns-bg bg-uns-bg text-black hover:bg-transparent hover:text-white',
  ghost: 'text-black hover:bg-uns-stage',
  google: 'border border-uns-border bg-white text-black hover:border-black',
};

const SIZES = {
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-6 py-3 text-[12px]',
  lg: 'px-7 py-3.5 text-[12px]',
};

const base =
  'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.075em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50';

export function buttonClass({ variant = 'primary', size = 'md', block = false, className = '' } = {}) {
  return [base, VARIANTS[variant], SIZES[size], block ? 'w-full' : '', className].filter(Boolean).join(' ');
}

/** Botón o link con el mismo look. `href` → <Link>. */
export default function Button({ href, variant, size, block, className, children, ...props }) {
  const cls = buttonClass({ variant, size, block, className });
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
