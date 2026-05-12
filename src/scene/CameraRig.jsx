import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'
import { GWANGJU_CITY_CENTER, GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'
import { MBC_POS, CEMETERY_POS } from './landmarkPositions'

const SCENE_RANGES = [
  [0.0, 0.0714], // 00 한국 지도
  [0.0714, 0.1429], // 01 12·12
  [0.1429, 0.2143], // 02 전국 시위
  [0.2143, 0.2857], // 03 광주 확대
  [0.2857, 0.3571], // 04 진압
  [0.3571, 0.4286], // 05 차량 시위
  [0.4286, 0.5], // 06 광주MBC 방화
  [0.5, 0.5714], // 07 집단 발포
  [0.5714, 0.6429], // 08 전일빌딩
  [0.6429, 0.7143], // 09 봉쇄
  [0.7143, 0.7857], // 10 시민궐기대회
  [0.7857, 0.8571], // 11 도청 진입
  [0.8571, 0.9286], // 12 병원
  [0.9286, 1.0001], // 13 기억/묘지
]

const { cnuGate, geumnamroPark, jeonilBuilding, provincialOffice } = GWANGJU_LANDMARKS
const GEO_URL = '/data/provinces-geo-simple.json'

const CNU_POS = { x: cnuGate.x - 1.4, z: cnuGate.z + 4.8 }
const CNU_TGT = { x: cnuGate.x, z: cnuGate.z }
const GEUMNAMRO_POS = { x: geumnamroPark.x - 3.2, z: geumnamroPark.z + 8.5 }
const GEUMNAMRO_TGT = { x: jeonilBuilding.x, z: jeonilBuilding.z }
const GEUMNAMRO_WIDE_TGT = {
  x: (geumnamroPark.x + jeonilBuilding.x) / 2,
  z: (geumnamroPark.z + jeonilBuilding.z) / 2,
}
const GEUMNAMRO_WIDE_POS = {
  x: GEUMNAMRO_WIDE_TGT.x - 7.5,
  z: GEUMNAMRO_WIDE_TGT.z + 13.5,
}
const OFFICE_POS = { x: provincialOffice.x - 6.4, z: provincialOffice.z + 9.6 }
const OFFICE_TGT = { x: provincialOffice.x + 0.1, z: provincialOffice.z + 3.2 }
const MAP_CENTER = { x: 0, z: 4 }
const GWANGJU_MAP_FALLBACK = { x: -13, z: 32 }
const FINAL_CITY_VIEW = { x: GWANGJU_CITY_CENTER.x - 10, z: GWANGJU_CITY_CENTER.z + 4 }

const MBC_CAM_POS = { x: MBC_POS.x + 8, z: MBC_POS.z + 14 }
const MBC_CAM_TGT = { x: MBC_POS.x, z: MBC_POS.z }
const JEONIL_CAM_POS = { x: jeonilBuilding.x, z: jeonilBuilding.z + 18 }
const JEONIL_CAM_TGT = { x: jeonilBuilding.x, z: jeonilBuilding.z }
const SQUARE_CAM_POS = { x: jeonilBuilding.x, z: jeonilBuilding.z + 7.7 }
const SQUARE_CAM_TGT = { x: jeonilBuilding.x, z: jeonilBuilding.z + 4 }
const CEMETERY_CAM_POS = { x: CEMETERY_POS.x + 4.5, z: CEMETERY_POS.z + 7.5 }
const CEMETERY_CAM_TGT = { x: CEMETERY_POS.x, z: CEMETERY_POS.z }

const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()
const _smoothedPos = new THREE.Vector3()
const _smoothedTgt = new THREE.Vector3()
const _viewDir = new THREE.Vector3()
const _desiredUp = new THREE.Vector3()
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const MAP_UP = new THREE.Vector3(0, 0, -1)
const MAP_UP_SINGULARITY_THRESHOLD = 0.92
const CNU_DESCENT_START = 0.2857
const CNU_DESCENT_END = 0.3571

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
    [0.0714, -10, 70, -20, -10, 0, -26],
    [0.1429, MAP_CENTER.x, 78, MAP_CENTER.z, MAP_CENTER.x, 0, MAP_CENTER.z],
    [0.2143, gwangjuMapCenter.x, 54, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.2857, gwangjuMapCenter.x, 24, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.3571, CNU_POS.x, 0.9, CNU_POS.z, CNU_TGT.x, 0.35, CNU_TGT.z],
    [0.4286, GEUMNAMRO_POS.x, 1.15, GEUMNAMRO_POS.z, GEUMNAMRO_TGT.x, 0.4, GEUMNAMRO_TGT.z],
    [0.5, MBC_CAM_POS.x, 5, MBC_CAM_POS.z, MBC_CAM_TGT.x, 3, MBC_CAM_TGT.z],
    [
      0.5357,
      GEUMNAMRO_WIDE_POS.x,
      8.5,
      GEUMNAMRO_WIDE_POS.z,
      GEUMNAMRO_WIDE_TGT.x,
      0.2,
      GEUMNAMRO_WIDE_TGT.z,
    ],
    [
      0.5714,
      GEUMNAMRO_WIDE_POS.x,
      8.5,
      GEUMNAMRO_WIDE_POS.z,
      GEUMNAMRO_WIDE_TGT.x,
      0.2,
      GEUMNAMRO_WIDE_TGT.z,
    ],
    [0.6429, JEONIL_CAM_POS.x, 4, JEONIL_CAM_POS.z, JEONIL_CAM_TGT.x, 12, JEONIL_CAM_TGT.z],
    [0.7143, gwangjuMapCenter.x, 60, gwangjuMapCenter.z, gwangjuMapCenter.x, 0, gwangjuMapCenter.z],
    [0.7857, SQUARE_CAM_POS.x, 4.2, SQUARE_CAM_POS.z, SQUARE_CAM_TGT.x, 0.45, SQUARE_CAM_TGT.z],
    [0.8571, OFFICE_POS.x, 2.4, OFFICE_POS.z, OFFICE_TGT.x, 0.65, OFFICE_TGT.z],
    [0.9286, OFFICE_POS.x - 0.9, 1.7, OFFICE_POS.z + 1.4, OFFICE_TGT.x, 0.45, OFFICE_TGT.z],
    [0.9643, FINAL_CITY_VIEW.x, 180, FINAL_CITY_VIEW.z, FINAL_CITY_VIEW.x, 0, FINAL_CITY_VIEW.z],
    [0.9857, FINAL_CITY_VIEW.x, 180, FINAL_CITY_VIEW.z, FINAL_CITY_VIEW.x, 0, FINAL_CITY_VIEW.z],
    [1.0, CEMETERY_CAM_POS.x, 2.6, CEMETERY_CAM_POS.z, CEMETERY_CAM_TGT.x, 0.7, CEMETERY_CAM_TGT.z],
  ]
}

function lerpKeyframes(t, keyframes) {
  let i = 0
  while (i < keyframes.length - 2 && keyframes[i + 1][0] <= t) i++
  const [t0, px0, py0, pz0, tx0, ty0, tz0, mode0] = keyframes[i]
  const [t1, px1, py1, pz1, tx1, ty1, tz1, mode1] = keyframes[i + 1]
  const alpha = t1 === t0 ? 0 : THREE.MathUtils.clamp((t - t0) / (t1 - t0), 0, 1)
  const s =
    mode0 === 'linear' && mode1 === 'linear' ? alpha : THREE.MathUtils.smoothstep(alpha, 0, 1)
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

function applyStableCameraUp(camera, t) {
  if (t >= CNU_DESCENT_START && t <= CNU_DESCENT_END) {
    const progress = (t - CNU_DESCENT_START) / (CNU_DESCENT_END - CNU_DESCENT_START)
    const blend = THREE.MathUtils.smoothstep(progress, 0, 1)
    camera.up.lerpVectors(MAP_UP, WORLD_UP, blend).normalize()
    return
  }

  _viewDir.subVectors(_tgt, _pos).normalize()
  const lookDownAmount = Math.abs(_viewDir.dot(WORLD_UP))
  if (lookDownAmount > MAP_UP_SINGULARITY_THRESHOLD) {
    _desiredUp.copy(MAP_UP)
  } else if (lookDownAmount < 0.6) {
    _desiredUp.copy(WORLD_UP)
  } else {
    const blend = (lookDownAmount - 0.6) / (MAP_UP_SINGULARITY_THRESHOLD - 0.6)
    _desiredUp.lerpVectors(WORLD_UP, MAP_UP, blend).normalize()
  }
  camera.up.copy(_desiredUp)
}

export default function CameraRig() {
  const scroll = useScroll()
  const mouseRef = useRef({ x: 0, y: 0 })
  const prevSceneRef = useRef(-1)
  const cameraInitializedRef = useRef(false)
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

  useFrame(({ camera }, delta) => {
    window._518mouseRef = mouseRef
    const t = scroll.offset

    // Update scene store
    const idx = SCENE_RANGES.findIndex(([s, e]) => t >= s && t < e)
    const scene = idx === -1 ? 13 : idx
    if (scene !== prevSceneRef.current) {
      prevSceneRef.current = scene
      useSceneStore.getState().setScene(scene)
    }

    // Move camera
    lerpKeyframes(t, keyframesRef.current)

    if (!cameraInitializedRef.current) {
      _smoothedPos.copy(_pos)
      _smoothedTgt.copy(_tgt)
      cameraInitializedRef.current = true
    }

    const damping = t >= 0.9286 ? 1.6 : 8
    _smoothedPos.x = THREE.MathUtils.damp(_smoothedPos.x, _pos.x, damping, delta)
    _smoothedPos.y = THREE.MathUtils.damp(_smoothedPos.y, _pos.y, damping, delta)
    _smoothedPos.z = THREE.MathUtils.damp(_smoothedPos.z, _pos.z, damping, delta)
    _smoothedTgt.x = THREE.MathUtils.damp(_smoothedTgt.x, _tgt.x, damping, delta)
    _smoothedTgt.y = THREE.MathUtils.damp(_smoothedTgt.y, _tgt.y, damping, delta)
    _smoothedTgt.z = THREE.MathUtils.damp(_smoothedTgt.z, _tgt.z, damping, delta)

    _pos.copy(_smoothedPos)
    _tgt.copy(_smoothedTgt)
    applyStableCameraUp(camera, t)
    camera.position.copy(_smoothedPos)
    camera.lookAt(_smoothedTgt)

    // Mouse offset only after the map-only Gwangju emphasis has finished.
    if (t > CNU_DESCENT_END && t < 0.5) {
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      camera.rotation.y += mx * ((6 * Math.PI) / 180)
      camera.rotation.x += my * ((3 * Math.PI) / 180)
    }
  })

  return null
}
