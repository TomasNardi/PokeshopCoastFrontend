'use client';
import { useEffect } from 'react';
import { SIGNATURE_ART, SIGNATURE_CREDIT } from '@/config/signature';

/**
 * Inserta la firma como comentario HTML ARRIBA DE TODO del documento
 * (antes de <html>), como hacen los estudios: se ve en DevTools → Elements.
 * React no puede renderizar comentarios, así que se agrega por DOM al cargar.
 * Idempotente: no la duplica si ya está (StrictMode, navegaciones).
 */
export function insertSignatureComment(doc = document) {
  const exists = [...doc.childNodes].some(
    (node) => node.nodeType === Node.COMMENT_NODE && node.data.includes(SIGNATURE_CREDIT)
  );
  if (exists) return false;
  const comment = doc.createComment(`${SIGNATURE_ART}\n  ${SIGNATURE_CREDIT}\n\n`);
  doc.insertBefore(comment, doc.documentElement);
  return true;
}

export default function ConsoleSignature() {
  useEffect(() => {
    insertSignatureComment();
  }, []);
  return null;
}
