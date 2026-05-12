import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'
import {
  GWANGJU_ROADS_URL,
  createGeumnamroPath,
  pathLength,
  pointAtDistance,
} from '../utils/geumnamroPath'

const FINAL_MAP_REVEAL_START = 0.9286
const CNU_GATE_MARKER_SCALE = 0.3
const GEUMNAMRO_ALERT_START = 0.5
const GEUMNAMRO_ALERT_END = 0.6429
const GEUMNAMRO_PULSE_RATIOS = [0.16, 0.52, 0.86]

function CnuGate() {
  const { x, z } = GWANGJU_LANDMARKS.cnuGate

  return (
    <group
      position={[x, 0, z - 1]}
      scale={CNU_GATE_MARKER_SCALE}
    >
      <mesh position={[-1.75, 0.8, 0]}>
        <boxGeometry args={[0.42, 1.6, 0.46]} />
        <meshStandardMaterial color="#a68f72" roughness={0.72} />
      </mesh>
      <mesh position={[1.75, 0.8, 0]}>
        <boxGeometry args={[0.42, 1.6, 0.46]} />
        <meshStandardMaterial color="#a68f72" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[4.3, 0.42, 0.58]} />
        <meshStandardMaterial color="#3f3025" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.88, 0]}>
        <boxGeometry args={[4.7, 0.16, 0.68]} />
        <meshStandardMaterial color="#d5c0a0" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[5.4, 0.04, 2.4]} />
        <meshStandardMaterial color="#6e6a5c" roughness={0.9} />
      </mesh>
    </group>
  )
}

function GeumnamroMarker() {
  const start = GWANGJU_LANDMARKS.geumnamroPark
  const end = GWANGJU_LANDMARKS.jeonilBuilding
  const midX = (start.x + end.x) / 2
  const midZ = (start.z + end.z) / 2
  const angle = Math.atan2(end.x - start.x, end.z - start.z)

  return (
    <group position={[midX, 0.11, midZ]} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[0.36, 0.05, 8.4]} />
        <meshStandardMaterial
          color="#f0d36d"
          emissive="#5f4611"
          emissiveIntensity={0.24}
          roughness={0.6}
        />
      </mesh>
    </group>
  )
}

function GeumnamroPulse() {
  const refs = useRef([])
  const scroll = useScroll()
  const [roads, setRoads] = useState(null)

  useEffect(() => {
    fetch(GWANGJU_ROADS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Gwangju roads for Geumnamro pulse: ${response.status}`)
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

  const fallbackPoints = useMemo(() => {
    const start = GWANGJU_LANDMARKS.geumnamroPark
    const end = GWANGJU_LANDMARKS.jeonilBuilding
    return GEUMNAMRO_PULSE_RATIOS.map((ratio) => ({
      x: THREE.MathUtils.lerp(start.x, end.x, ratio),
      z: THREE.MathUtils.lerp(start.z, end.z, ratio),
    }))
  }, [])

  const points = useMemo(() => {
    if (roadDistance <= 0) {
      return fallbackPoints.map((point, index) => ({
        ...point,
        offset: index * 0.3,
      }))
    }

    return GEUMNAMRO_PULSE_RATIOS.map((ratio, index) => {
      const { point } = pointAtDistance(roadPath, roadDistance * ratio)
      return {
        ...point,
        offset: index * 0.3,
      }
    })
  }, [fallbackPoints, roadDistance, roadPath])

  useFrame(({ clock }) => {
    const t = scroll.offset
    const active = t >= GEUMNAMRO_ALERT_START && t < GEUMNAMRO_ALERT_END

    refs.current.forEach((ring, i) => {
      if (!ring) return
      ring.visible = active
      if (!active) return

      const phase = (clock.elapsedTime * 0.7 + points[i].offset) % 1
      const scale = 0.7 + phase * 3.6
      ring.scale.setScalar(scale)
      ring.material.opacity = (1 - phase) * 0.82
    })
  })

  return (
    <>
      {points.map((point, i) => (
        <mesh
          key={`${point.x}-${point.z}`}
          ref={(el) => (refs.current[i] = el)}
          position={[point.x, 0.22, point.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.3, 0.58, 64]} />
          <meshBasicMaterial
            color="#ff4a2b"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

export default function GwangjuLandmarks() {
  const cnuRef = useRef()
  const downtownRef = useRef()
  const scroll = useScroll()

  useFrame(() => {
    const t = scroll.offset
    const cnuVisible = (t > 0.32 && t < 0.5) || t >= FINAL_MAP_REVEAL_START
    const downtownVisible =
      (t >= 0.5 && t < 0.6429) || (t > 0.7857 && t < 0.9286) || t >= FINAL_MAP_REVEAL_START

    if (cnuRef.current) cnuRef.current.visible = cnuVisible
    if (downtownRef.current) downtownRef.current.visible = downtownVisible
  })

  return (
    <>
      <group ref={cnuRef} visible={false}>
        <CnuGate />
      </group>
      <group ref={downtownRef} visible={false}>
        <GeumnamroMarker />
        <GeumnamroPulse />
      </group>
    </>
  )
}
