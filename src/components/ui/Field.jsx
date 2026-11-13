import { useId } from 'react';

/**
 * Label + control + error, siempre igual. `as` = 'input' | 'textarea' | 'select'.
 * Accesible: el error queda asociado con aria-describedby.
 */
export default function Field({ label, error, as: Control = 'input', className = '', children, ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <Control
        id={id}
        className={`input ${error ? 'border-coast-red' : ''} ${Control === 'textarea' ? 'resize-none' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {children}
      </Control>
      {error && (
        <p id={errorId} className="mt-1.5 text-[12px] text-coast-red-dark">
          {error}
        </p>
      )}
    </div>
  );
}
