import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GRID_W = 20
const GRID_D = 25
const SPACING = 1.5
const COUNT = GRID_W * GRID_D
const CENTER_X = -13
const CENTER_Z = 32

export default function GwangjuCity() {
  const meshRef = useRef()
  const scroll = useScroll()

  const matrices = useMemo(() => {
    const rand = mulberry32(518)
    const dummy = new THREE.Object3D()
    const mats = []

    for (let i = 0; i < GRID_W; i++) {
      for (let j = 0; j < GRID_D; j++) {
        const r = rand()
        const height = 0.3 + r * 3
        const x = CENTER_X + (i - GRID_W / 2) * SPACING + (rand() - 0.5) * 0.5
        const z = CENTER_Z + (j - GRID_D / 2) * SPACING + (rand() - 0.5) * 0.5
        dummy.position.set(x, height / 2, z)
        dummy.scale.set(0.8 + rand() * 0.8, height, 0.8 + rand() * 0.8)
        dummy.updateMatrix()
        mats.push(dummy.matrix.clone())
      }
    }
    return mats
  }, [])

  const meshReady = useRef(false)
  useFrame(() => {
    if (!meshRef.current) return
    if (!meshReady.current) {
      matrices.forEach((m, i) => meshRef.current.setMatrixAt(i, m))
      meshRef.current.instanceMatrix.needsUpdate = true
      meshReady.current = true
    }

    const t = scroll.offset
    // Visible when near Gwangju (scenes 03–09): t 0.27–0.90
    meshRef.current.visible = t > 0.27 && t < 0.92
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1a1a1a" />
    </instancedMesh>
  )
}
