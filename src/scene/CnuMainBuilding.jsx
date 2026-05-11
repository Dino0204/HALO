import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const SCROLL_START = 0.2857
const SCROLL_END = 0.5
const FINAL_MAP_REVEAL_START = 0.9286

export default function CnuMainBuilding() {
  const groupRef = useRef()
  const scroll = useScroll()
  const { scene } = useGLTF('/models/cnu-main-building.glb')

  const { x, z } = GWANGJU_LANDMARKS.cnuGate

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible =
      (t >= SCROLL_START && t < SCROLL_END) || t >= FINAL_MAP_REVEAL_START
  })

  return (
    <group ref={groupRef} visible={false}>
      <primitive
        object={scene}
        position={[x, 0, z - 3]}
        scale={0.05}
      />
    </group>
  )
}

useGLTF.preload('/models/cnu-main-building.glb')
