const ORIGIN_LAT = 35.1468
const ORIGIN_LNG = 126.9172
const SCALE = 5000

export function lngLatToXZ(lng, lat) {
  const x = (lng - ORIGIN_LNG) * SCALE * Math.cos((ORIGIN_LAT * Math.PI) / 180)
  const z = -(lat - ORIGIN_LAT) * SCALE
  return { x, z }
}
