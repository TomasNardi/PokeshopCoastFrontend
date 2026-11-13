import { describe, expect, it } from 'vitest';
import { exceedsMax, failedRules, isValidEmail, isValidPassword } from '@/domain/passwordRules';

describe('reglas de contraseña', () => {
  it('acepta una contraseña que cumple todo', () => {
    expect(isValidPassword('Coast123!')).toBe(true);
  });

  it('informa exactamente qué falta', () => {
    expect(failedRules('coast')).toEqual(['uppercase', 'number', 'special', 'length']);
  });

  it('cuenta mayúsculas y minúsculas con acentos y ñ', () => {
    expect(failedRules('Ñandú123!')).toEqual([]);
  });

  it('el espacio no cuenta como carácter especial', () => {
    expect(failedRules('Hola 1234')).toContain('special');
  });

  it('mide el máximo en bytes, no en caracteres (bcrypt)', () => {
    const accents = `Aa1!${'ñ'.repeat(35)}`; // 39 caracteres, 74 bytes
    expect(exceedsMax(accents)).toBe(true);
    expect(isValidPassword(accents)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it.each([
    ['demo@pokeshopcoast.com', true],
    ['  demo@coast.com.ar ', true],
    ['demo@coast', false],
    ['demo', false],
    ['', false],
  ])('%s → %s', (email, ok) => expect(isValidEmail(email)).toBe(ok));
});
