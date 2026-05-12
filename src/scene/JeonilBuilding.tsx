import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'

const SCROLL_START = 0.5714
const SCROLL_END = 0.6429
const BUILDING_POS = {
  x: GWANGJU_LANDMARKS.jeonilBuilding.x,
  y: 0,
  z: GWANGJU_LANDMARKS.jeonilBuilding.z,
}
const BUILDING_MODEL_SCALE = 0.05
const BULLET_COUNT = 36
const TRACER_COUNT = 12
const HELICOPTER_MODEL_URL = '/models/bell_huey_helicopter.glb'
const HELICOPTER_MODEL_SCALE = 0.42

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function Helicopter() {
  const ref = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const { scene, animations } = useGLTF(HELICOPTER_MODEL_URL)
  const helicopter = useMemo(() => scene.clone(true), [scene])
  const { actions } = useAnimations(animations, ref)

  useEffect(() => {
    Object.values(actions).forEach((action) => {
      if (!action) return
      action.reset().setLoop(THREE.LoopRepeat, Infinity).play()
      action.timeScale = 2.6
    })

    return () => {
      Object.values(actions).forEach((action) => action?.stop())
    }
  }, [actions])

  useFrame(() => {
    if (!ref.current) return
    const t = scroll.offset
    const visible = t >= SCROLL_START && t < SCROLL_END
    ref.current.visible = visible
    if (!visible) return
    const progress = (t - SCROLL_START) / (SCROLL_END - SCROLL_START)
    ref.current.position.x = BUILDING_POS.x + THREE.MathUtils.lerp(-14, 14, progress)
    ref.current.position.y = 6
    ref.current.position.z = BUILDING_POS.z + 1
  })

  return (
    <group ref={ref} visible={false} rotation={[0, Math.PI / 2, 0]} scale={HELICOPTER_MODEL_SCALE}>
      <primitive object={helicopter} />
    </group>
  )
}

function BulletHoles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const scroll = useScroll()

  const matrices = useMemo(() => {
    const rng = seededRandom(245)
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
    matrices.forEach((matrix, i) => {
      meshRef.current.setMatrixAt(i, matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  useFrame(() => {
    if (!meshRef.current) return
    const t = scroll.offset
    const visible = t >= SCROLL_START && t < SCROLL_END
    meshRef.current.visible = visible
    if (!visible) return
    const local = (t - SCROLL_START) / (SCROLL_END - SCROLL_START)
    const opacity = THREE.MathUtils.smoothstep(local, 0.3, 0.9)
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    if (material) {
      material.opacity = opacity
      material.transparent = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BULLET_COUNT]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#ff3333" transparent opacity={0} />
    </instancedMesh>
  )
}

function BulletTracers() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const scroll = useScroll()

  const tracers = useMemo(() => {
    const rng = seededRandom(518)
    return Array.from({ length: TRACER_COUNT }, (_, index) => ({
      offset: index / TRACER_COUNT,
      side: (rng() - 0.5) * 1.4,
      lift: (rng() - 0.5) * 0.6,
      target: new THREE.Vector3(
        BUILDING_POS.x + (rng() - 0.5) * 3.4 * BUILDING_MODEL_SCALE,
        1 + rng() * 3.4,
        BUILDING_POS.z + 1.25 * BUILDING_MODEL_SCALE + rng() * 0.12
      ),
    }))
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const t = scroll.offset
    const visible = t >= SCROLL_START && t < SCROLL_END
    meshRef.current.visible = visible
    if (!visible) return

    const local = (t - SCROLL_START) / (SCROLL_END - SCROLL_START)
    const heliStart = new THREE.Vector3(
      BUILDING_POS.x + THREE.MathUtils.lerp(-14, 14, local),
      5.55,
      BUILDING_POS.z + 1.15
    )
    const dummy = new THREE.Object3D()
    const axis = new THREE.Vector3(0, 1, 0)
    const streamActive = local > 0.06 && local < 0.9

    tracers.forEach((tracer, i) => {
      const shotProgress = (local * 1.55 + tracer.offset) % 1
      const start = heliStart.clone().add(new THREE.Vector3(tracer.side, tracer.lift, 0))
      const end = tracer.target
      const direction = end.clone().sub(start)
      const distance = direction.length()
      const travel = THREE.MathUtils.smoothstep(shotProgress, 0, 1)
      const position = start.lerp(end, travel)
      const active = streamActive && shotProgress > 0.08 && shotProgress < 0.92

      dummy.position.copy(position)
      dummy.quaternion.setFromUnitVectors(axis, direction.normalize())
      if (active) {
        dummy.scale.set(1, THREE.MathUtils.clamp(distance * 0.1, 1.2, 3.4), 1)
      } else {
        dummy.scale.setScalar(0)
      }
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    if (material) {
      material.opacity = 0.95
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TRACER_COUNT]} visible={false}>
      <cylinderGeometry args={[0.055, 0.018, 1, 8]} />
      <meshBasicMaterial
        color="#ffd76a"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

export default function JeonilBuilding() {
  const groupRef = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const { scene } = useGLTF('/models/jeonil-building.glb')

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t >= SCROLL_START && t < SCROLL_END
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={[BUILDING_POS.x, BUILDING_POS.y, BUILDING_POS.z]}
        scale={BUILDING_MODEL_SCALE}
      />
      <Helicopter />
      <BulletTracers />
      <BulletHoles />
    </group>
  )
}

useGLTF.preload('/models/jeonil-building.glb')
useGLTF.preload(HELICOPTER_MODEL_URL)
