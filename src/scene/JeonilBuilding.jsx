import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const SCROLL_START = 0.5714
const SCROLL_END = 0.6429
const BUILDING_POS = {
  x: GWANGJU_LANDMARKS.jeonilBuilding.x,
  y: 0,
  z: GWANGJU_LANDMARKS.jeonilBuilding.z,
}
const BUILDING_MODEL_SCALE = 0.05
const BULLET_COUNT = 245

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function Helicopter() {
  const ref = useRef()
  const rotorRef = useRef()
  const scroll = useScroll()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = scroll.offset
    const visible = t >= SCROLL_START && t < SCROLL_END
    ref.current.visible = visible
    if (!visible) return
    const progress = (t - SCROLL_START) / (SCROLL_END - SCROLL_START)
    ref.current.position.x = BUILDING_POS.x + THREE.MathUtils.lerp(-14, 14, progress)
    ref.current.position.y = 14
    ref.current.position.z = BUILDING_POS.z - 4
    if (rotorRef.current) rotorRef.current.rotation.y = clock.elapsedTime * 25
  })
  return (
    <group ref={ref} visible={false}>
      <mesh>
        <boxGeometry args={[3, 0.8, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh ref={rotorRef} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.05, 16]} />
        <meshStandardMaterial color="#222222" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function BulletHoles() {
  const meshRef = useRef()
  const scroll = useScroll()

  const matrices = useMemo(() => {
    const rng = seededRandom(245)
    const dummy = new THREE.Object3D()
    const items = []
    for (let i = 0; i < BULLET_COUNT; i++) {
      dummy.position.set(
        BUILDING_POS.x + (rng() - 0.5) * 4 * BUILDING_MODEL_SCALE,
        0.8 + rng() * 3.8,
        BUILDING_POS.z + 1.2 * BUILDING_MODEL_SCALE + rng() * 0.1
      )
      dummy.updateMatrix()
      items.push(dummy.matrix.clone())
    }
    return items
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    matrices.forEach((matrix, i) => {
      meshRef.current.setMatrixAt(i, matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  useFrame(() => {
    if (!meshRef.current) return
    const t = scroll.offset
    const visible = t >= SCROLL_START && t < SCROLL_END
    meshRef.current.visible = visible
    if (!visible) return
    const local = (t - SCROLL_START) / (SCROLL_END - SCROLL_START)
    const opacity = THREE.MathUtils.smoothstep(local, 0.3, 0.9)
    if (meshRef.current.material) {
      meshRef.current.material.opacity = opacity
      meshRef.current.material.transparent = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, BULLET_COUNT]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#ff3333" transparent opacity={0} />
    </instancedMesh>
  )
}

export default function JeonilBuilding() {
  const groupRef = useRef()
  const scroll = useScroll()
  const { scene } = useGLTF('/models/jeonil-building.glb')

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t >= SCROLL_START && t < SCROLL_END
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={[BUILDING_POS.x, BUILDING_POS.y, BUILDING_POS.z]}
        scale={BUILDING_MODEL_SCALE}
      />
      <Helicopter />
      <BulletHoles />
    </group>
  )
}

useGLTF.preload('/models/jeonil-building.glb')
