import { useRef, useMemo } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// seeded pseudo-random (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const GRID_W = 30
const GRID_D = 40
const SPACING = 8
const COUNT = GRID_W * GRID_D

export default function CityMesh() {
  const meshRef = useRef()
  const scroll = useScroll()

  const { matrices, baseColor, finalColor } = useMemo(() => {
    const rand = mulberry32(518)
    const dummy = new THREE.Object3D()
    const matrices = []
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

  // 매트릭스 초기 세팅
  const meshReady = useRef(false)
  useFrame(() => {
    if (!meshRef.current) return
    if (!meshReady.current) {
      matrices.forEach((m, i) => meshRef.current.setMatrixAt(i, m))
      meshRef.current.instanceMatrix.needsUpdate = true
      meshReady.current = true
    }

    // Scene 4 진입 시 건물 색상 전환
    const t = scroll.offset
    const colorProgress = THREE.MathUtils.smoothstep(t, 0.8, 1.0)
    const color = baseColor.clone().lerp(finalColor, colorProgress)
    for (let i = 0; i < COUNT; i++) {
      meshRef.current.setColorAt(i, color)
    }
    meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1a1a1a" />
    </instancedMesh>
  )
}
