import { create } from 'zustand'

interface UIState {
  isGlobalLoading: boolean
  activeModal: string | null
  setGlobalLoading: (loading: boolean) => void
  openModal: (modal: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  isGlobalLoading: false,
  activeModal: null,
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
}))
