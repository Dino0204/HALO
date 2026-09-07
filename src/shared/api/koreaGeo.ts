import type { FeatureCollection } from 'geojson'
import { KOREA_GEO_URL } from '@/shared/config/assets'
import { loadJson } from './loadJson'

export function loadKoreaGeoJson(): Promise<FeatureCollection> {
  return loadJson<FeatureCollection>(KOREA_GEO_URL)
}
