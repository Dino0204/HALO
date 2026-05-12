export const GWANGJU_CITY_CENTER = { x: -12.75, z: 32.25 }
export const CITY_VISUAL_SCALE = 28
export const CITY_HEIGHT_SCALE = 3
export const MIN_BUILDING_SIZE = 0.1
const MAP_CENTER_LNG = 127.5
const MAP_CENTER_LAT = 36.5
const MAP_X_SCALE = 20
const MAP_Z_SCALE = 24

export interface Point2D {
  x: number
  z: number
}

export type Bbox = [number, number, number, number]

function lngLatToMapPoint(lng: number, lat: number): Point2D {
  return {
    x: (lng - MAP_CENTER_LNG) * MAP_X_SCALE,
    z: -(lat - MAP_CENTER_LAT) * MAP_Z_SCALE,
  }
}

export function landmarkPoint(lng: number, lat: number): Point2D {
  const point = lngLatToMapPoint(lng, lat)
  return cityVisualPoint(point.x, point.z)
}

export function cityVisualPoint(x: number, z: number): Point2D {
  return {
    x: GWANGJU_CITY_CENTER.x + (x - GWANGJU_CITY_CENTER.x) * CITY_VISUAL_SCALE,
    z: GWANGJU_CITY_CENTER.z + (z - GWANGJU_CITY_CENTER.z) * CITY_VISUAL_SCALE,
  }
}

export function cityVisualBbox([minX, minZ, maxX, maxZ]: Bbox): Bbox {
  const a = cityVisualPoint(minX, minZ)
  const b = cityVisualPoint(maxX, maxZ)
  return [Math.min(a.x, b.x), Math.min(a.z, b.z), Math.max(a.x, b.x), Math.max(a.z, b.z)]
}

export const GWANGJU_LANDMARKS = {
  cnuGate: landmarkPoint(126.904512, 35.1731412),
  geumnamroPark: landmarkPoint(126.9154925, 35.1497266),
  jeonilBuilding: landmarkPoint(126.9188, 35.14838),
  provincialOffice: landmarkPoint(126.9194774, 35.1446366),
}
