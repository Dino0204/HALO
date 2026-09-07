import { GWANGJU_LANDMARKS } from '@/entities/gwangju/model/landmarks'

export const SCROLL_START = 0.7857
export const SCROLL_END = 0.8571
export const OFFICE_POS = GWANGJU_LANDMARKS.provincialOffice
export const OFFICE_MODEL_URL = '/models/former-jeonnam-provincial-office.glb'
export const OFFICE_MODEL_SCALE = 0.024
export const OFFICE_MODEL_Y_OFFSET = 0.4
export const VEHICLE_MODEL_URL = '/models/m113a1.glb'
export const VEHICLE_MODEL_SCALE = 0.168
export const VEHICLE_START_Z = OFFICE_POS.z + 10.2
export const VEHICLE_TRAVEL_DISTANCE = 9
export const VEHICLE_OFFSETS = [
  { x: 0, z: 0 },
  { x: 0.7, z: 1.8 },
  { x: -0.7, z: 3.6 },
]
