import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import {
  GWANGJU_ROADS_URL,
  createGeumnamroPath,
  pathLength,
  pointAtDistance,
} from '../utils/geumnamroPath'

const TAXIS = 18
const BUSES = 5
const VEHICLE_VISIBLE_START = 0.3571
const VEHICLE_VISIBLE_END = 0.4286
const TAXI_SIZE = [0.38, 0.2, 0.72]
const BUS_SIZE = [0.58, 0.34, 1.32]
const VARIATION = [0.0, 0.42, -0.24, 0.7, -0.48, 0.18, -0.62, 0.34, -0.12, 0.56]

export default function VehicleConvoy() {
  const groupRef = useRef()
  const scroll = useScroll()
  const [roads, setRoads] = useState(null)

  useEffect(() => {
    fetch(GWANGJU_ROADS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Gwangju roads for vehicles: ${response.status}`)
        }
        return response.json()
      })
      .then(setRoads)
      .catch(console.error)
  }, [])

  const roadPath = useMemo(() => {
    if (!roads) return []
    return createGeumnamroPath(roads)
  }, [roads])

  const roadDistance = useMemo(() => pathLength(roadPath), [roadPath])

  const vehicles = useMemo(() => {
    const v = []
    const total = TAXIS + BUSES
    const spacing = roadDistance > 0 ? roadDistance / total : 0.75
    for (let i = 0; i < TAXIS; i++) {
      const lane = (i % 3) * 0.13 - 0.13 + VARIATION[i % VARIATION.length] * 0.05
      const offset = (i + VARIATION[(i + 2) % VARIATION.length] * 0.45) * spacing
      const scale = 0.86 + (i % 4) * 0.05
      v.push({ type: 'taxi', lane, offset, scale })
    }
    for (let i = 0; i < BUSES; i++) {
      const lane = (i % 2) * 0.28 - 0.14 + VARIATION[(i + 5) % VARIATION.length] * 0.04
      const offset = (i * 4.1 + 1.8 + VARIATION[(i + 7) % VARIATION.length] * 0.55) * spacing
      const scale = 0.94 + (i % 3) * 0.04
      v.push({ type: 'bus', lane, offset, scale })
    }
    return v
  }, [roadDistance])

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible =
      t > VEHICLE_VISIBLE_START && t < VEHICLE_VISIBLE_END && roadDistance > 0
    if (!groupRef.current.visible) return

    const children = groupRef.current.children
    const progress = THREE.MathUtils.smoothstep(t, VEHICLE_VISIBLE_START, VEHICLE_VISIBLE_END)
    const travelDistance = roadDistance * 0.35
    vehicles.forEach((v, i) => {
      if (!children[i]) return
      const distance = (progress * travelDistance + v.offset) % roadDistance
      const { angle, point } = pointAtDistance(roadPath, distance)
      const laneX = Math.cos(angle) * v.lane
      const laneZ = -Math.sin(angle) * v.lane
      children[i].position.set(point.x + laneX, v.type === 'bus' ? 0.2 : 0.12, point.z + laneZ)
      children[i].rotation.y = angle
    })
  })

  return (
    <group ref={groupRef}>
      {vehicles.map((v, i) => (
        <mesh key={i} scale={v.scale}>
          {v.type === 'taxi' ? <boxGeometry args={TAXI_SIZE} /> : <boxGeometry args={BUS_SIZE} />}
          <meshStandardMaterial color={v.type === 'taxi' ? '#e8c020' : '#2060a0'} />
        </mesh>
      ))}
    </group>
  )
}
