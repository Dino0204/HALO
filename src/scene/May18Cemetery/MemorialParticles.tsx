import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import type { Points } from 'three'
import { seededRandom } from '../../utils/seededRandom'
import { inRange } from '../../utils/scrollRange'
import { CEMETERY_POS } from '../landmarkPositions'
import {
  PARTICLE_COUNT,
  PARTICLE_HEIGHT,
  PARTICLE_SEED,
  PARTICLE_SIZE,
  PARTICLE_SPREAD,
  SCROLL_START,
} from './constants'

export default function MemorialParticles() {
  const ref = useRef<Points>(null!)
  const scroll = useScroll()

  const { base, positions } = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    const rng = seededRandom(PARTICLE_SEED)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = CEMETERY_POS.x + (rng() - 0.5) * PARTICLE_SPREAD
      arr[i * 3 + 1] = CEMETERY_POS.y + 0.5 + rng() * PARTICLE_HEIGHT
      arr[i * 3 + 2] = CEMETERY_POS.z + (rng() - 0.5) * PARTICLE_SPREAD
    }
    return { base: arr, positions: arr.slice() }
  }, [])

  // 가시성은 부모 ScrollRange가 관리한다.
  // 여기서 구간을 다시 보는 이유는 화면 밖에서 50개 좌표 갱신 + 버퍼 업로드를
  // 돌리지 않기 위해서다.
  useFrame(({ clock }) => {
    if (!ref.current || !inRange(scroll.offset, SCROLL_START)) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    const speed = clock.elapsedTime * 0.4
    for (let i = 0; i < PARTICLE_COUNT; i++) {
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
