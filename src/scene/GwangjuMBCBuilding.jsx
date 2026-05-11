import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import { MBC_POS } from './landmarkPositions'

const MBC_MODEL_SCALE = 0.4
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

function Smoke() {
  const ref = useRef()
  const scroll = useScroll()
  const COUNT = 1500
  const { base, positions } = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    const rng = seededRandom(7331)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = MBC_POS.x + (rng() - 0.5) * 6
      arr[i * 3 + 1] = MBC_POS.y + rng() * 12
      arr[i * 3 + 2] = MBC_POS.z + (rng() - 0.5) * 6
    }
    return { base: arr, positions: arr.slice() }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const visible = scroll.offset >= SCROLL_START && scroll.offset < SCROLL_END
    ref.current.visible = visible
    if (!visible) return
    const pos = ref.current.geometry.attributes.position.array
    const speed = clock.elapsedTime * 3.0
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] = (base[i * 3 + 1] + speed) % 16
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        color="#332211"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
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
      <Smoke />
      <Crowd />
    </group>
  )
}

useGLTF.preload('/models/gwangju-mbc.glb')
