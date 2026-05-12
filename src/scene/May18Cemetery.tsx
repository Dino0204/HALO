import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import type { DirectionalLight, Group, Points } from 'three'
import { CEMETERY_POS } from './landmarkPositions'
import { cloneAsGrayscale } from '../utils/grayscaleModel'

const SCROLL_START = 0.9857
const CEMETERY_MODEL_SCALE = 0.05
const PARTICLE_SPREAD = 4.2
const PARTICLE_HEIGHT = 1.8
const PARTICLE_SIZE = 0.04

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function MemorialParticles() {
  const ref = useRef<Points>(null!)
  const scroll = useScroll()
  const COUNT = 50
  const { base, positions } = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    const rng = seededRandom(518)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = CEMETERY_POS.x + (rng() - 0.5) * PARTICLE_SPREAD
      arr[i * 3 + 1] = CEMETERY_POS.y + 0.5 + rng() * PARTICLE_HEIGHT
      arr[i * 3 + 2] = CEMETERY_POS.z + (rng() - 0.5) * PARTICLE_SPREAD
    }
    return { base: arr, positions: arr.slice() }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const visible = scroll.offset >= SCROLL_START
    ref.current.visible = visible
    if (!visible) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    const speed = clock.elapsedTime * 0.4
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] = base[i * 3 + 1] + ((speed + i * 0.1) % 2.4)
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={PARTICLE_SIZE}
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
  const groupRef = useRef<Group>(null!)
  const lightRef = useRef<DirectionalLight>(null!)
  const scroll = useScroll()
  const { scene } = useGLTF('/models/may18-cemetery.glb')
  const cemeteryModel = useMemo(() => cloneAsGrayscale(scene), [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t >= SCROLL_START
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={cemeteryModel}
        position={[CEMETERY_POS.x, CEMETERY_POS.y, CEMETERY_POS.z]}
        scale={CEMETERY_MODEL_SCALE}
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
