import { create } from 'zustand'

interface SceneState {
  currentScene: number
  setScene: (scene: number) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: 0,
  setScene: (scene) => set({ currentScene: scene }),
}))
