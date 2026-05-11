import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { scrollStore } from '../store/scrollStore'

// ScrollControls 내부에서 offset과 el을 scrollStore에 동기화
export default function ScrollSync() {
  const scroll = useScroll()

  useEffect(() => {
    if (scroll.el) {
      scrollStore.el = scroll.el
      window._518scrollEl = scroll.el // Global fallback for absolute reliability
    }
  }, [scroll.el])

  useFrame(() => {
    scrollStore.offset = scroll.offset
  })
  return null
}
