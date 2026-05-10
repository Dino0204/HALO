import { useState, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const GEO_URL = '/data/provinces-geo-simple.json'

function buildShapesFromGeoJson(geoJson) {
  const shapes = []
  for (const feature of geoJson.features) {
    const { type, coordinates } = feature.geometry
    const polys = type === 'Polygon' ? [coordinates] : coordinates
    for (const poly of polys) {
      const shape = new THREE.Shape()
      const outer = poly[0]
      outer.forEach(([lng, lat], i) => {
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
  }
  return shapes
}

export default function KoreaMap() {
  const [geoJson, setGeoJson] = useState(null)
  const meshRef = useRef(null)

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load Korea map GeoJSON: ${r.status}`)
        }
        return r
      })
      .then((r) => r.json())
      .then(setGeoJson)
      .catch(console.error)
  }, [])

  const geometry = useMemo(() => {
    if (!geoJson) return null
    const shapes = buildShapesFromGeoJson(geoJson)
    const geo = new THREE.ShapeGeometry(shapes)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [geoJson])

  if (!geometry) return null

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color="#2a2a2a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
