import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { GWANGJU_LANDMARKS, cityVisualBbox } from '../utils/gwangjuCityScale'

const ROADS_URL = '/data/gwangju-roads/roads.json'
const CITY_VISIBLE_START = 0.42
const CITY_VISIBLE_END = 0.92
const ROAD_Y = {
  major: 0.055,
  street: 0.065,
  walk: 0.075,
  geumnamro: 0.095,
}

function isCitySceneVisible(t) {
  return (t > CITY_VISIBLE_START && t < 0.63) || (t > 0.72 && t < CITY_VISIBLE_END)
}

function bboxDistanceToPoint(bbox, point) {
  const [minX, minZ, maxX, maxZ] = cityVisualBbox(bbox)
  const nearestX = THREE.MathUtils.clamp(point.x, minX, maxX)
  const nearestZ = THREE.MathUtils.clamp(point.z, minZ, maxZ)
  return Math.hypot(point.x - nearestX, point.z - nearestZ)
}

function shouldRenderRoad(feature) {
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

function createGeometry(features, roadClass) {
  const positions = []

  features.forEach((feature) => {
    const y = ROAD_Y[roadClass]
    const coordinates = feature.geometry.coordinates.map(([x, z]) => {
      const [minX, minZ, maxX, maxZ] = cityVisualBbox([x, z, x, z])
      return [(minX + maxX) / 2, y, (minZ + maxZ) / 2]
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
  const groupRef = useRef()
  const scroll = useScroll()
  const [roads, setRoads] = useState(null)

  useEffect(() => {
    fetch(ROADS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Gwangju roads: ${response.status}`)
        }
        return response.json()
      })
      .then(setRoads)
      .catch(console.error)
  }, [])

  const geometries = useMemo(() => {
    if (!roads) return null

    const groups = {
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
      if (groups[feature.properties.roadClass]) {
        groups[feature.properties.roadClass].push(feature)
      }
    })

    return Object.fromEntries(
      Object.entries(groups).map(([key, features]) => [key, createGeometry(features, key)])
    )
  }, [roads])

  useEffect(() => {
    return () => {
      if (!geometries) return
      Object.values(geometries).forEach((geometry) => geometry.dispose())
    }
  }, [geometries])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.visible = isCitySceneVisible(scroll.offset)
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
      <lineSegments geometry={geometries.geumnamro}>
        <lineBasicMaterial color="#f0d36d" transparent opacity={1} />
      </lineSegments>
    </group>
  )
}
