import { useMemo } from 'react'
import { seededRandom } from '@/shared/lib/seededRandom'
import { MBC_POS } from '@/entities/gwangju/model/landmarks'
import { CROWD_COUNT, CROWD_SEED } from '../model/constants'

export default function Crowd() {
  const items = useMemo(() => {
    const rng = seededRandom(CROWD_SEED)
    return Array.from({ length: CROWD_COUNT }, (_, i) => ({
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
