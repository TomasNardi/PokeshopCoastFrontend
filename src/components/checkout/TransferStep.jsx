'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, FileText, Landmark, Lock, UploadCloud, X } from 'lucide-react';
import { formatPrice } from '@/domain/money';
import { buttonClass } from '@/components/ui/Button';

const MAX_MB = 10;
// Pausa breve al abrir: da la sensación de que algo se preparó (no es un spinner eterno).
const PREPARE_MS = 1100;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf';

function CopyRow({ label, value, strong = false }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* el dato igual queda a la vista para copiarlo a mano */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 border-b border-coast-line py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-uns-muted">{label}</p>
        <p className={`break-all ${strong ? 'text-[17px] font-bold tracking-wide' : 'text-[14px] font-semibold'}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className={`flex h-9 shrink-0 items-center gap-1.5 border px-3 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
          copied ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-coast-ink hover:bg-coast-ink hover:text-white'
        }`}
        aria-label={`Copiar ${label}`}
      >
        {copied ? <><Check size={14} /> Copiado</> : <><Copy size={13} /> Copiar</>}
      </button>
    </div>
  );
}

/**
 * Paso final de la transferencia: el total, los datos para transferir y el
 * comprobante. La orden recién se crea al confirmar con el comprobante
 * adjunto (antes de esto no hay pedido).
 */
export default function TransferStep({ open, total, transfer, receiptFile, setReceiptFile, submitting, onConfirm, onBack }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) {
      setReady(false);
      return undefined;
    }
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => setReady(true), reduced ? 0 : PREPARE_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!receiptFile || !receiptFile.type?.startsWith('image/')) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(receiptFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  const pick = (file) => {
    setError('');
    if (!file) return;
    const okType = ACCEPT.split(',').includes(file.type) || /\.(jpe?g|png|webp|heic|heif|pdf)$/i.test(file.name);
    if (!okType) return setError('Subí una foto (JPG, PNG, WEBP) o un PDF.');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`El archivo supera los ${MAX_MB} MB.`);
    setReceiptFile(file);
  };

  return (
    <dialog
      ref={ref}
      className="transfer-step"
      aria-labelledby="transfer-title"
      onCancel={(e) => { e.preventDefault(); if (!submitting) onBack(); }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-coast-line px-5 py-4 sm:px-7">
        <button type="button" onClick={onBack} disabled={submitting} className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-uns-muted hover:text-coast-ink">
          <ArrowLeft size={14} /> Volver
        </button>
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-uns-muted"><Lock size={12} /> Último paso</p>
      </div>

      {!ready && (
        <div className="transfer-prepare" role="status" aria-live="polite">
          <span className="transfer-spinner" aria-hidden="true" />
          <p className="text-[15px] font-bold">Preparando tu pago…</p>
          <p className="text-[12px] text-uns-muted">Un segundo, estamos armando los datos para transferir.</p>
          <span className="transfer-progress" aria-hidden="true"><span /></span>
        </div>
      )}

      {submitting && (
        <div className="transfer-busy" role="status" aria-live="assertive">
          <span className="transfer-spinner" aria-hidden="true" />
          <p className="text-[15px] font-bold">Generando tu pedido…</p>
          <p className="text-[12px] text-uns-muted">Subiendo el comprobante y reservando tus productos.</p>
        </div>
      )}

      <div className={`overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 ${ready ? 'transfer-reveal' : 'hidden'}`}>
        <h2 id="transfer-title" className="font-heading text-[26px] font-bold leading-tight sm:text-[32px]">Transferí y subí el comprobante</h2>

        <div className="mt-4 flex items-end justify-between gap-4 bg-coast-ink px-5 py-4 text-white">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-white/70">Total a transferir</span>
          <span className="font-heading text-[30px] font-bold leading-none">{formatPrice(total)}</span>
        </div>

        <section className="mt-5 border border-coast-line px-4 sm:px-5" aria-label="Datos para transferir">
          <p className="flex items-center gap-2 pt-4 text-[12px] font-bold uppercase tracking-[0.08em]"><Landmark size={15} /> Datos para transferir</p>
          <CopyRow label="Alias" value={transfer?.alias} strong />
          <CopyRow label="CBU / CVU" value={transfer?.cbu} strong />
          <CopyRow label="Titular" value={transfer?.holder} />
          <CopyRow label="CUIT" value={transfer?.cuit} />
          <CopyRow label="Banco" value={transfer?.bank} />
        </section>

        <section className="mt-5" aria-label="Comprobante">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em]">Comprobante de la transferencia</p>
          {receiptFile ? (
            <div className="flex items-center gap-4 border border-emerald-300 bg-emerald-50 p-3">
              {preview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="Comprobante" className="h-20 w-16 shrink-0 bg-white object-contain" />
                : <span className="flex h-20 w-16 shrink-0 items-center justify-center bg-white text-coast-red"><FileText size={28} /></span>}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-800"><Check size={15} /> Comprobante listo</p>
                <p className="truncate text-[12px] text-uns-muted">{receiptFile.name}</p>
              </div>
              <button type="button" onClick={() => setReceiptFile(null)} disabled={submitting} className="flex h-9 w-9 shrink-0 items-center justify-center text-uns-muted hover:text-coast-ink" aria-label="Quitar comprobante">
                <X size={18} />
              </button>
            </div>
          ) : (
            <label
              className={`transfer-drop ${drag ? 'is-drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
            >
              <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
              <UploadCloud size={28} className="text-coast-red" />
              <span className="text-[14px] font-bold">Subí la captura o el PDF</span>
              <span className="text-[12px] text-uns-muted">Tocá para elegirlo o arrastralo acá · hasta {MAX_MB} MB</span>
            </label>
          )}
          {error && <p className="mt-2 text-[12px] font-semibold text-coast-red-dark" role="alert">{error}</p>}
        </section>

        <p className="mt-4 text-[12px] leading-relaxed text-uns-muted">
          Al confirmar se genera tu pedido y te reservamos los productos. Revisamos el pago y te avisamos por mail apenas lo aprobemos.
        </p>
      </div>

      <div className={`border-t border-coast-line px-5 py-4 sm:px-7 ${ready ? 'transfer-reveal-block' : 'hidden'}`}>
        <button type="button" onClick={onConfirm} disabled={!receiptFile || submitting} className={buttonClass({ size: 'lg', block: true })}>
          <Lock size={14} /> {submitting ? 'Generando tu pedido…' : 'Confirmar pedido'}
        </button>
        {!receiptFile && <p className="mt-2 text-center text-[11px] text-uns-muted">Subí el comprobante para confirmar.</p>}
      </div>
    </dialog>
  );
}
