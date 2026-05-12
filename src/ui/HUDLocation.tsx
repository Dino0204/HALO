import { useSceneStore } from '../store/sceneStore'
import { SCENE_HUD_DATA } from '../../data/hudData'

export default function HUDLocation() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const data = SCENE_HUD_DATA[currentScene]
  const { region, place } = data?.location ?? {}

  if (!region) return null

  return (
    <div className="pointer-events-none fixed top-8 left-8 z-20 font-mono">
      {region && <div className="mb-1 text-[0.7rem] tracking-[0.2em] text-white/50">{region}</div>}
      {place && (
        <div className="font-serif text-[0.95rem] tracking-[0.08em] text-[#e8e0d0]/85">{place}</div>
      )}
    </div>
  )
}
