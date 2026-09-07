import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { seededRandom } from '@/shared/lib/seededRandom'
import { inRange } from '@/entities/scroll/model/scrollRange'
import {
  BUILDING_MODEL_SCALE,
  BUILDING_POS,
  BULLET_COUNT,
  BULLET_SEED,
  SCROLL_END,
  SCROLL_START,
  localProgress,
} from '../model/constants'

// 전일빌딩 외벽 탄흔. 국과수 감정 245개를 상징적으로 축약한 배치.
export default function BulletHoles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const scroll = useScroll()

  const matrices = useMemo(() => {
    const rng = seededRandom(BULLET_SEED)
    const dummy = new THREE.Object3D()
    const items: THREE.Matrix4[] = []
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
    matrices.forEach((matrix, i) => meshRef.current.setMatrixAt(i, matrix))
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  useFrame(() => {
    if (!meshRef.current || !inRange(scroll.offset, SCROLL_START, SCROLL_END)) return
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    material.opacity = THREE.MathUtils.smoothstep(localProgress(scroll.offset), 0.3, 0.9)
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BULLET_COUNT]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#ff3333" transparent opacity={0} />
    </instancedMesh>
  )
}
