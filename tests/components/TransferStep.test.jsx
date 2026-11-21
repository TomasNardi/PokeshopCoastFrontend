import { describe, expect, it, vi, beforeAll } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TransferStep from '@/components/checkout/TransferStep';

beforeAll(() => {
  // jsdom no implementa <dialog>.
  HTMLDialogElement.prototype.showModal = vi.fn(function () { this.open = true; });
  HTMLDialogElement.prototype.close = vi.fn(function () { this.open = false; });
});

const transfer = { alias: 'POKESHOP.COAST', cbu: '0000003100000000000001', holder: 'Pokeshop Coast', cuit: '20-1-1', bank: 'Banco X' };
const base = { open: true, total: 12000, transfer, submitting: false, onBack: () => {}, onConfirm: () => {}, onPickReceipt: () => {} };
const pdf = new File(['x'], 'comprobante.pdf', { type: 'application/pdf' });
const confirmButton = () => screen.getByRole('button', { name: /confirmar pedido/i });

describe('<TransferStep />', () => {
  it('muestra total y datos bancarios, y no deja confirmar sin comprobante', () => {
    render(<TransferStep {...base} receipt={{ status: 'idle' }} />);
    expect(screen.getByText('POKESHOP.COAST')).toBeInTheDocument();
    expect(screen.getByText(transfer.cbu)).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it('elegir un archivo lo sube en el momento (validación en vivo)', () => {
    const onPickReceipt = vi.fn();
    const { container } = render(<TransferStep {...base} receipt={{ status: 'idle' }} onPickReceipt={onPickReceipt} />);
    fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [pdf] } });
    expect(onPickReceipt).toHaveBeenCalledWith(pdf);
  });

  it('mientras sube no se puede confirmar', () => {
    render(<TransferStep {...base} receipt={{ status: 'uploading', file: pdf }} />);
    expect(screen.getByText(/subiendo comprobante/i)).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it('si el servidor lo rechaza, el error se ve grande y se puede reintentar', () => {
    const onPickReceipt = vi.fn();
    render(<TransferStep {...base} receipt={{ status: 'error', file: pdf, error: 'No pudimos guardar el comprobante.' }} onPickReceipt={onPickReceipt} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos guardar el comprobante.');
    expect(confirmButton()).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onPickReceipt).toHaveBeenCalledWith(pdf);
  });

  it('con el comprobante recibido, confirmar genera el pedido', () => {
    const onConfirm = vi.fn();
    render(<TransferStep {...base} receipt={{ status: 'ready', file: pdf }} onConfirm={onConfirm} />);
    expect(screen.getByText(/comprobante recibido/i)).toBeInTheDocument();
    fireEvent.click(confirmButton());
    expect(onConfirm).toHaveBeenCalled();
  });

  it('rechaza archivos que no son imagen ni PDF sin subirlos', () => {
    const onPickReceipt = vi.fn();
    const { container } = render(<TransferStep {...base} receipt={{ status: 'idle' }} onPickReceipt={onPickReceipt} />);
    fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [new File(['x'], 'virus.exe', { type: 'application/x-msdownload' })] } });
    expect(onPickReceipt).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/foto|PDF/);
  });
});

describe('<TransferStep /> animación', () => {
  it('primero muestra "Preparando tu pago" y después los datos', async () => {
    vi.useFakeTimers();
    const { container } = render(<TransferStep {...base} receipt={{ status: 'idle' }} />);
    expect(screen.getByText(/preparando tu pago/i)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1200); });
    expect(screen.queryByText(/preparando tu pago/i)).not.toBeInTheDocument();
    expect(container.querySelector('.transfer-reveal')).not.toBeNull();
    vi.useRealTimers();
  });

  it('al confirmar muestra "Generando tu pedido"', () => {
    render(<TransferStep {...base} submitting receipt={{ status: 'ready', file: pdf }} />);
    expect(screen.getAllByText(/generando tu pedido/i).length).toBeGreaterThan(0);
  });
});
