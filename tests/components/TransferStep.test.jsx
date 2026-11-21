import { describe, expect, it, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TransferStep from '@/components/checkout/TransferStep';

beforeAll(() => {
  // jsdom no implementa <dialog>.
  HTMLDialogElement.prototype.showModal = vi.fn(function () { this.open = true; });
  HTMLDialogElement.prototype.close = vi.fn(function () { this.open = false; });
});

const transfer = { alias: 'POKESHOP.COAST', cbu: '0000003100000000000001', holder: 'Pokeshop Coast', cuit: '20-1-1', bank: 'Banco X' };
const base = { open: true, total: 12000, transfer, submitting: false, onBack: () => {} };

describe('<TransferStep />', () => {
  it('muestra total y datos bancarios, y no deja confirmar sin comprobante', () => {
    const onConfirm = vi.fn();
    render(<TransferStep {...base} receiptFile={null} setReceiptFile={() => {}} onConfirm={onConfirm} />);
    expect(screen.getByText('POKESHOP.COAST')).toBeInTheDocument();
    expect(screen.getByText(transfer.cbu)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /confirmar pedido/i });
    expect(button).toBeDisabled();
  });

  it('con comprobante, confirmar genera el pedido', () => {
    const onConfirm = vi.fn();
    const file = new File(['x'], 'comprobante.pdf', { type: 'application/pdf' });
    render(<TransferStep {...base} receiptFile={file} setReceiptFile={() => {}} onConfirm={onConfirm} />);
    expect(screen.getByText('comprobante.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('rechaza archivos que no son imagen ni PDF', () => {
    const set = vi.fn();
    const { container } = render(<TransferStep {...base} receiptFile={null} setReceiptFile={set} onConfirm={() => {}} />);
    const input = container.querySelector('input[type=file]');
    fireEvent.change(input, { target: { files: [new File(['x'], 'virus.exe', { type: 'application/x-msdownload' })] } });
    expect(set).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/foto|PDF/);
  });
});

describe('<TransferStep /> animación', () => {
  it('primero muestra "Preparando tu pago" y después los datos', async () => {
    vi.useFakeTimers();
    const { act } = await import('@testing-library/react');
    const { container } = render(<TransferStep {...base} receiptFile={null} setReceiptFile={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText(/preparando tu pago/i)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1200); });
    expect(screen.queryByText(/preparando tu pago/i)).not.toBeInTheDocument();
    expect(container.querySelector('.transfer-reveal')).not.toBeNull();
    vi.useRealTimers();
  });

  it('al confirmar muestra "Generando tu pedido"', () => {
    const file = new File(['x'], 'c.pdf', { type: 'application/pdf' });
    render(<TransferStep {...base} submitting receiptFile={file} setReceiptFile={() => {}} onConfirm={() => {}} />);
    expect(screen.getAllByText(/generando tu pedido/i).length).toBeGreaterThan(0);
  });
});
