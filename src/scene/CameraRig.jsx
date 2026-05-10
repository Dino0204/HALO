import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { cameraPath } from '../utils/cameraPath'

const _lookTarget = new THREE.Vector3()

export default function CameraRig() {
  const { camera } = useThree()
  const scroll = useScroll()
  const mouseRef = useRef({ x: 0, y: 0 })

  // Scene 3 마우스 인터랙션
  if (typeof window !== 'undefined') {
    window._518mouseRef = mouseRef
  }

  useFrame(() => {
    const t = scroll.offset
    const pos = cameraPath.getPoint(t)
    camera.position.copy(pos)

    // lookAt: getTangent로 방향 계산 (엣지 케이스 방지)
    const tangent = cameraPath.getTangent(Math.min(t, 0.999))
    _lookTarget.copy(pos).addScaledVector(tangent, 5)
    camera.lookAt(_lookTarget)

    // Scene 3 구간에서 마우스 yaw/pitch 오프셋
    if (t > 0.55 && t < 0.8) {
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      camera.rotation.y += mx * (8 * Math.PI / 180)
      camera.rotation.x += my * (4 * Math.PI / 180)
    }
  })

  return null
}
