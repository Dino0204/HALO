import * as THREE from 'three'
import { cityVisualBbox } from './gwangjuCityScale'

export const GWANGJU_ROADS_URL = '/data/gwangju-roads/roads.json'

export function toVisualPoint([x, z]) {
  const [minX, minZ, maxX, maxZ] = cityVisualBbox([x, z, x, z])
  return {
    x: (minX + maxX) / 2,
    z: (minZ + maxZ) / 2,
  }
}

export function pathLength(points) {
  let length = 0
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].z - points[index - 1].z
    )
  }
  return length
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

export function pointAtDistance(points, distance) {
  if (points.length < 2) {
    return { point: points[0] || { x: 0, z: 0 }, angle: 0 }
  }

  let remaining = distance
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const segmentLength = Math.hypot(current.x - previous.x, current.z - previous.z)
    if (remaining <= segmentLength) {
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength
      const x = THREE.MathUtils.lerp(previous.x, current.x, ratio)
      const z = THREE.MathUtils.lerp(previous.z, current.z, ratio)
      return {
        point: { x, z },
        angle: Math.atan2(current.x - previous.x, current.z - previous.z),
      }
    }
    remaining -= segmentLength
  }

  const last = points[points.length - 1]
  const previous = points[points.length - 2]
  return {
    point: last,
    angle: Math.atan2(last.x - previous.x, last.z - previous.z),
  }
}

function connectRoadSegments(features) {
  const segments = features
    .map((feature) => feature.geometry.coordinates.map(toVisualPoint))
    .filter((points) => points.length > 1)

  if (segments.length === 0) return []

  const startIndex = segments.reduce((bestIndex, points, index) => {
    const bestStart = segments[bestIndex][0]
    const start = points[0]
    return start.z < bestStart.z ? index : bestIndex
  }, 0)
  const connected = [...segments[startIndex]]
  const remaining = segments.filter((_, index) => index !== startIndex)

  while (remaining.length > 0) {
    const tail = connected[connected.length - 1]
    let nextIndex = 0
    let shouldReverse = false
    let bestDistance = Infinity

    remaining.forEach((points, index) => {
      const startDistance = distanceBetween(tail, points[0])
      const endDistance = distanceBetween(tail, points[points.length - 1])
      if (startDistance < bestDistance) {
        bestDistance = startDistance
        nextIndex = index
        shouldReverse = false
      }
      if (endDistance < bestDistance) {
        bestDistance = endDistance
        nextIndex = index
        shouldReverse = true
      }
    })

    const next = remaining.splice(nextIndex, 1)[0]
    connected.push(...(shouldReverse ? next.reverse() : next))
  }

  return connected
}

export function createGeumnamroPath(roads) {
  const geumnamroFeatures = roads.features.filter((feature) => feature.properties.name === '금남로')
  const majorFeatures = geumnamroFeatures.filter(
    (feature) => feature.properties.roadClass === 'major'
  )

  const connected = connectRoadSegments(
    majorFeatures.length > 0 ? majorFeatures : geumnamroFeatures
  )
  if (connected.length > 0) return connected

  const fallback = geumnamroFeatures.sort(
    (a, b) =>
      pathLength(b.geometry.coordinates.map(toVisualPoint)) -
      pathLength(a.geometry.coordinates.map(toVisualPoint))
  )[0]
  return fallback ? fallback.geometry.coordinates.map(toVisualPoint) : []
}
