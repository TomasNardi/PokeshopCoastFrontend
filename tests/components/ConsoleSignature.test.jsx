import { describe, expect, it } from 'vitest';
import { insertSignatureComment } from '@/components/layout/ConsoleSignature';
import { SIGNATURE_ART } from '@/config/signature';

describe('firma en el HTML', () => {
  it('queda como primer nodo del documento (arriba de <html>) y no se duplica', () => {
    expect(insertSignatureComment(document)).toBe(true);
    expect(insertSignatureComment(document)).toBe(false);
    const first = document.childNodes[0].nodeType === Node.DOCUMENT_TYPE_NODE ? document.childNodes[1] : document.childNodes[0];
    expect(first.nodeType).toBe(Node.COMMENT_NODE);
    expect(first.data).toContain(SIGNATURE_ART);
    expect(first.data).toContain('Ketson');
    expect(first.nextSibling).toBe(document.documentElement);
  });

  it('conserva las barras invertidas del arte (no se interpretan como escapes)', () => {
    expect(SIGNATURE_ART).toContain(String.raw`\ \_\ \_\  \ \_____\ `);
  });
});
