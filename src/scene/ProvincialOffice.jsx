import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const OFFICE_POS = GWANGJU_LANDMARKS.jeonilBuilding
const VEHICLE_START_Z = OFFICE_POS.z + 34

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
      vRef.current.position.z = VEHICLE_START_Z - ((spd + i * 6) % 30)
    })
  })

  return (
    <group ref={groupRef}>
      {/* Provincial office building */}
      <mesh position={[OFFICE_POS.x, 2, OFFICE_POS.z]}>
        <boxGeometry args={[10, 4, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Windows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[OFFICE_POS.x - 3.6 + (i % 6) * 1.45, 1.5 + Math.floor(i / 6) * 1.25, OFFICE_POS.z - 3.05]}
        >
          <planeGeometry args={[0.65, 0.65]} />
          <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
        </mesh>
      ))}
      {/* Armored vehicles */}
      <mesh ref={v1} position={[OFFICE_POS.x, 0.55, VEHICLE_START_Z]}>
        <boxGeometry args={[1.8, 1.1, 3.0]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
      <mesh ref={v2} position={[OFFICE_POS.x + 2, 0.55, VEHICLE_START_Z + 6]}>
        <boxGeometry args={[1.8, 1.1, 3.0]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
      <mesh ref={v3} position={[OFFICE_POS.x - 2, 0.55, VEHICLE_START_Z + 12]}>
        <boxGeometry args={[1.8, 1.1, 3.0]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
    </group>
  )
}
