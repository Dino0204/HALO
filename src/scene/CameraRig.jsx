import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'
import { GWANGJU_CITY_CENTER, GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const SCENE_RANGES = [
  [0.0, 0.09],
  [0.09, 0.18],
  [0.18, 0.27],
  [0.27, 0.36],
  [0.36, 0.45],
  [0.45, 0.54],
  [0.54, 0.63],
  [0.63, 0.72],
  [0.72, 0.81],
  [0.81, 0.9],
  [0.9, 1.0],
]

const { cnuGate, geumnamroPark, jeonilBuilding } = GWANGJU_LANDMARKS
const GEO_URL = '/data/provinces-geo-simple.json'

const CNU_POS = { x: cnuGate.x - 2.2, z: cnuGate.z + 7.5 }
const CNU_TGT = { x: cnuGate.x, z: cnuGate.z }
const GEUMNAMRO_POS = { x: geumnamroPark.x - 3.2, z: geumnamroPark.z + 8.5 }
const GEUMNAMRO_TGT = { x: jeonilBuilding.x, z: jeonilBuilding.z }
const OFFICE_POS = { x: jeonilBuilding.x - 4.5, z: jeonilBuilding.z + 9 }
const OFFICE_TGT = { x: jeonilBuilding.x, z: jeonilBuilding.z }
const MAP_CENTER = { x: 0, z: 4 }
const GWANGJU_MAP_FALLBACK = { x: -13, z: 32 }
const FINAL_CITY_VIEW = { x: GWANGJU_CITY_CENTER.x - 10, z: GWANGJU_CITY_CENTER.z + 4 }

const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()
const _viewDir = new THREE.Vector3()
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const MAP_UP = new THREE.Vector3(0, 0, -1)
const MAP_UP_SINGULARITY_THRESHOLD = 0.92

function lngLatToMapPoint(lng, lat) {
  return {
    x: (lng - 127.5) * 20,
    z: -(lat - 36.5) * 24,
  }
}

function visitCoordinates(coordinates, visitor) {
  if (typeof coordinates[0] === 'number') {
    visitor(coordinates)
    return
  }
  coordinates.forEach((child) => visitCoordinates(child, visitor))
}

function getFeatureMapCenter(feature) {
  const bbox = {
    minLng: Infinity,
    minLat: Infinity,
    maxLng: -Infinity,
    maxLat: -Infinity,
  }

  visitCoordinates(feature.geometry.coordinates, ([lng, lat]) => {
    bbox.minLng = Math.min(bbox.minLng, lng)
    bbox.minLat = Math.min(bbox.minLat, lat)
    bbox.maxLng = Math.max(bbox.maxLng, lng)
    bbox.maxLat = Math.max(bbox.maxLat, lat)
  })

  if (!Number.isFinite(bbox.minLng) || !Number.isFinite(bbox.minLat)) {
    return GWANGJU_MAP_FALLBACK
  }

  return lngLatToMapPoint((bbox.minLng + bbox.maxLng) / 2, (bbox.minLat + bbox.maxLat) / 2)
}

function buildKeyframes(gwangjuMapCenter) {
  return [
    [0.0, MAP_CENTER.x, 80, MAP_CENTER.z, MAP_CENTER.x, 0, MAP_CENTER.z],
    [0.09, -10, 70, -20, -10, 0, -26],
    [0.18, MAP_CENTER.x, 78, MAP_CENTER.z, MAP_CENTER.x, 0, MAP_CENTER.z],
    [0.27, gwangjuMapCenter.x, 54, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.36, gwangjuMapCenter.x, 24, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.42, gwangjuMapCenter.x, 18, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.45, CNU_POS.x, 1.1, CNU_POS.z, CNU_TGT.x, 0.38, CNU_TGT.z],
    [0.54, GEUMNAMRO_POS.x, 1.15, GEUMNAMRO_POS.z, GEUMNAMRO_TGT.x, 0.4, GEUMNAMRO_TGT.z],
    [0.63, gwangjuMapCenter.x, 60, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.68, gwangjuMapCenter.x, 60, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.72, gwangjuMapCenter.x, 8, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.81, OFFICE_POS.x, 1.45, OFFICE_POS.z, OFFICE_TGT.x, 0.5, OFFICE_TGT.z],
    [0.9, OFFICE_POS.x - 2.5, 1.15, OFFICE_POS.z + 4, OFFICE_TGT.x, 0.45, OFFICE_TGT.z],
    [0.94, OFFICE_POS.x - 2.5, 1.15, OFFICE_POS.z + 4, OFFICE_TGT.x, 0.45, OFFICE_TGT.z],
    [1.0, FINAL_CITY_VIEW.x, 220, FINAL_CITY_VIEW.z, FINAL_CITY_VIEW.x, 0, FINAL_CITY_VIEW.z],
  ]
}

function lerpKeyframes(t, keyframes) {
  let i = 0
  while (i < keyframes.length - 2 && keyframes[i + 1][0] <= t) i++
  const [t0, px0, py0, pz0, tx0, ty0, tz0] = keyframes[i]
  const [t1, px1, py1, pz1, tx1, ty1, tz1] = keyframes[i + 1]
  const alpha = t1 === t0 ? 0 : THREE.MathUtils.clamp((t - t0) / (t1 - t0), 0, 1)
  const s = THREE.MathUtils.smoothstep(alpha, 0, 1)
  _pos.set(
    THREE.MathUtils.lerp(px0, px1, s),
    THREE.MathUtils.lerp(py0, py1, s),
    THREE.MathUtils.lerp(pz0, pz1, s)
  )
  _tgt.set(
    THREE.MathUtils.lerp(tx0, tx1, s),
    THREE.MathUtils.lerp(ty0, ty1, s),
    THREE.MathUtils.lerp(tz0, tz1, s)
  )
}

function applyStableCameraUp(camera) {
  _viewDir.subVectors(_tgt, _pos).normalize()
  const lookDownAmount = Math.abs(_viewDir.dot(WORLD_UP))
  if (lookDownAmount > MAP_UP_SINGULARITY_THRESHOLD) {
    camera.up.copy(MAP_UP)
  } else if (lookDownAmount < 0.6) {
    camera.up.copy(WORLD_UP)
  } else {
    const blend = (lookDownAmount - 0.6) / (MAP_UP_SINGULARITY_THRESHOLD - 0.6)
    camera.up.lerpVectors(WORLD_UP, MAP_UP, blend).normalize()
  }
}

export default function CameraRig() {
  const scroll = useScroll()
  const mouseRef = useRef({ x: 0, y: 0 })
  const prevSceneRef = useRef(-1)
  const keyframesRef = useRef(buildKeyframes(GWANGJU_MAP_FALLBACK))

  useEffect(() => {
    let cancelled = false

    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load Korea map GeoJSON for camera focus: ${r.status}`)
        }
        return r.json()
      })
      .then((geoJson) => {
        if (cancelled) return
        const gwangju = geoJson.features.find(
          (feature) => feature.properties?.name === '광주광역시'
        )
        if (!gwangju) {
          throw new Error('Gwangju boundary was not found in Korea map GeoJSON')
        }
        keyframesRef.current = buildKeyframes(getFeatureMapCenter(gwangju))
      })
      .catch(console.error)

    return () => {
      cancelled = true
    }
  }, [])

  useFrame(({ camera }) => {
    window._518mouseRef = mouseRef
    const t = scroll.offset

    // Update scene store
    const idx = SCENE_RANGES.findIndex(([s, e]) => t >= s && t < e)
    const scene = idx === -1 ? 10 : idx
    if (scene !== prevSceneRef.current) {
      prevSceneRef.current = scene
      useSceneStore.getState().setScene(scene)
    }

    // Move camera
    lerpKeyframes(t, keyframesRef.current)
    applyStableCameraUp(camera)
    camera.position.copy(_pos)
    camera.lookAt(_tgt)

    // Mouse offset only after the map-only Gwangju emphasis has finished.
    if (t > 0.39 && t < 0.63) {
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      camera.rotation.y += mx * ((6 * Math.PI) / 180)
      camera.rotation.x += my * ((3 * Math.PI) / 180)
    }
  })

  return null
}
