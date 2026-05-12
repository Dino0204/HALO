import { useSceneStore } from '../store/sceneStore'
import { SCENE_HUD_DATA, DATE_PROGRESS } from '../../data/hudData'

export default function HUDTimeline() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const data = SCENE_HUD_DATA[currentScene]

  if (!data?.visible || !data.date) return null

  const progress = DATE_PROGRESS[data.date] ?? 0
  const isFinal = data.date === '5.27'

  return (
    <div className="pointer-events-none fixed top-1/2 right-10 z-20 flex -translate-y-1/2 flex-col items-center font-mono text-white">
      <span className="text-xs tracking-[0.1em] opacity-45">5.18</span>
      <div className="relative h-[100px] w-px bg-white/15">
        <div
          className="absolute top-0 w-full bg-white/70"
          style={{
            height: `${progress * 100}%`,
          }}
        />
      </div>
      <span
        className="text-[1.1rem] font-bold tracking-[0.12em] transition-all duration-700"
        style={{
          textShadow: isFinal ? '0 0 12px rgba(255,80,80,0.5)' : '0 0 12px rgba(255,255,255,0.4)',
          color: isFinal ? '#ff6666' : '#ffffff',
        }}
      >
        {data.date}
      </span>
      <div className="relative h-[100px] w-px bg-white/15">
        <div
          className="absolute bottom-0 w-full bg-white/15"
          style={{
            height: `${(1 - progress) * 100}%`,
          }}
        />
      </div>
      <span className="text-xs tracking-[0.1em] opacity-45">5.27</span>
    </div>
  )
}
