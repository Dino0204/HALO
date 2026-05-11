import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

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

const CNU_POS = { x: cnuGate.x - 2.2, z: cnuGate.z + 7.5 }
const CNU_TGT = { x: cnuGate.x, z: cnuGate.z }
const GEUMNAMRO_POS = { x: geumnamroPark.x - 3.2, z: geumnamroPark.z + 8.5 }
const GEUMNAMRO_TGT = { x: jeonilBuilding.x, z: jeonilBuilding.z }
const OFFICE_POS = { x: jeonilBuilding.x - 4.5, z: jeonilBuilding.z + 9 }
const OFFICE_TGT = { x: jeonilBuilding.x, z: jeonilBuilding.z }

const KEYFRAMES = [
  [0.0, 0, 80, 4, 0, 0, 4],
  [0.09, -10, 70, -20, -10, 0, -26],
  [0.18, 0, 78, 4, 0, 0, 4],
  [0.27, -13, 35, 32, -13, 0, 32],
  [0.36, -13, 35, 32, -13, 0, 32],
  [0.45, CNU_POS.x, 1.1, CNU_POS.z, CNU_TGT.x, 0.38, CNU_TGT.z],
  [0.54, GEUMNAMRO_POS.x, 1.15, GEUMNAMRO_POS.z, GEUMNAMRO_TGT.x, 0.4, GEUMNAMRO_TGT.z],
  [0.63, 0, 80, 4, 0, 0, 4],
  [0.72, OFFICE_POS.x, 1.45, OFFICE_POS.z, OFFICE_TGT.x, 0.5, OFFICE_TGT.z],
  [0.81, OFFICE_POS.x - 2.5, 1.15, OFFICE_POS.z + 4, OFFICE_TGT.x, 0.45, OFFICE_TGT.z],
  [0.9, 0, 45, 4, 0, 0, 4],
  [1.0, 0, 120, 4, 0, 0, 4],
]

const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()
const _viewDir = new THREE.Vector3()
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const MAP_UP = new THREE.Vector3(0, 0, -1)
const MAP_UP_SINGULARITY_THRESHOLD = 0.92
const CITY_CAMERA_RANGES = [
  [0.42, 0.63],
  [0.72, 0.92],
]

function lerpKeyframes(t) {
  let i = 0
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1][0] <= t) i++
  const [t0, px0, py0, pz0, tx0, ty0, tz0] = KEYFRAMES[i]
  const [t1, px1, py1, pz1, tx1, ty1, tz1] = KEYFRAMES[i + 1]
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

function isCityCameraRange(t) {
  return CITY_CAMERA_RANGES.some(([start, end]) => t >= start && t < end)
}

function applyStableCameraUp(camera, t) {
  if (isCityCameraRange(t)) {
    camera.up.copy(WORLD_UP)
    return
  }

  _viewDir.subVectors(_tgt, _pos).normalize()
  const mapUpIsSafe = Math.abs(_viewDir.dot(MAP_UP)) < MAP_UP_SINGULARITY_THRESHOLD
  camera.up.copy(mapUpIsSafe ? MAP_UP : WORLD_UP)
}

export default function CameraRig() {
  const scroll = useScroll()
  const mouseRef = useRef({ x: 0, y: 0 })
  const prevSceneRef = useRef(-1)

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
    lerpKeyframes(t)
    applyStableCameraUp(camera, t)
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
