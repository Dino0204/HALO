import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { scrollStore } from '../store/scrollStore'

export default function ScrollSync() {
  const scroll = useScroll()

  useEffect(() => {
    if (scroll.el) {
      scrollStore.el = scroll.el
      window._518scrollEl = scroll.el
    }
  }, [scroll.el])

  useFrame(() => {
    scrollStore.offset = scroll.offset
  })
  return null
}
