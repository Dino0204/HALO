import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

const stripeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const stripeFragmentShader = `
  varying vec2 vUv;
  uniform float uOpacity;
  void main() {
    float stripe = mod((vUv.x + vUv.y) * 12.0, 1.0);
    float mask = step(0.5, stripe);
    gl_FragColor = vec4(0.8, 0.0, 0.0, mask * 0.55 * uOpacity);
  }
`

export default function GwangjuBlockade() {
  const meshRef = useRef()
  const scroll = useScroll()

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: stripeVertexShader,
        fragmentShader: stripeFragmentShader,
        uniforms: { uOpacity: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame(() => {
    const t = scroll.offset
    const inScene7 = t >= 0.63 && t < 0.72
    const progress = inScene7 ? THREE.MathUtils.smoothstep(t, 0.63, 0.67) : 0
    material.uniforms.uOpacity.value = progress
    if (meshRef.current) meshRef.current.visible = t > 0.6 && t < 0.75
  })

  return (
    <mesh ref={meshRef} position={[-13, 0.5, 32]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 25]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
