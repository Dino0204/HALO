import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { scrollStore } from '../store/scrollStore'

// ScrollControls 내부에서 offset을 scrollStore에 동기화
export default function ScrollSync() {
  const scroll = useScroll()
  useFrame(() => {
    scrollStore.offset = scroll.offset
  })
  return null
}
