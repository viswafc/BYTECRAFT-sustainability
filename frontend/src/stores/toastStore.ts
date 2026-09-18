import { create } from 'zustand'

export type ToastTone = 'info' | 'success' | 'warning' | 'danger'
export interface Toast { id: number; tone: ToastTone; title: string; message?: string }

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>, ttlMs?: number) => void
  dismiss: (id: number) => void
}

let seq = 0
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t, ttlMs = 6000) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts.slice(-4), { ...t, id }] }))
    if (ttlMs > 0) setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), ttlMs)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const toast = {
  info: (title: string, message?: string) => useToastStore.getState().push({ tone: 'info', title, message }),
  success: (title: string, message?: string) => useToastStore.getState().push({ tone: 'success', title, message }),
  warning: (title: string, message?: string) => useToastStore.getState().push({ tone: 'warning', title, message }),
  danger: (title: string, message?: string) => useToastStore.getState().push({ tone: 'danger', title, message }),
}
