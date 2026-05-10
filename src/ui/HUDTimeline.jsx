import { useSceneStore } from '../store/sceneStore'
import { SCENE_HUD_DATA, DATE_PROGRESS } from '../../data/hudData'

export default function HUDTimeline() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const data = SCENE_HUD_DATA[currentScene]

  if (!data?.visible || !data.date) return null

  const progress = DATE_PROGRESS[data.date] ?? 0
  const isFinal = data.date === '5.27'

  return (
    <div
      style={{
        position: 'fixed',
        right: '2.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 20,
        pointerEvents: 'none',
        fontFamily: 'monospace',
        color: '#ffffff',
      }}
    >
      <span style={{ fontSize: '0.75rem', opacity: 0.45, letterSpacing: '0.1em' }}>5.18</span>
      <div
        style={{
          width: 1,
          height: 100,
          background: 'rgba(255,255,255,0.15)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: `${progress * 100}%`,
            background: 'rgba(255,255,255,0.7)',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textShadow: isFinal ? '0 0 12px rgba(255,80,80,0.5)' : '0 0 12px rgba(255,255,255,0.4)',
          color: isFinal ? '#ff6666' : '#ffffff',
          transition: 'all 0.6s ease',
        }}
      >
        {data.date}
      </span>
      <div
        style={{
          width: 1,
          height: 100,
          background: 'rgba(255,255,255,0.15)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${(1 - progress) * 100}%`,
            background: 'rgba(255,255,255,0.15)',
          }}
        />
      </div>
      <span style={{ fontSize: '0.75rem', opacity: 0.45, letterSpacing: '0.1em' }}>5.27</span>
    </div>
  )
}
