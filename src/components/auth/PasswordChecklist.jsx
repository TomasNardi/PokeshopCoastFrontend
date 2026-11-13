import { Check, Circle } from 'lucide-react';
import { evaluatePassword } from '@/domain/passwordRules';

export default function PasswordChecklist({ password }) {
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Requisitos de la contraseña">
      {evaluatePassword(password).map((rule) => (
        <li key={rule.id} className={`flex items-center gap-2 text-[12px] ${rule.ok ? 'text-emerald-700' : 'text-coast-gray'}`}>
          {rule.ok ? <Check size={13} /> : <Circle size={10} />}
          <span>{rule.label}</span>
          <span className="sr-only">{rule.ok ? '(cumple)' : '(falta)'}</span>
        </li>
      ))}
    </ul>
  );
}
