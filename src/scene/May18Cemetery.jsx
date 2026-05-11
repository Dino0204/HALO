import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import { CEMETERY_POS } from './landmarkPositions'

const SCROLL_START = 0.9643

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function MemorialParticles() {
  const ref = useRef()
  const scroll = useScroll()
  const COUNT = 50
  const { base, positions } = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    const rng = seededRandom(518)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = CEMETERY_POS.x + (rng() - 0.5) * 14
      arr[i * 3 + 1] = CEMETERY_POS.y + 0.5 + rng() * 6
      arr[i * 3 + 2] = CEMETERY_POS.z + (rng() - 0.5) * 14
    }
    return { base: arr, positions: arr.slice() }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const visible = scroll.offset >= SCROLL_START
    ref.current.visible = visible
    if (!visible) return
    const pos = ref.current.geometry.attributes.position.array
    const speed = clock.elapsedTime * 0.4
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] = base[i * 3 + 1] + ((speed + i * 0.1) % 8)
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

export default function May18Cemetery() {
  const groupRef = useRef()
  const lightRef = useRef()
  const scroll = useScroll()
  const { scene } = useGLTF('/models/may18-cemetery.glb')

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t >= SCROLL_START
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={[CEMETERY_POS.x, CEMETERY_POS.y, CEMETERY_POS.z]}
        scale={1}
      />
      <directionalLight
        ref={lightRef}
        color="#ffd9a0"
        intensity={1.2}
        position={[CEMETERY_POS.x + 10, 20, CEMETERY_POS.z + 10]}
      />
      <MemorialParticles />
    </group>
  )
}

useGLTF.preload('/models/may18-cemetery.glb')
