import { useState, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import type { FeatureCollection } from 'geojson'

const GEO_URL = '/data/provinces-geo-simple.json'
const CITY_TRANSITION_START = 0.2857

function buildShapesFromGeoJson(geoJson: FeatureCollection): THREE.Shape[] {
  const shapes: THREE.Shape[] = []
  for (const feature of geoJson.features) {
    const geom = feature.geometry as { type: string; coordinates: number[][][] | number[][][][] }
    const polys: number[][][][] =
      geom.type === 'Polygon'
        ? [geom.coordinates as number[][][]]
        : (geom.coordinates as number[][][][])
    for (const poly of polys) {
      const shape = new THREE.Shape()
      const outer = poly[0]
      outer.forEach(([lng, lat], i) => {
        const x = (lng - 127.5) * 20
        const y = (lat - 36.5) * 24
        if (i === 0) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      })
      for (let h = 1; h < poly.length; h++) {
        const hole = new THREE.Path()
        poly[h].forEach(([lng, lat], i) => {
          const x = (lng - 127.5) * 20
          const y = (lat - 36.5) * 24
          if (i === 0) hole.moveTo(x, y)
          else hole.lineTo(x, y)
        })
        shape.holes.push(hole)
      }
      shapes.push(shape)
    }
  }
  return shapes
}

export default function KoreaMap() {
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null)
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const scroll = useScroll()

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load Korea map GeoJSON: ${r.status}`)
        }
        return r.json()
      })
      .then((data) => setGeoJson(data as FeatureCollection))
      .catch(console.error)
  }, [])

  const geometry = useMemo(() => {
    if (!geoJson) return null
    const shapes = buildShapesFromGeoJson(geoJson)
    const geo = new THREE.ShapeGeometry(shapes)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [geoJson])

  useFrame(() => {
    if (!groupRef.current) return
    const t = scroll.offset
    groupRef.current.visible = t < CITY_TRANSITION_START || (t >= 0.6429 && t < 0.7143)
  })

  if (!geometry) return null

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color="#2a2a2a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
