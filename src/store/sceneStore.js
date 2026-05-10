import { create } from 'zustand'

export const useSceneStore = create((set) => ({
  currentScene: 0,
  setScene: (scene) => set({ currentScene: scene }),
}))
