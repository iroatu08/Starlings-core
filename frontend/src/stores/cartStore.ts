import { create } from 'zustand'
import type { CartItem } from '../types/cart.types'

interface CartState {
  isOpen: boolean
  items: CartItem[]
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  setItems: (items: CartItem[]) => void
  totalItems: () => number
  totalAmount: () => number
}

export const useCartStore = create<CartState>()((set, get) => ({
  isOpen: false,
  items: [],

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

  setItems: (items) => set({ items }),

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  totalAmount: () =>
    get().items.reduce((sum, item) => sum + Number(item.unitPriceNgn) * item.quantity, 0),
}))
