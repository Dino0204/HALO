import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const TAXIS = 18
const BUSES = 6
const ROAD_CENTER = {
  x: (GWANGJU_LANDMARKS.geumnamroPark.x + GWANGJU_LANDMARKS.jeonilBuilding.x) / 2,
  z: (GWANGJU_LANDMARKS.geumnamroPark.z + GWANGJU_LANDMARKS.jeonilBuilding.z) / 2,
}

export default function VehicleConvoy() {
  const groupRef = useRef()
  const scroll = useScroll()

  // Create vehicle positions along a road (z-axis corridor at x=-13)
  const vehicles = useMemo(() => {
    const v = []
    for (let i = 0; i < TAXIS; i++) {
      v.push({ type: 'taxi', lane: (i % 2) * 2 - 1, zOffset: i * 3 - 25 })
    }
    for (let i = 0; i < BUSES; i++) {
      v.push({ type: 'bus', lane: (i % 2) * 4 - 2, zOffset: i * 6 - 15 })
    }
    return v
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t > 0.45 && t < 0.54
    if (!groupRef.current.visible) return

    const children = groupRef.current.children
    const speed = clock.elapsedTime * 2
    vehicles.forEach((v, i) => {
      if (!children[i]) return
      const z = ROAD_CENTER.z + ((v.zOffset - speed) % 50) + 10
      children[i].position.z = z
    })
  })

  return (
    <group ref={groupRef}>
      {vehicles.map((v, i) => (
        <mesh
          key={i}
          position={[ROAD_CENTER.x + v.lane, v.type === 'bus' ? 0.5 : 0.3, ROAD_CENTER.z + v.zOffset]}
        >
          {v.type === 'taxi' ? (
            <boxGeometry args={[1.2, 0.6, 2.4]} />
          ) : (
            <boxGeometry args={[2.0, 1.0, 5.0]} />
          )}
          <meshStandardMaterial color={v.type === 'taxi' ? '#e8c020' : '#2060a0'} />
        </mesh>
      ))}
    </group>
  )
}
