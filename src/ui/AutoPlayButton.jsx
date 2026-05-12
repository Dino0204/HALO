import { useEffect, useRef } from 'react'
import { usePlayStore } from '../store/playStore'

const BASE_SPEED = 3
const MIN_SPEED = 1
const MAX_SPEED = 5

export default function AutoPlayButton() {
  const { isPlaying, toggle, speed, setSpeed } = usePlayStore()
  const rafRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      const el = window._518scrollEl || document.querySelector('.hide-scrollbar')
      if (!el) return

      const step = () => {
        if (!usePlayStore.getState().isPlaying) return
        el.scrollTop += BASE_SPEED * usePlayStore.getState().speed
        rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying])

  return (
    <div
      style={{
        position: 'fixed',
        right: '2.5rem',
        top: '2rem',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {/* Speed control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.05em',
            minWidth: '1.6rem',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {speed}×
        </span>
        <style>{`
          .speed-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 64px;
            height: 2px;
            background: rgba(255,255,255,0.2);
            outline: none;
            cursor: pointer;
          }
          .speed-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255,255,255,0.8);
            cursor: pointer;
          }
          .speed-slider::-moz-range-thumb {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255,255,255,0.8);
            cursor: pointer;
            border: none;
          }
        `}</style>
        <input
          type="range"
          className="speed-slider"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={1}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="배속 조절"
        />
      </div>

      {/* Play/Pause button */}
      <button
        onClick={toggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          opacity: 0.5,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
        aria-label={isPlaying ? '정지' : '자동 재생'}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="2" width="4" height="14" rx="1" fill="white" />
            <rect x="11" y="2" width="4" height="14" rx="1" fill="white" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 2L16 9L4 16V2Z" fill="white" />
          </svg>
        )}
      </button>
    </div>
  )
}
