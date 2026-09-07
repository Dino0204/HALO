import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { inRange } from '@/entities/scroll/model/scrollRange'
import {
  BUILDING_POS,
  HELICOPTER_MODEL_SCALE,
  HELICOPTER_MODEL_URL,
  HELICOPTER_ROTOR_TIMESCALE,
  SCROLL_END,
  SCROLL_START,
  helicopterXAt,
  localProgress,
} from '../model/constants'

const HELICOPTER_ALTITUDE = 6

export default function Helicopter() {
  const ref = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const { scene, animations } = useGLTF(HELICOPTER_MODEL_URL)
  const helicopter = useMemo(() => scene.clone(true), [scene])
  const { actions } = useAnimations(animations, ref)

  useEffect(() => {
    Object.values(actions).forEach((action) => {
      if (!action) return
      action.reset().setLoop(THREE.LoopRepeat, Infinity).play()
      action.timeScale = HELICOPTER_ROTOR_TIMESCALE
    })

    return () => {
      Object.values(actions).forEach((action) => action?.stop())
    }
  }, [actions])

  useFrame(() => {
    if (!ref.current || !inRange(scroll.offset, SCROLL_START, SCROLL_END)) return
    ref.current.position.set(
      helicopterXAt(localProgress(scroll.offset)),
      HELICOPTER_ALTITUDE,
      BUILDING_POS.z + 1
    )
  })

  return (
    <group ref={ref} rotation={[0, Math.PI / 2, 0]} scale={HELICOPTER_MODEL_SCALE}>
      <primitive object={helicopter} />
    </group>
  )
}
