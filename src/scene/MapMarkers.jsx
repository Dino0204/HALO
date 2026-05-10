import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'

const CITIES = [
  { name: '서울', x: -10, z: -26 },
  { name: '인천', x: -16, z: -23 },
  { name: '대전', x: -1.4, z: 4 },
  { name: '대구', x: 22, z: 15 },
  { name: '부산', x: 31, z: 34 },
  { name: '광주', x: -13, z: 32 },
]

// Seoul pulse ring component
function PulseRing({ x, z, delay, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = ((clock.elapsedTime - delay) % 2.5) / 2.5
    ref.current.scale.setScalar(1 + t * 3)
    ref.current.material.opacity = Math.max(0, 1 - t * 1.5)
  })
  return (
    <mesh ref={ref} position={[x, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial color={color} transparent opacity={1} depthWrite={false} />
    </mesh>
  )
}

function CityDot({ x, z, color, scale = 1 }) {
  return (
    <mesh position={[x, 0.2, z]}>
      <sphereGeometry args={[0.4 * scale, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

export default function MapMarkers() {
  const scroll = useScroll()
  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    // Visible in scenes 00–02 (t < 0.27) and scene 07 (0.63–0.72)
    const visible = t < 0.27 || (t >= 0.63 && t < 0.72)
    groupRef.current.visible = visible
  })

  return (
    <group ref={groupRef}>
      {/* Seoul pulse rings (Scene 01: t 0.09–0.18) */}
      {[0, 0.6, 1.2].map((delay, i) => (
        <PulseRing key={i} x={-10} z={-26} delay={delay} color="#ff3333" />
      ))}
      <CityDot x={-10} z={-26} color="#ff4444" scale={1.2} />

      {/* Other cities */}
      {CITIES.filter((c) => c.name !== '서울').map((city) => (
        <CityDot key={city.name} x={city.x} z={city.z} color="#ffffff" />
      ))}
    </group>
  )
}
