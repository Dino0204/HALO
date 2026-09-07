import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { MBC_POS } from '../landmarkPositions'

// 방화 불길의 깜빡임. 가시성은 부모 ScrollRange가 관리하고
// 여기서는 세기만 흔든다.
export default function FireFlicker() {
  const ref = useRef<PointLight>(null!)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.intensity = 2 + Math.sin(t * 6) * 1.5 + Math.sin(t * 13) * 0.8
  })

  return (
    <pointLight
      ref={ref}
      color="#ff5500"
      intensity={0}
      distance={20}
      decay={1.5}
      position={[MBC_POS.x, MBC_POS.y + 2, MBC_POS.z + 2]}
    />
  )
}
