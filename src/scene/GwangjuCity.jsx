import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import {
  CITY_HEIGHT_SCALE,
  GWANGJU_LANDMARKS,
  MIN_BUILDING_SIZE,
  cityVisualBbox,
} from '../utils/gwangjuCityScale'
import { CEMETERY_POS, MBC_POS } from './landmarkPositions'

const MANIFEST_URL = '/data/gwangju-buildings/manifest.json'
const DATA_ROOT = '/data/gwangju-buildings/'
const CITY_VISIBLE_START = 0.2857
const CITY_VISIBLE_END = 0.9286
const CITY_PRELOAD_START = 0.2143
const FINAL_MAP_REVEAL_START = 0.9286
const LOAD_RADIUS = 70
const CITY_GROUND_BBOX = cityVisualBbox([-16.8, 29.8, -9.5, 34.9])
const CITY_GROUND_PADDING = 8
const CITY_GROUND_CENTER = {
  x: (CITY_GROUND_BBOX[0] + CITY_GROUND_BBOX[2]) / 2,
  z: (CITY_GROUND_BBOX[1] + CITY_GROUND_BBOX[3]) / 2,
}
const CITY_GROUND_SIZE = {
  x: CITY_GROUND_BBOX[2] - CITY_GROUND_BBOX[0] + CITY_GROUND_PADDING * 2,
  z: CITY_GROUND_BBOX[3] - CITY_GROUND_BBOX[1] + CITY_GROUND_PADDING * 2,
}
const BUILDING_COLORS = {
  civic: new THREE.Color('#8f8270'),
  commercial: new THREE.Color('#8b8070'),
  education: new THREE.Color('#6d8f91'),
  housing: new THREE.Color('#625e56'),
  industrial: new THREE.Color('#4d4d45'),
  default: new THREE.Color('#666666'),
}
const LANDMARK_CLEAR_ZONES = [
  {
    center: { x: GWANGJU_LANDMARKS.cnuGate.x, z: GWANGJU_LANDMARKS.cnuGate.z - 3 },
    halfX: 4,
    halfZ: 4,
  },
  { center: GWANGJU_LANDMARKS.geumnamroPark, halfX: 1.4, halfZ: 1.4 },
  { center: GWANGJU_LANDMARKS.jeonilBuilding, halfX: 3, halfZ: 2.4 },
  {
    center: { x: GWANGJU_LANDMARKS.jeonilBuilding.x, z: GWANGJU_LANDMARKS.jeonilBuilding.z + 4 },
    halfX: 3.3,
    halfZ: 3.3,
  },
  { center: GWANGJU_LANDMARKS.provincialOffice, halfX: 2, halfZ: 2 },
  { center: MBC_POS, halfX: 5.5, halfZ: 5.5 },
  { center: CEMETERY_POS, halfX: 8, halfZ: 8 },
]

function isCitySceneVisible(t) {
  return (
    (t > CITY_VISIBLE_START && t < 0.6429) ||
    (t > 0.7143 && t < CITY_VISIBLE_END) ||
    t >= FINAL_MAP_REVEAL_START
  )
}

function chunkIntersectsView(chunk, camera) {
  const [minX, minZ, maxX, maxZ] = cityVisualBbox(chunk.bbox)
  const x = camera.position.x
  const z = camera.position.z
  const nearestX = THREE.MathUtils.clamp(x, minX, maxX)
  const nearestZ = THREE.MathUtils.clamp(z, minZ, maxZ)
  return Math.hypot(x - nearestX, z - nearestZ) < LOAD_RADIUS
}

function getBuildingColor(type = '') {
  if (type.includes('university') || type.includes('school') || type.includes('college')) {
    return BUILDING_COLORS.education
  }
  if (type.includes('commercial') || type.includes('retail') || type.includes('office')) {
    return BUILDING_COLORS.commercial
  }
  if (type.includes('apartments') || type.includes('house') || type.includes('residential')) {
    return BUILDING_COLORS.housing
  }
  if (type.includes('industrial') || type.includes('warehouse') || type.includes('factory')) {
    return BUILDING_COLORS.industrial
  }
  if (type.includes('public') || type.includes('government') || type.includes('civic')) {
    return BUILDING_COLORS.civic
  }
  return BUILDING_COLORS.default
}

function intersectsLandmarkClearZone([minX, minZ, maxX, maxZ]) {
  return LANDMARK_CLEAR_ZONES.some(({ center, halfX, halfZ }) => {
    return (
      maxX >= center.x - halfX &&
      minX <= center.x + halfX &&
      maxZ >= center.z - halfZ &&
      minZ <= center.z + halfZ
    )
  })
}

function CityGround() {
  const groundRef = useRef()
  const scroll = useScroll()

  useFrame(() => {
    if (!groundRef.current) return
    const t = scroll.offset
    groundRef.current.visible =
      (t > CITY_VISIBLE_START && t < 0.6429) || (t > 0.7143 && t < CITY_VISIBLE_END)
  })

  return (
    <mesh
      ref={groundRef}
      position={[CITY_GROUND_CENTER.x, -0.02, CITY_GROUND_CENTER.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[CITY_GROUND_SIZE.x, CITY_GROUND_SIZE.z]} />
      <meshBasicMaterial color="#050505" />
    </mesh>
  )
}

function BuildingChunk({ chunk, name }) {
  const meshRef = useRef()

  const instances = useMemo(() => {
    const dummy = new THREE.Object3D()
    return chunk.features.flatMap((feature) => {
      const [minX, minZ, maxX, maxZ] = cityVisualBbox(feature.properties.bbox)
      if (intersectsLandmarkClearZone([minX, minZ, maxX, maxZ])) {
        return []
      }

      const height = feature.properties.height * CITY_HEIGHT_SCALE
      const width = Math.max(MIN_BUILDING_SIZE, maxX - minX)
      const depth = Math.max(MIN_BUILDING_SIZE, maxZ - minZ)
      dummy.position.set((minX + maxX) / 2, height / 2, (minZ + maxZ) / 2)
      dummy.scale.set(width, height, depth)
      dummy.updateMatrix()
      return {
        color: getBuildingColor(feature.properties.building),
        matrix: dummy.matrix.clone(),
      }
    })
  }, [chunk])

  useEffect(() => {
    if (!meshRef.current) return
    instances.forEach(({ color, matrix }, index) => {
      meshRef.current.setMatrixAt(index, matrix)
      meshRef.current.setColorAt(index, color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.instanceColor.needsUpdate = true
  }, [instances])

  return (
    <instancedMesh
      name={name}
      ref={meshRef}
      args={[null, null, instances.length]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial vertexColors roughness={0.78} metalness={0.04} />
    </instancedMesh>
  )
}

export default function GwangjuCity() {
  const groupRef = useRef()
  const scroll = useScroll()
  const { camera } = useThree()
  const [manifest, setManifest] = useState(null)
  const [loadedChunks, setLoadedChunks] = useState({})
  const [activeKeys, setActiveKeys] = useState([])
  const loadedChunksRef = useRef({})
  const loadingKeys = useRef(new Set())
  const activeKeySignature = useRef('')
  const preloadStarted = useRef(false)

  useEffect(() => {
    fetch(MANIFEST_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Gwangju building manifest: ${response.status}`)
        }
        return response.json()
      })
      .then(setManifest)
      .catch(console.error)
  }, [])

  useEffect(() => {
    loadedChunksRef.current = loadedChunks
  }, [loadedChunks])

  const loadChunkKeys = useCallback(
    (keys) => {
      if (!manifest || keys.length === 0) return

      const missing = keys.filter((key) => {
        return !loadedChunksRef.current[key] && !loadingKeys.current.has(key)
      })
      if (missing.length === 0) return

      missing.forEach((key) => loadingKeys.current.add(key))

      Promise.all(
        missing.map((key) => {
          const chunkInfo = manifest.chunks.find((chunk) => chunk.key === key)
          if (!chunkInfo) return Promise.resolve(null)

          return fetch(`${DATA_ROOT}${chunkInfo.file}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to load Gwangju building chunk ${key}: ${response.status}`)
              }
              return response.json()
            })
            .then((geoJson) => [key, geoJson])
            .catch((error) => {
              console.error(error)
              return null
            })
        })
      ).then((entries) => {
        missing.forEach((key) => loadingKeys.current.delete(key))

        const nextEntries = entries.filter(Boolean)
        if (nextEntries.length === 0) return

        setLoadedChunks((current) => {
          const next = { ...current }
          nextEntries.forEach(([key, geoJson]) => {
            next[key] = geoJson
          })
          loadedChunksRef.current = next
          return next
        })
      })
    },
    [manifest]
  )

  useFrame(() => {
    if (!groupRef.current) return

    const t = scroll.offset
    if (manifest && !preloadStarted.current && t >= CITY_PRELOAD_START) {
      preloadStarted.current = true
      loadChunkKeys(manifest.chunks.map((chunk) => chunk.key))
    }

    const visible = isCitySceneVisible(t)
    groupRef.current.visible = visible
    if (!visible || !manifest) {
      return
    }

    const nextActive =
      t >= FINAL_MAP_REVEAL_START
        ? manifest.chunks.map((chunk) => chunk.key).sort()
        : manifest.chunks
            .filter((chunk) => chunkIntersectsView(chunk, camera))
            .map((chunk) => chunk.key)
            .sort()
    const signature = nextActive.join('|')
    if (signature === activeKeySignature.current) return

    activeKeySignature.current = signature
    setActiveKeys(nextActive)
    loadChunkKeys(nextActive)
  })

  return (
    <group ref={groupRef} visible={false}>
      <CityGround />
      {activeKeys.map((key) => {
        const chunk = loadedChunks[key]
        if (!chunk) return null
        return <BuildingChunk key={key} chunk={chunk} name={chunk.name} />
      })}
    </group>
  )
}
