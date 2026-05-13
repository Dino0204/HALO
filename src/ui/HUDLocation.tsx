import { useSceneStore } from '../store/sceneStore'
import { SCENE_HUD_DATA } from '../../data/hudData'

export default function HUDLocation() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const data = SCENE_HUD_DATA[currentScene]
  const { region, place } = data?.location ?? {}

  if (!region) return null

  return (
    <div className="pointer-events-none fixed top-5 left-5 z-20 max-w-[calc(100vw-9rem)] font-mono sm:top-8 sm:left-8 sm:max-w-none">
      {region && (
        <div className="mb-1 text-[0.62rem] leading-[1.35] tracking-[0.14em] text-white/50 sm:text-[0.7rem] sm:tracking-[0.2em]">
          {region}
        </div>
      )}
      {place && (
        <div className="font-serif text-[0.78rem] leading-[1.45] tracking-[0.05em] text-[#e8e0d0]/85 sm:text-[0.95rem] sm:tracking-[0.08em]">
          {place}
        </div>
      )}
    </div>
  )
}
