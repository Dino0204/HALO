import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { cityVisualBbox } from '../utils/gwangjuCityScale'

const TAXIS = 18
const BUSES = 5
const ROADS_URL = '/data/gwangju-roads/roads.json'
const VEHICLE_VISIBLE_START = 0.45
const VEHICLE_VISIBLE_END = 0.54
const TAXI_SIZE = [0.38, 0.2, 0.72]
const BUS_SIZE = [0.58, 0.34, 1.32]
const VARIATION = [0.0, 0.42, -0.24, 0.7, -0.48, 0.18, -0.62, 0.34, -0.12, 0.56]

function toVisualPoint([x, z]) {
  const [minX, minZ, maxX, maxZ] = cityVisualBbox([x, z, x, z])
  return {
    x: (minX + maxX) / 2,
    z: (minZ + maxZ) / 2,
  }
}

function pathLength(points) {
  let length = 0
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].z - points[index - 1].z)
  }
  return length
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

function pointAtDistance(points, distance) {
  if (points.length < 2) {
    return { point: points[0] || { x: 0, z: 0 }, angle: 0 }
  }

  let remaining = distance
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const segmentLength = Math.hypot(current.x - previous.x, current.z - previous.z)
    if (remaining <= segmentLength) {
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength
      const x = THREE.MathUtils.lerp(previous.x, current.x, ratio)
      const z = THREE.MathUtils.lerp(previous.z, current.z, ratio)
      return {
        point: { x, z },
        angle: Math.atan2(current.x - previous.x, current.z - previous.z),
      }
    }
    remaining -= segmentLength
  }

  const last = points[points.length - 1]
  const previous = points[points.length - 2]
  return {
    point: last,
    angle: Math.atan2(last.x - previous.x, last.z - previous.z),
  }
}

function connectRoadSegments(features) {
  const segments = features
    .map((feature) => feature.geometry.coordinates.map(toVisualPoint))
    .filter((points) => points.length > 1)

  if (segments.length === 0) return []

  const startIndex = segments.reduce((bestIndex, points, index) => {
    const bestStart = segments[bestIndex][0]
    const start = points[0]
    return start.z < bestStart.z ? index : bestIndex
  }, 0)
  const connected = [...segments[startIndex]]
  const remaining = segments.filter((_, index) => index !== startIndex)

  while (remaining.length > 0) {
    const tail = connected[connected.length - 1]
    let nextIndex = 0
    let shouldReverse = false
    let bestDistance = Infinity

    remaining.forEach((points, index) => {
      const startDistance = distanceBetween(tail, points[0])
      const endDistance = distanceBetween(tail, points[points.length - 1])
      if (startDistance < bestDistance) {
        bestDistance = startDistance
        nextIndex = index
        shouldReverse = false
      }
      if (endDistance < bestDistance) {
        bestDistance = endDistance
        nextIndex = index
        shouldReverse = true
      }
    })

    const next = remaining.splice(nextIndex, 1)[0]
    connected.push(...(shouldReverse ? next.reverse() : next))
  }

  return connected
}

function createGeumnamroPath(roads) {
  const geumnamroFeatures = roads.features.filter((feature) => feature.properties.name === '금남로')
  const majorFeatures = geumnamroFeatures.filter((feature) => feature.properties.roadClass === 'major')

  const connected = connectRoadSegments(majorFeatures.length > 0 ? majorFeatures : geumnamroFeatures)
  if (connected.length > 0) return connected

  const fallback = geumnamroFeatures.sort(
    (a, b) => pathLength(b.geometry.coordinates.map(toVisualPoint)) - pathLength(a.geometry.coordinates.map(toVisualPoint)),
  )[0]
  return fallback ? fallback.geometry.coordinates.map(toVisualPoint) : []
}

export default function VehicleConvoy() {
  const groupRef = useRef()
  const scroll = useScroll()
  const [roads, setRoads] = useState(null)

  useEffect(() => {
    fetch(ROADS_URL)
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
      const scale = 0.86 + ((i % 4) * 0.05)
      v.push({ type: 'taxi', lane, offset, scale })
    }
    for (let i = 0; i < BUSES; i++) {
      const lane = (i % 2) * 0.28 - 0.14 + VARIATION[(i + 5) % VARIATION.length] * 0.04
      const offset = (i * 4.1 + 1.8 + VARIATION[(i + 7) % VARIATION.length] * 0.55) * spacing
      const scale = 0.94 + ((i % 3) * 0.04)
      v.push({ type: 'bus', lane, offset, scale })
    }
    return v
  }, [roadDistance])

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t > VEHICLE_VISIBLE_START && t < VEHICLE_VISIBLE_END && roadDistance > 0
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
          {v.type === 'taxi' ? (
            <boxGeometry args={TAXI_SIZE} />
          ) : (
            <boxGeometry args={BUS_SIZE} />
          )}
          <meshStandardMaterial color={v.type === 'taxi' ? '#e8c020' : '#2060a0'} />
        </mesh>
      ))}
    </group>
  )
}
