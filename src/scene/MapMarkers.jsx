import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

const GEO_URL = '/data/provinces-geo-simple.json'

const CITIES = [
  { name: '서울', x: -10, z: -26 },
  { name: '인천', x: -16, z: -23 },
  { name: '대전', x: -1.4, z: 4 },
  { name: '대구', x: 22, z: 15 },
  { name: '부산', x: 31, z: 34 },
  { name: '광주', x: -13, z: 32 },
]

// Seoul pulse ring component
function PulseRing({ x, z, delay, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = ((clock.elapsedTime - delay) % 2.5) / 2.5
    ref.current.scale.setScalar(1 + t * 3)
    ref.current.material.opacity = Math.max(0, 1 - t * 1.5)
  })
  return (
    <mesh ref={ref} position={[x, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial color={color} transparent opacity={1} depthWrite={false} />
    </mesh>
  )
}

function CityDot({ x, z, color, scale = 1 }) {
  return (
    <mesh position={[x, 0.2, z]}>
      <sphereGeometry args={[0.4 * scale, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function lngLatToMapPoint([lng, lat]) {
  return new THREE.Vector3((lng - 127.5) * 20, 0.32, -(lat - 36.5) * 24)
}

function buildBoundaryGeometries(feature) {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
  return polygons.map((polygon) => {
    const outer = polygon[0]
    const points = outer.map(lngLatToMapPoint)
    if (points.length > 0) points.push(points[0].clone())
    return new THREE.BufferGeometry().setFromPoints(points)
  })
}

function GwangjuBoundary() {
  const scroll = useScroll()
  const ref = useRef()
  const [feature, setFeature] = useState(null)

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load Korea map GeoJSON: ${r.status}`)
        }
        return r.json()
      })
      .then((geoJson) => {
        const gwangju = geoJson.features.find((item) => item.properties?.name === '광주광역시')
        if (!gwangju) {
          throw new Error('Gwangju boundary was not found in Korea map GeoJSON')
        }
        setFeature(gwangju)
      })
      .catch(console.error)
  }, [])

  const geometries = useMemo(() => {
    if (!feature) return []
    return buildBoundaryGeometries(feature)
  }, [feature])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = scroll.offset
    ref.current.visible = t >= 0.27 && t < 0.36
    ref.current.children.forEach((line) => {
      line.material.opacity = 0.82 + Math.sin(clock.elapsedTime * 3) * 0.12
    })
  })

  return (
    <group ref={ref} visible={false}>
      {geometries.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.9} depthWrite={false} />
        </line>
      ))}
    </group>
  )
}

export default function MapMarkers() {
  const scroll = useScroll()
  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    // Visible in scenes 00–02 (t < 0.27) and scene 07 (0.63–0.72)
    const visible = t < 0.27 || (t >= 0.63 && t < 0.72)
    groupRef.current.visible = visible
  })

  return (
    <>
      <group ref={groupRef}>
        {/* Seoul pulse rings (Scene 01: t 0.09–0.18) */}
        {[0, 0.6, 1.2].map((delay, i) => (
          <PulseRing key={i} x={-10} z={-26} delay={delay} color="#ff3333" />
        ))}
        <CityDot x={-10} z={-26} color="#ff4444" scale={1.2} />

        {/* Other cities */}
        {CITIES.filter((c) => c.name !== '서울').map((city) => (
          <CityDot key={city.name} x={city.x} z={city.z} color="#ffffff" />
        ))}
      </group>
      <GwangjuBoundary />
    </>
  )
}
