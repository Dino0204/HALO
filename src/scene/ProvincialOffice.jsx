import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useScroll } from '@react-three/drei'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const OFFICE_POS = GWANGJU_LANDMARKS.provincialOffice
const OFFICE_MODEL_URL = '/models/former-jeonnam-provincial-office.glb'
const OFFICE_MODEL_SCALE = 0.08
const VEHICLE_START_Z = OFFICE_POS.z + 34

export default function ProvincialOffice() {
  const groupRef = useRef()
  const v1 = useRef(),
    v2 = useRef(),
    v3 = useRef()
  const scroll = useScroll()
  const { scene } = useGLTF(OFFICE_MODEL_URL)

  useFrame(({ clock }) => {
    const t = scroll.offset
    const visible = t > 0.7857 && t < 0.8571
    if (groupRef.current) groupRef.current.visible = visible
    if (!visible) return

    // Move armored vehicles toward the building
    const spd = clock.elapsedTime * 0.8
    ;[v1, v2, v3].forEach((vRef, i) => {
      if (!vRef.current) return
      vRef.current.position.z = VEHICLE_START_Z - ((spd + i * 6) % 30)
    })
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={[OFFICE_POS.x, 0, OFFICE_POS.z]}
        rotation={[0, Math.PI, 0]}
        scale={OFFICE_MODEL_SCALE}
      />
      {/* Armored vehicles */}
      <mesh ref={v1} position={[OFFICE_POS.x, 0.55, VEHICLE_START_Z]}>
        <boxGeometry args={[1.8, 1.1, 3.0]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
      <mesh ref={v2} position={[OFFICE_POS.x + 2, 0.55, VEHICLE_START_Z + 6]}>
        <boxGeometry args={[1.8, 1.1, 3.0]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
      <mesh ref={v3} position={[OFFICE_POS.x - 2, 0.55, VEHICLE_START_Z + 12]}>
        <boxGeometry args={[1.8, 1.1, 3.0]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
    </group>
  )
}

useGLTF.preload(OFFICE_MODEL_URL)
