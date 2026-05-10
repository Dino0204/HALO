import { useRef, useMemo } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 500

export default function Particles() {
  const pointsRef = useRef()
  const scroll = useScroll()

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 10 + Math.random() * 40
      arr[i * 3] = Math.cos(angle) * radius
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200
      arr[i * 3 + 2] = Math.sin(angle) * radius
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = scroll.offset
    // Scene 2 구간(0.25~0.55)에서만 파티클 표시
    const visible = t > 0.2 && t < 0.6
    pointsRef.current.visible = visible
    if (!visible) return

    // 시간 기반 Y축 흐름
    const posArr = pointsRef.current.geometry.attributes.position.array
    const speed = clock.elapsedTime * 20
    for (let i = 0; i < COUNT; i++) {
      posArr[i * 3 + 1] = ((positions[i * 3 + 1] + speed) % 200) - 100
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#888888" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}
