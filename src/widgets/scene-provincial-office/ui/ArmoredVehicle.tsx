import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { inRange } from '@/entities/scroll/model/scrollRange'
import {
  OFFICE_POS,
  SCROLL_END,
  SCROLL_START,
  VEHICLE_MODEL_SCALE,
  VEHICLE_MODEL_URL,
  VEHICLE_START_Z,
  VEHICLE_TRAVEL_DISTANCE,
} from '../model/constants'

interface ArmoredVehicleProps {
  offsetX: number
  offsetZ: number
}

// 장갑차 한 대가 자기 전진을 스스로 책임진다.
// 가시성은 부모 ScrollRange가 관리하고, 여기서는 화면 밖 계산만 건너뛴다.
export default function ArmoredVehicle({ offsetX, offsetZ }: ArmoredVehicleProps) {
  const ref = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const { scene } = useGLTF(VEHICLE_MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])

  useFrame(() => {
    if (!ref.current || !inRange(scroll.offset, SCROLL_START, SCROLL_END)) return
    const progress = THREE.MathUtils.smoothstep(scroll.offset, SCROLL_START, SCROLL_END)
    ref.current.position.z = VEHICLE_START_Z + offsetZ - progress * VEHICLE_TRAVEL_DISTANCE
  })

  return (
    <group ref={ref} position={[OFFICE_POS.x + offsetX, 0.04, VEHICLE_START_Z + offsetZ]}>
      <group rotation={[0, Math.PI / 2, 0]} scale={VEHICLE_MODEL_SCALE}>
        <primitive object={model} />
      </group>
    </group>
  )
}
