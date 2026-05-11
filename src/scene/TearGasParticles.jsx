import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const COUNT = 800
const GEUMNAMRO_CENTER = {
  x: (GWANGJU_LANDMARKS.geumnamroPark.x + GWANGJU_LANDMARKS.jeonilBuilding.x) / 2,
  z: (GWANGJU_LANDMARKS.geumnamroPark.z + GWANGJU_LANDMARKS.jeonilBuilding.z) / 2,
}

export default function TearGasParticles() {
  const ref = useRef()
  const scroll = useScroll()

  const { base, positions } = useMemo(() => {
    const base = new Float32Array(COUNT * 3)
    let seed = 1234
    function rng() {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 0x100000000
    }
    for (let i = 0; i < COUNT; i++) {
      const center = i < COUNT / 2 ? GWANGJU_LANDMARKS.cnuGate : GEUMNAMRO_CENTER
      const spreadX = i < COUNT / 2 ? 18 : 36
      const spreadZ = i < COUNT / 2 ? 14 : 24
      base[i * 3] = center.x + (rng() - 0.5) * spreadX
      base[i * 3 + 1] = rng() * 8
      base[i * 3 + 2] = center.z + (rng() - 0.5) * spreadZ
    }
    return { base, positions: base.slice() }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = scroll.offset
    ref.current.visible = t > 0.36 && t < 0.63
    if (!ref.current.visible) return

    const pos = ref.current.geometry.attributes.position.array
    const speed = clock.elapsedTime * 1.5
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] = (base[i * 3 + 1] + speed) % 12
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#cccccc"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
