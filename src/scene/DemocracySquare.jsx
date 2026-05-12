import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const SCROLL_START = 0.7143
const SCROLL_END = 0.7857
const SQUARE_POS = {
  x: GWANGJU_LANDMARKS.jeonilBuilding.x,
  y: -0.1,
  z: GWANGJU_LANDMARKS.jeonilBuilding.z + 4,
}
const SQUARE_MODEL_SCALE = 0.12
const SQUARE_GROUND_SIZE = 6.6

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
      <mesh
        position={[SQUARE_POS.x, SQUARE_POS.y - 0.01, SQUARE_POS.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[SQUARE_GROUND_SIZE, SQUARE_GROUND_SIZE]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <SunLight />
    </group>
  )
}

useGLTF.preload('/models/gwangju-fountain.glb')
