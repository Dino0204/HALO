import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'

export default function ProvincialOffice() {
  const groupRef = useRef()
  const v1 = useRef(),
    v2 = useRef(),
    v3 = useRef()
  const scroll = useScroll()

  useFrame(({ clock }) => {
    const t = scroll.offset
    const visible = t > 0.72 && t < 0.81
    if (groupRef.current) groupRef.current.visible = visible
    if (!visible) return

    // Move armored vehicles toward the building
    const spd = clock.elapsedTime * 0.8
    ;[v1, v2, v3].forEach((vRef, i) => {
      if (!vRef.current) return
      vRef.current.position.z = 55 - ((spd + i * 6) % 30)
    })
  })

  return (
    <group ref={groupRef}>
      {/* Provincial office building */}
      <mesh position={[-13, 4, 32]}>
        <boxGeometry args={[20, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Windows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-19 + (i % 6) * 3.5, 3 + Math.floor(i / 6) * 3, 26.1]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
        </mesh>
      ))}
      {/* Armored vehicles */}
      <mesh ref={v1} position={[-13, 1, 50]}>
        <boxGeometry args={[4, 2, 6]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
      <mesh ref={v2} position={[-11, 1, 56]}>
        <boxGeometry args={[4, 2, 6]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
      <mesh ref={v3} position={[-15, 1, 62]}>
        <boxGeometry args={[4, 2, 6]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
    </group>
  )
}
