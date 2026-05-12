import { useRef, useMemo } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GRID_W = 30
const GRID_D = 40
const SPACING = 8
const COUNT = GRID_W * GRID_D

export default function CityMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const scroll = useScroll()

  const { matrices, baseColor, finalColor } = useMemo(() => {
    const rand = mulberry32(518)
    const dummy = new THREE.Object3D()
    const matrices: THREE.Matrix4[] = []
    const baseColor = new THREE.Color('#1a1a1a')
    const finalColor = new THREE.Color('#8B4513')

    for (let i = 0; i < GRID_W; i++) {
      for (let j = 0; j < GRID_D; j++) {
        const r = rand()
        const height = 1 + r * 5
        const x = (i - GRID_W / 2) * SPACING + (rand() - 0.5) * 2
        const z = (j - GRID_D / 2) * SPACING + (rand() - 0.5) * 2
        dummy.position.set(x, height / 2, z)
        dummy.scale.set(3 + rand() * 3, height, 3 + rand() * 3)
        dummy.updateMatrix()
        matrices.push(dummy.matrix.clone())
      }
    }
    return { matrices, baseColor, finalColor }
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
    const colorProgress = THREE.MathUtils.smoothstep(t, 0.8, 1.0)
    const color = baseColor.clone().lerp(finalColor, colorProgress)
    for (let i = 0; i < COUNT; i++) {
      meshRef.current.setColorAt(i, color)
    }
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1a1a1a" />
    </instancedMesh>
  )
}
