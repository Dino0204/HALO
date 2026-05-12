import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const SCROLL_START = 0.7143
const SCROLL_END = 0.7857
const SQUARE_POS = {
  x: GWANGJU_LANDMARKS.jeonilBuilding.x,
  y: 0,
  z: GWANGJU_LANDMARKS.jeonilBuilding.z + 4,
}
const SQUARE_MODEL_SCALE = 0.12
const SQUARE_GATHERING_RADIUS = 1.8
const SQUARE_GROUND_SIZE = 6.6
const CITIZEN_COUNT = 1500

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function Citizens() {
  const meshRef = useRef()
  const scroll = useScroll()

  const baseMatrices = useMemo(() => {
    const rng = seededRandom(523)
    const dummy = new THREE.Object3D()
    const arr = []
    for (let i = 0; i < CITIZEN_COUNT; i++) {
      const radius = 1.5 + rng() * SQUARE_GATHERING_RADIUS
      const angle = rng() * Math.PI * 2
      const x = SQUARE_POS.x + Math.cos(angle) * radius + (rng() - 0.5) * 0.6
      const z = SQUARE_POS.z + Math.sin(angle) * radius + (rng() - 0.5) * 0.6
      dummy.position.set(x, 0.9, z)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      arr.push({ x, z, base: dummy.matrix.clone() })
    }
    return arr
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = scroll.offset
    const visible = t >= SCROLL_START && t < SCROLL_END
    meshRef.current.visible = visible
    if (!visible) return
    const wave = clock.elapsedTime
    for (let i = 0; i < CITIZEN_COUNT; i++) {
      const item = baseMatrices[i]
      const sway = Math.sin(wave * 0.8 + i * 0.07) * 0.08
      dummy.position.set(item.x + sway, 0.9, item.z)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, CITIZEN_COUNT]} visible={false}>
      <boxGeometry args={[0.4, 1.8, 0.4]} />
      <meshStandardMaterial color="#cccccc" />
    </instancedMesh>
  )
}

function SunLight() {
  const ref = useRef()
  const scroll = useScroll()
  useFrame(() => {
    if (!ref.current) return
    const t = scroll.offset
    ref.current.visible = t >= SCROLL_START && t < SCROLL_END
  })
  return (
    <directionalLight
      ref={ref}
      color="#fff6e0"
      intensity={1.0}
      position={[SQUARE_POS.x + 8, 20, SQUARE_POS.z + 8]}
    />
  )
}

export default function DemocracySquare() {
  const groupRef = useRef()
  const scroll = useScroll()
  const { scene } = useGLTF('/models/gwangju-fountain.glb')

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t >= SCROLL_START && t < SCROLL_END
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={[SQUARE_POS.x, SQUARE_POS.y, SQUARE_POS.z]}
        scale={SQUARE_MODEL_SCALE}
      />
      <mesh position={[SQUARE_POS.x, -0.01, SQUARE_POS.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SQUARE_GROUND_SIZE, SQUARE_GROUND_SIZE]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <Citizens />
      <SunLight />
    </group>
  )
}

useGLTF.preload('/models/gwangju-fountain.glb')
