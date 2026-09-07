import type { Feature, FeatureCollection, LineString } from 'geojson'
import { GWANGJU_ROADS_URL } from '@/shared/config/assets'
import type { Bbox } from '@/shared/lib/geo/types'
import { loadJson } from './loadJson'

export interface RoadProps {
  name?: string
  roadClass?: string
  bbox: Bbox
}

export type RoadFeature = Feature<LineString, RoadProps>
export type RoadCollection = FeatureCollection<LineString, RoadProps>

export function loadGwangjuRoads(): Promise<RoadCollection> {
  return loadJson<RoadCollection>(GWANGJU_ROADS_URL)
}
