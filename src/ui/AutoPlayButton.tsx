import { useEffect, useRef } from 'react'
import { usePlayStore } from '../store/playStore'

const BASE_SPEED = 3
const MIN_SPEED = 1
const MAX_SPEED = 5

export default function AutoPlayButton() {
  const { isPlaying, toggle, speed, setSpeed } = usePlayStore()
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (isPlaying) {
      const el = getScrollElement()
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

  const goToStart = () => {
    const el = getScrollElement()
    if (el) el.scrollTop = 0
  }
  const goToEnd = () => {
    const el = getScrollElement()
    if (el) el.scrollTop = el.scrollHeight
  }

  return (
    <div className="fixed top-8 right-10 z-20 flex items-center gap-1.5">
      <button
        onClick={toggle}
        className="flex size-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 opacity-50 transition-opacity duration-200 hover:opacity-100"
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

      <div className="flex items-center gap-1.5">
        <span className="min-w-6 select-none text-right font-mono text-[0.7rem] tracking-[0.05em] text-white/50">
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

      <button
        onClick={goToStart}
        className="flex size-7 cursor-pointer items-center justify-center border-0 bg-transparent p-0 opacity-45 transition-opacity duration-200 hover:opacity-100"
        aria-label="처음으로"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="2" height="12" rx="1" fill="white" />
          <path d="M13 2L5 8L13 14V2Z" fill="white" />
        </svg>
      </button>

      <button
        onClick={goToEnd}
        className="flex size-7 cursor-pointer items-center justify-center border-0 bg-transparent p-0 opacity-45 transition-opacity duration-200 hover:opacity-100"
        aria-label="끝으로"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="12" y="2" width="2" height="12" rx="1" fill="white" />
          <path d="M3 2L11 8L3 14V2Z" fill="white" />
        </svg>
      </button>
    </div>
  )
}

function getScrollElement(): HTMLElement | null {
  return window._518scrollEl ?? document.querySelector<HTMLElement>('.hide-scrollbar')
}
