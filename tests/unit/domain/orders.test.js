import { describe, expect, it } from 'vitest';
import { isPaidOrder } from '@/domain/orders';

describe('isPaidOrder', () => {
  it.each([
    ['paid', true],
    ['shipped', true],
    ['delivered', true],
    ['refunded', true],
    ['pending_payment', false],
    ['awaiting_transfer', false],
    ['expired', false],
    ['cancelled', false],
    ['rejected', false],
  ])('%s → %s', (status, expected) => {
    expect(isPaidOrder({ status })).toBe(expected);
  });
});
