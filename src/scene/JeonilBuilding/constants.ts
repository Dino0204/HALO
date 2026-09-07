import * as THREE from 'three'
import { GWANGJU_LANDMARKS } from '../../utils/gwangjuCityScale'

export const SCROLL_START = 0.5714
export const SCROLL_END = 0.6429

export const BUILDING_MODEL_URL = '/models/jeonil-building.glb'
export const BUILDING_MODEL_SCALE = 0.05
export const BUILDING_POS = {
  x: GWANGJU_LANDMARKS.jeonilBuilding.x,
  y: 0,
  z: GWANGJU_LANDMARKS.jeonilBuilding.z,
}

export const HELICOPTER_MODEL_URL = '/models/bell_huey_helicopter.glb'
export const HELICOPTER_MODEL_SCALE = 0.42
export const HELICOPTER_TRAVEL_X = 14
export const HELICOPTER_ROTOR_TIMESCALE = 2.6

export const BULLET_COUNT = 36
export const BULLET_SEED = 245
export const TRACER_COUNT = 12
export const TRACER_SEED = 518

// 씬 구간 안에서의 진행도(0~1). 헬기·탄흔·예광탄이 같은 시계를 봐야 한다.
export function localProgress(t: number): number {
  return (t - SCROLL_START) / (SCROLL_END - SCROLL_START)
}

// 헬기의 X 위치. 예광탄 발사 원점이 헬기를 따라가야 하므로 한 곳에서만 정의한다.
export function helicopterXAt(progress: number): number {
  return BUILDING_POS.x + THREE.MathUtils.lerp(-HELICOPTER_TRAVEL_X, HELICOPTER_TRAVEL_X, progress)
}
