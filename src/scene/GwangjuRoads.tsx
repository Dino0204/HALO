import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import type { Feature, LineString } from 'geojson'
import {
  GWANGJU_LANDMARKS,
  cityVisualBbox,
  type Bbox,
  type Point2D,
} from '../utils/gwangjuCityScale'

const ROADS_URL = '/data/gwangju-roads/roads.json'
const CITY_VISIBLE_START = 0.2857
const CITY_VISIBLE_END = 0.9286
const FINAL_MAP_REVEAL_START = 0.9286
const OFFICE_FOCUS_START = 0.7857

type RoadClass = 'major' | 'street' | 'walk' | 'geumnamro'

const ROAD_Y: Record<RoadClass, number> = {
  major: 0.055,
  street: 0.065,
  walk: 0.075,
  geumnamro: 0.095,
}

interface RoadProps {
  name?: string
  roadClass?: RoadClass | string
  bbox: Bbox
}

type RoadFeature = Feature<LineString, RoadProps>

interface RoadCollection {
  features: RoadFeature[]
}

function isCitySceneVisible(t: number) {
  return (
    (t > CITY_VISIBLE_START && t < 0.6429) ||
    (t > 0.7143 && t < CITY_VISIBLE_END) ||
    t >= FINAL_MAP_REVEAL_START
  )
}

function bboxDistanceToPoint(bbox: Bbox, point: Point2D) {
  const [minX, minZ, maxX, maxZ] = cityVisualBbox(bbox)
  const nearestX = THREE.MathUtils.clamp(point.x, minX, maxX)
  const nearestZ = THREE.MathUtils.clamp(point.z, minZ, maxZ)
  return Math.hypot(point.x - nearestX, point.z - nearestZ)
}

function shouldRenderRoad(feature: RoadFeature) {
  const { roadClass, bbox } = feature.properties
  const name = feature.properties.name || ''
  if (name.includes('금남로')) return true
  if (roadClass === 'major') return true
  if (roadClass === 'street') {
    return (
      bboxDistanceToPoint(bbox, GWANGJU_LANDMARKS.cnuGate) < 18 ||
      bboxDistanceToPoint(bbox, GWANGJU_LANDMARKS.geumnamroPark) < 16 ||
      bboxDistanceToPoint(bbox, GWANGJU_LANDMARKS.jeonilBuilding) < 16
    )
  }
  if (roadClass === 'walk') {
    return bboxDistanceToPoint(bbox, GWANGJU_LANDMARKS.cnuGate) < 9
  }
  return false
}

function createGeometry(features: RoadFeature[], roadClass: RoadClass) {
  const positions: number[] = []

  features.forEach((feature) => {
    const y = ROAD_Y[roadClass]
    const coordinates = feature.geometry.coordinates.map(([x, z]) => {
      const [minX, minZ, maxX, maxZ] = cityVisualBbox([x, z, x, z])
      return [(minX + maxX) / 2, y, (minZ + maxZ) / 2] as [number, number, number]
    })

    for (let index = 1; index < coordinates.length; index += 1) {
      positions.push(...coordinates[index - 1], ...coordinates[index])
    }
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

export default function GwangjuRoads() {
  const groupRef = useRef<THREE.Group>(null!)
  const geumnamroRef = useRef<THREE.LineSegments>(null!)
  const scroll = useScroll()
  const [roads, setRoads] = useState<RoadCollection | null>(null)

  useEffect(() => {
    fetch(ROADS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Gwangju roads: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => setRoads(data as RoadCollection))
      .catch(console.error)
  }, [])

  const geometries = useMemo<Record<RoadClass, THREE.BufferGeometry> | null>(() => {
    if (!roads) return null

    const groups: Record<RoadClass, RoadFeature[]> = {
      major: [],
      street: [],
      walk: [],
      geumnamro: [],
    }

    roads.features.filter(shouldRenderRoad).forEach((feature) => {
      const name = feature.properties.name || ''
      if (name.includes('금남로')) {
        groups.geumnamro.push(feature)
        return
      }
      const cls = feature.properties.roadClass as RoadClass | undefined
      if (cls && groups[cls]) {
        groups[cls].push(feature)
      }
    })

    return {
      major: createGeometry(groups.major, 'major'),
      street: createGeometry(groups.street, 'street'),
      walk: createGeometry(groups.walk, 'walk'),
      geumnamro: createGeometry(groups.geumnamro, 'geumnamro'),
    }
  }, [roads])

  useEffect(() => {
    return () => {
      if (!geometries) return
      Object.values(geometries).forEach((geometry) => geometry.dispose())
    }
  }, [geometries])

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = isCitySceneVisible(t)
    if (geumnamroRef.current) {
      geumnamroRef.current.visible = t < OFFICE_FOCUS_START
    }
  })

  if (!geometries) {
    return <group ref={groupRef} visible={false} />
  }

  return (
    <group ref={groupRef} visible={false}>
      <lineSegments geometry={geometries.major}>
        <lineBasicMaterial color="#cbc1ae" transparent opacity={0.88} />
      </lineSegments>
      <lineSegments geometry={geometries.street}>
        <lineBasicMaterial color="#7d7466" transparent opacity={0.72} />
      </lineSegments>
      <lineSegments geometry={geometries.walk}>
        <lineBasicMaterial color="#56635c" transparent opacity={0.7} />
      </lineSegments>
      <lineSegments ref={geumnamroRef} geometry={geometries.geumnamro}>
        <lineBasicMaterial color="#f0d36d" transparent opacity={1} />
      </lineSegments>
    </group>
  )
}
