import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { scrollStore } from '../store/scrollStore'

export default function CustomScrollbar() {
  const [offset, setOffset] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    let rafId: number
    const update = () => {
      setOffset(scrollStore.offset)
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    isDragging.current = true
    handlePointerMove(e)
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement> | globalThis.PointerEvent) => {
    if (!isDragging.current || !trackRef.current || !scrollStore.el) return

    const rect = trackRef.current.getBoundingClientRect()
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
    const progress = y / rect.height

    // Scroll the actual element
    const maxScroll = scrollStore.el.scrollHeight - scrollStore.el.clientHeight
    scrollStore.el.scrollTop = progress * maxScroll
  }

  const handlePointerUp = () => {
    isDragging.current = false
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
  }

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      className="pointer-events-auto fixed top-[18vh] right-1.5 z-[100] h-[64vh] w-3 cursor-pointer rounded-[10px] bg-transparent sm:top-[15vh] sm:right-2.5 sm:h-[70vh] sm:w-1 sm:bg-white/5"
    >
      <div
        className="absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8e0d0]/80 shadow-[0_0_10px_rgba(232,224,208,0.5)] transition-[transform,background] duration-300 ease-out hover:scale-[1.3] hover:bg-white sm:size-3 sm:bg-[#e8e0d0]"
        style={{
          top: `${offset * 100}%`,
        }}
      />
      <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-[#e8e0d0]/10" />
    </div>
  )
}
