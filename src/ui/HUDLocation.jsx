import { useSceneStore } from '../store/sceneStore'
import { SCENE_HUD_DATA } from '../../data/hudData'

export default function HUDLocation() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const data = SCENE_HUD_DATA[currentScene]
  const { region, place } = data?.location ?? {}

  if (!region) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 20,
        pointerEvents: 'none',
        fontFamily: 'monospace',
      }}
    >
      {region && (
        <div
          style={{
            fontSize: '0.7rem',
            color: '#ffffff',
            opacity: 0.5,
            letterSpacing: '0.2em',
            marginBottom: '0.2rem',
          }}
        >
          {region}
        </div>
      )}
      {place && (
        <div
          style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: '0.95rem',
            color: '#e8e0d0',
            opacity: 0.85,
            letterSpacing: '0.08em',
          }}
        >
          {place}
        </div>
      )}
    </div>
  )
}
