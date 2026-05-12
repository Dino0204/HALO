import { create } from 'zustand'

export const usePlayStore = create((set) => ({
  isPlaying: false,
  speed: 1,
  setPlaying: (v) => set({ isPlaying: v }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (v) => set({ speed: v }),
}))
