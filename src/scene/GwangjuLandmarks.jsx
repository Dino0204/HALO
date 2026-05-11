import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

function CnuGate() {
  const { x, z } = GWANGJU_LANDMARKS.cnuGate

  return (
    <group position={[x, 0, z]} rotation={[0, THREE.MathUtils.degToRad(-13), 0]}>
      <mesh position={[-1.75, 0.8, 0]}>
        <boxGeometry args={[0.42, 1.6, 0.46]} />
        <meshStandardMaterial color="#a68f72" roughness={0.72} />
      </mesh>
      <mesh position={[1.75, 0.8, 0]}>
        <boxGeometry args={[0.42, 1.6, 0.46]} />
        <meshStandardMaterial color="#a68f72" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[4.3, 0.42, 0.58]} />
        <meshStandardMaterial color="#3f3025" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.88, 0]}>
        <boxGeometry args={[4.7, 0.16, 0.68]} />
        <meshStandardMaterial color="#d5c0a0" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[5.4, 0.04, 2.4]} />
        <meshStandardMaterial color="#6e6a5c" roughness={0.9} />
      </mesh>
    </group>
  )
}

function JeonilBuilding() {
  const { x, z } = GWANGJU_LANDMARKS.jeonilBuilding

  return (
    <group position={[x, 0, z]} rotation={[0, THREE.MathUtils.degToRad(6), 0]}>
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[2.2, 3.3, 1.15]} />
        <meshStandardMaterial color="#b49a78" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.68, -0.61]}>
        <boxGeometry args={[2.05, 2.8, 0.06]} />
        <meshStandardMaterial color="#6d786f" roughness={0.5} />
      </mesh>
      {[-0.68, 0, 0.68].map((xOffset) =>
        [0.65, 1.2, 1.75, 2.3, 2.85].map((yOffset) => (
          <mesh key={`${xOffset}-${yOffset}`} position={[xOffset, yOffset, -0.66]}>
            <boxGeometry args={[0.34, 0.16, 0.04]} />
            <meshStandardMaterial color="#222522" roughness={0.35} />
          </mesh>
        )),
      )}
    </group>
  )
}

function GeumnamroMarker() {
  const start = GWANGJU_LANDMARKS.geumnamroPark
  const end = GWANGJU_LANDMARKS.jeonilBuilding
  const midX = (start.x + end.x) / 2
  const midZ = (start.z + end.z) / 2
  const angle = Math.atan2(end.x - start.x, end.z - start.z)

  return (
    <group position={[midX, 0.11, midZ]} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[0.36, 0.05, 8.4]} />
        <meshStandardMaterial color="#f0d36d" emissive="#5f4611" emissiveIntensity={0.24} roughness={0.6} />
      </mesh>
    </group>
  )
}

export default function GwangjuLandmarks() {
  const cnuRef = useRef()
  const downtownRef = useRef()
  const scroll = useScroll()

  useFrame(() => {
    const t = scroll.offset
    const cnuVisible = t > 0.42 && t < 0.535
    const downtownVisible = (t >= 0.54 && t < 0.63) || (t > 0.72 && t < 0.92)

    if (cnuRef.current) cnuRef.current.visible = cnuVisible
    if (downtownRef.current) downtownRef.current.visible = downtownVisible
  })

  return (
    <>
      <group ref={cnuRef} visible={false}>
        <CnuGate />
      </group>
      <group ref={downtownRef} visible={false}>
        <GeumnamroMarker />
        <JeonilBuilding />
      </group>
    </>
  )
}
