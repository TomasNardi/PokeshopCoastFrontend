'use client';
import { useBackForwardRefresh } from '@/hooks/useBackForwardRefresh';

/** Monta el fix de back/forward de Vercel. Ver hooks/useBackForwardRefresh.js. */
export default function BackForwardRefresh() {
  useBackForwardRefresh();
  return null;
}
