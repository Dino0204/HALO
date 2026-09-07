import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { seededRandom } from '../../utils/seededRandom'
import { inRange } from '../../utils/scrollRange'
import {
  BUILDING_MODEL_SCALE,
  BUILDING_POS,
  SCROLL_END,
  SCROLL_START,
  TRACER_COUNT,
  TRACER_SEED,
  helicopterXAt,
  localProgress,
} from './constants'

const TRACER_ORIGIN_Y = 5.55
const TRACER_ORIGIN_Z_OFFSET = 1.15
const STREAM_START = 0.06
const STREAM_END = 0.9

// 프레임마다 재사용하는 스크래치 — CameraRig와 같은 방식으로 할당을 없앤다.
const _origin = new THREE.Vector3()
const _start = new THREE.Vector3()
const _direction = new THREE.Vector3()
const _dummy = new THREE.Object3D()
const _axis = new THREE.Vector3(0, 1, 0)

export default function BulletTracers() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const scroll = useScroll()

  const tracers = useMemo(() => {
    const rng = seededRandom(TRACER_SEED)
    return Array.from({ length: TRACER_COUNT }, (_, index) => ({
      offset: index / TRACER_COUNT,
      spread: new THREE.Vector3((rng() - 0.5) * 1.4, (rng() - 0.5) * 0.6, 0),
      target: new THREE.Vector3(
        BUILDING_POS.x + (rng() - 0.5) * 3.4 * BUILDING_MODEL_SCALE,
        1 + rng() * 3.4,
        BUILDING_POS.z + 1.25 * BUILDING_MODEL_SCALE + rng() * 0.12
      ),
    }))
  }, [])

  useFrame(() => {
    if (!meshRef.current || !inRange(scroll.offset, SCROLL_START, SCROLL_END)) return

    const local = localProgress(scroll.offset)
    _origin.set(helicopterXAt(local), TRACER_ORIGIN_Y, BUILDING_POS.z + TRACER_ORIGIN_Z_OFFSET)
    const streamActive = local > STREAM_START && local < STREAM_END

    tracers.forEach((tracer, i) => {
      const shotProgress = (local * 1.55 + tracer.offset) % 1
      _start.copy(_origin).add(tracer.spread)
      _direction.copy(tracer.target).sub(_start)
      const distance = _direction.length()
      _start.lerp(tracer.target, THREE.MathUtils.smoothstep(shotProgress, 0, 1))

      _dummy.position.copy(_start)
      _dummy.quaternion.setFromUnitVectors(_axis, _direction.normalize())
      const active = streamActive && shotProgress > 0.08 && shotProgress < 0.92
      if (active) {
        _dummy.scale.set(1, THREE.MathUtils.clamp(distance * 0.1, 1.2, 3.4), 1)
      } else {
        _dummy.scale.setScalar(0)
      }
      _dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, _dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TRACER_COUNT]}>
      <cylinderGeometry args={[0.055, 0.018, 1, 8]} />
      <meshBasicMaterial
        color="#ffd76a"
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
