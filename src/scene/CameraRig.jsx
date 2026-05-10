import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'

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

const KEYFRAMES = [
  [0.0, 0, 80, 4, 0, 0, 4],
  [0.09, -10, 70, -20, -10, 0, -26],
  [0.18, 0, 78, 4, 0, 0, 4],
  [0.27, -13, 70, 32, -13, 0, 32],
  [0.36, -13, 70, 32, -13, 0, 32],
  [0.45, -13, 25, 18, -13, 0, 32],
  [0.54, -13, 1.8, 40, -13, 1.8, 28],
  [0.63, 0, 80, 4, 0, 0, 4],
  [0.72, -3, 8, 52, -13, 2, 32],
  [0.81, -13, 8, 50, -13, 2, 35],
  [0.9, 0, 45, 4, 0, 0, 4],
  [1.0, 0, 120, 4, 0, 0, 4],
]

const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()
const _viewDir = new THREE.Vector3()
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const MAP_UP = new THREE.Vector3(0, 0, -1)
const MAP_UP_SINGULARITY_THRESHOLD = 0.92

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

function applyStableCameraUp(camera) {
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
