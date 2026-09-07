import { create } from 'zustand'

interface PlayState {
  isPlaying: boolean
  speed: number
  setPlaying: (v: boolean) => void
  toggle: () => void
  setSpeed: (v: number) => void
}

export const usePlayStore = create<PlayState>((set) => ({
  isPlaying: false,
  speed: 1,
  setPlaying: (v) => set({ isPlaying: v }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (v) => set({ speed: v }),
}))
