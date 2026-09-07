import { landmarkPoint } from '@/shared/lib/geo/cityProjection'

export const GWANGJU_LANDMARKS = {
  cnuGate: landmarkPoint(126.904512, 35.1731412),
  geumnamroPark: landmarkPoint(126.9154925, 35.1497266),
  jeonilBuilding: landmarkPoint(126.9188, 35.14838),
  provincialOffice: landmarkPoint(126.9194774, 35.1446366),
}

export const MBC_POS = { x: 30, y: 0, z: 60 }

export const CEMETERY_POS = {
  ...landmarkPoint(126.9398924, 35.2346149),
  y: 0,
}
