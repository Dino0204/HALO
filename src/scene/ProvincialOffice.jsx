import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'
import { cloneAsGrayscale } from '../utils/grayscaleModel'

const SCROLL_START = 0.7857
const SCROLL_END = 0.8571
const OFFICE_POS = GWANGJU_LANDMARKS.provincialOffice
const OFFICE_MODEL_URL = '/models/former-jeonnam-provincial-office.glb'
const ARMORED_VEHICLE_MODEL_URL = '/models/m113a1.glb'
const OFFICE_MODEL_SCALE = 0.024
const OFFICE_MODEL_Y_OFFSET = 0.4
const ARMORED_VEHICLE_MODEL_SCALE = 0.168
const VEHICLE_START_Z = OFFICE_POS.z + 10.2
const VEHICLE_TRAVEL_DISTANCE = 9
const VEHICLE_OFFSETS = [
  { x: 0, z: 0 },
  { x: 0.7, z: 1.8 },
  { x: -0.7, z: 3.6 },
]

function ArmoredVehicle({ vehicleRef, offsetX, offsetZ }) {
  const { scene } = useGLTF(ARMORED_VEHICLE_MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])

  return (
    <group ref={vehicleRef} position={[OFFICE_POS.x + offsetX, 0.04, VEHICLE_START_Z + offsetZ]}>
      <group rotation={[0, Math.PI / 2, 0]} scale={ARMORED_VEHICLE_MODEL_SCALE}>
        <primitive object={model} />
      </group>
    </group>
  )
}

export default function ProvincialOffice() {
  const groupRef = useRef()
  const v1 = useRef(),
    v2 = useRef(),
    v3 = useRef()
  const scroll = useScroll()
  const { scene } = useGLTF(OFFICE_MODEL_URL)
  const officeModel = useMemo(() => cloneAsGrayscale(scene), [scene])

  useFrame(() => {
    const t = scroll.offset
    const visible = t > SCROLL_START && t < SCROLL_END
    if (groupRef.current) groupRef.current.visible = visible
    if (!visible) return

    const progress = THREE.MathUtils.smoothstep(t, SCROLL_START, SCROLL_END)
    ;[v1, v2, v3].forEach((vRef, i) => {
      if (!vRef.current) return
      vRef.current.position.z =
        VEHICLE_START_Z + VEHICLE_OFFSETS[i].z - progress * VEHICLE_TRAVEL_DISTANCE
    })
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={officeModel}
        position={[OFFICE_POS.x, OFFICE_MODEL_Y_OFFSET, OFFICE_POS.z]}
        rotation={[0, Math.PI, 0]}
        scale={OFFICE_MODEL_SCALE}
      />
      <ArmoredVehicle
        vehicleRef={v1}
        offsetX={VEHICLE_OFFSETS[0].x}
        offsetZ={VEHICLE_OFFSETS[0].z}
      />
      <ArmoredVehicle
        vehicleRef={v2}
        offsetX={VEHICLE_OFFSETS[1].x}
        offsetZ={VEHICLE_OFFSETS[1].z}
      />
      <ArmoredVehicle
        vehicleRef={v3}
        offsetX={VEHICLE_OFFSETS[2].x}
        offsetZ={VEHICLE_OFFSETS[2].z}
      />
    </group>
  )
}

useGLTF.preload(OFFICE_MODEL_URL)
useGLTF.preload(ARMORED_VEHICLE_MODEL_URL)
