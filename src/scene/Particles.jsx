import { useRef, useMemo } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const COUNT = 500

function createParticlePositions() {
  let seed = 518

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0x100000000
  }

  const arr = new Float32Array(COUNT * 3)
  for (let i = 0; i < COUNT; i++) {
    const angle = random() * Math.PI * 2
    const radius = 10 + random() * 40
    arr[i * 3] = Math.cos(angle) * radius
    arr[i * 3 + 1] = (random() - 0.5) * 200
    arr[i * 3 + 2] = Math.sin(angle) * radius
  }
  return arr
}

export default function Particles() {
  const pointsRef = useRef()
  const scroll = useScroll()

  const basePositions = useMemo(() => createParticlePositions(), [])
  const positions = useMemo(() => basePositions.slice(), [basePositions])

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
      posArr[i * 3 + 1] = ((basePositions[i * 3 + 1] + speed) % 200) - 100
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#888888" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}
