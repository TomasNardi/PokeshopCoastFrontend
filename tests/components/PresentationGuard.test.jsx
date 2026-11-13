import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import PresentationGuard, { isBlockedHref } from '@/components/layout/PresentationGuard';

const ORIGIN = 'http://localhost:3000';
const anchor = (href, target) => {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  if (target) a.target = target;
  return a;
};

describe('isBlockedHref', () => {
  it('bloquea cualquier sección interna que no sea la home', () => {
    ['/tienda', '/tienda?category=slabs', '/cuenta/ingresar', '/tienda/charizard', `${ORIGIN}/carrito`, '/?q=x'].forEach((href) =>
      expect(isBlockedHref(anchor(href), ORIGIN)).toBe(true)
    );
  });

  it('deja la home, las anclas y los links externos (redes, WhatsApp)', () => {
    ['/', '#nuevos-ingresos', '/#nuevos-ingresos', 'https://www.instagram.com/pokeshopcoast/', 'https://wa.me/5492257554759'].forEach((href) =>
      expect(isBlockedHref(anchor(href), ORIGIN)).toBe(false)
    );
    expect(isBlockedHref(anchor('/tienda', '_blank'), ORIGIN)).toBe(false);
  });
});

describe('<PresentationGuard />', () => {
  it('cancela el clic en un link interno pero deja correr los handlers (cierra menús)', () => {
    let handled = false;
    render(
      <>
        <PresentationGuard />
        <a href="/tienda" onClick={() => (handled = true)}>Tienda</a>
      </>
    );
    const link = document.querySelector('a[href="/tienda"]');
    const allowed = fireEvent.click(link);
    expect(allowed).toBe(false); // defaultPrevented
    expect(handled).toBe(true);
  });

  it('corta el submit de la búsqueda antes de que llegue a React; el newsletter sigue andando', () => {
    let searched = false;
    let subscribed = false;
    render(
      <>
        <PresentationGuard />
        <form role="search" onSubmit={(e) => { e.preventDefault(); searched = true; }} />
        <form aria-label="newsletter" onSubmit={(e) => { e.preventDefault(); subscribed = true; }} />
      </>
    );
    fireEvent.submit(document.querySelector('form[role="search"]'));
    fireEvent.submit(document.querySelector('form[aria-label="newsletter"]'));
    expect(searched).toBe(false);
    expect(subscribed).toBe(true);
  });
});
