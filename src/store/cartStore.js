'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addLine, itemCount, setLineQuantity, subtotalOf, syncLines } from '@/domain/cart';

const NO_DISCOUNT = { discountCode: null, discountPercent: 0, discountFixed: 0 };

/** Solo estado + orquestación. Las reglas viven en src/domain/cart.js. */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      ...NO_DISCOUNT,
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      /** true si entró al menos una unidad. */
      add: (product, qty = 1) => {
        const { items, added } = addLine(get().items, product, qty);
        if (added) set({ items });
        return added;
      },
      setQuantity: (id, quantity) => set({ items: setLineQuantity(get().items, id, quantity) }),
      remove: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      sync: (freshProducts) => set({ items: syncLines(get().items, freshProducts) }),
      clear: () => set({ items: [], ...NO_DISCOUNT }),

      applyDiscount: ({ code, percent = 0, fixed = 0 }) =>
        set({ discountCode: code, discountPercent: Number(percent) || 0, discountFixed: Number(fixed) || 0 }),
      clearDiscount: () => set(NO_DISCOUNT),
    }),
    {
      name: 'pokeshop-coast-cart',
      version: 1,
      partialize: ({ items, discountCode, discountPercent, discountFixed }) => ({
        items,
        discountCode,
        discountPercent,
        discountFixed,
      }),
    }
  )
);

export const selectCount = (state) => itemCount(state.items);
export const selectSubtotal = (state) => subtotalOf(state.items);
