import { useEffect, useRef, useState } from 'react'
import { scrollStore } from '../store/scrollStore'

export default function CustomScrollbar() {
  const [offset, setOffset] = useState(0)
  const thumbRef = useRef(null)
  const trackRef = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    let rafId
    const update = () => {
      setOffset(scrollStore.offset)
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const handlePointerDown = (e) => {
    isDragging.current = true
    handlePointerMove(e)
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e) => {
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
      style={{
        position: 'fixed',
        right: '10px',
        top: '15vh',
        height: '70vh',
        width: '4px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        zIndex: 100,
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      <div
        ref={thumbRef}
        style={{
          position: 'absolute',
          top: `${offset * 100}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '12px',
          height: '12px',
          background: '#e8e0d0',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(232, 224, 208, 0.5)',
          transition: 'transform 0.1s ease-out, background 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.3)'
          e.currentTarget.style.background = '#ffffff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
          e.currentTarget.style.background = '#e8e0d0'
        }}
      />
      {/* Visual Track Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '1px',
        height: '100%',
        background: 'rgba(232, 224, 208, 0.1)',
      }} />
    </div>
  )
}
