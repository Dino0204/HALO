import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

const GEO_URL = '/data/provinces-geo-simple.json'

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
    float stripe = mod((vUv.x + vUv.y) * 5.0, 1.0);
    float mask = step(0.5, stripe);
    gl_FragColor = vec4(1.0, 0.22, 0.12, mask * 0.55 * uOpacity);
  }
`

export default function GwangjuBlockade() {
  const meshRef = useRef()
  const scroll = useScroll()
  const [geoJson, setGeoJson] = useState(null)

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoJson)
      .catch(console.error)
  }, [])

  const materialRef = useRef()

  const geometry = useMemo(() => {
    if (!geoJson) return null
    const gwangju = geoJson.features.find((f) => f.properties.code === '24')
    if (!gwangju) return null

    const { type, coordinates } = gwangju.geometry
    const polys = type === 'Polygon' ? [coordinates] : coordinates
    const shapes = []

    for (const poly of polys) {
      const shape = new THREE.Shape()
      poly[0].forEach(([lng, lat], i) => {
        const x = (lng - 127.5) * 20
        const y = (lat - 36.5) * 24
        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)
      })
      for (let h = 1; h < poly.length; h++) {
        const hole = new THREE.Path()
        poly[h].forEach(([lng, lat], i) => {
          const x = (lng - 127.5) * 20
          const y = (lat - 36.5) * 24
          i === 0 ? hole.moveTo(x, y) : hole.lineTo(x, y)
        })
        shape.holes.push(hole)
      }
      shapes.push(shape)
    }

    const geo = new THREE.ShapeGeometry(shapes)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [geoJson])

  useFrame(() => {
    const material = materialRef.current
    if (!material?.uniforms?.uOpacity) return

    const t = scroll.offset
    const visible = t > 0.62 && t < 0.72
    if (meshRef.current) meshRef.current.visible = visible
    if (visible) {
      const fadeIn = THREE.MathUtils.smoothstep(t, 0.65, 0.68)
      const fadeOut = 1 - THREE.MathUtils.smoothstep(t, 0.69, 0.71)
      material.uniforms.uOpacity.value = fadeIn * fadeOut
    } else {
      material.uniforms.uOpacity.value = 0
    }
  })

  if (!geometry) return null

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0.5, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={stripeVertexShader}
        fragmentShader={stripeFragmentShader}
        uniforms={{ uOpacity: { value: 0 } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
