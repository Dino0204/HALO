import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import { MBC_POS } from './landmarkPositions'

const MBC_MODEL_SCALE = 0.25
const SCROLL_START = 0.4286
const SCROLL_END = 0.5

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function FireFlicker() {
  const lightRef = useRef()
  const scroll = useScroll()
  useFrame(({ clock }) => {
    if (!lightRef.current) return
    const visible = scroll.offset >= SCROLL_START && scroll.offset < SCROLL_END
    lightRef.current.visible = visible
    if (visible) {
      const t = clock.elapsedTime
      lightRef.current.intensity = 2 + Math.sin(t * 6) * 1.5 + Math.sin(t * 13) * 0.8
    }
  })
  return (
    <pointLight
      ref={lightRef}
      color="#ff5500"
      intensity={0}
      distance={20}
      decay={1.5}
      position={[MBC_POS.x, MBC_POS.y + 2, MBC_POS.z + 2]}
    />
  )
}

function Crowd() {
  const COUNT = 30
  const items = useMemo(() => {
    const rng = seededRandom(42)
    return Array.from({ length: COUNT }, (_, i) => ({
      x: MBC_POS.x + (rng() - 0.5) * 10,
      z: MBC_POS.z + 6 + rng() * 4,
      h: 1.6 + rng() * 0.4,
      key: i,
    }))
  }, [])
  return (
    <group>
      {items.map((c) => (
        <mesh key={c.key} position={[c.x, c.h / 2, c.z]}>
          <boxGeometry args={[0.3, c.h, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  )
}

export default function GwangjuMBCBuilding() {
  const groupRef = useRef()
  const scroll = useScroll()
  const { scene } = useGLTF('/models/gwangju-mbc.glb')

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t >= SCROLL_START && t < SCROLL_END
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={[MBC_POS.x, MBC_POS.y, MBC_POS.z]}
        scale={MBC_MODEL_SCALE}
      />
      <FireFlicker />
      <Crowd />
    </group>
  )
}

useGLTF.preload('/models/gwangju-mbc.glb')
