import type { Bbox, Point2D } from './types'

// 한국 지도 평면(위경도 → 화면 좌표)과, 그 위에서 광주만 확대해 보여주는
// 도심 좌표계 사이의 순수 변환. 도메인 상수는 entities/gwangju가 갖는다.
export const GWANGJU_CITY_CENTER = { x: -12.75, z: 32.25 }
export const CITY_VISUAL_SCALE = 28
export const CITY_HEIGHT_SCALE = 3
export const MIN_BUILDING_SIZE = 0.1

const MAP_CENTER_LNG = 127.5
const MAP_CENTER_LAT = 36.5
const MAP_X_SCALE = 20
const MAP_Z_SCALE = 24

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
