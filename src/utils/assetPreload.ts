import { useGLTF } from '@react-three/drei'
import type { Feature, FeatureCollection, LineString } from 'geojson'
import type { Bbox } from './gwangjuCityScale'

export const KOREA_GEO_URL = '/data/provinces-geo-simple.json'
export const GWANGJU_ROADS_URL = '/data/gwangju-roads/roads.json'
export const GWANGJU_BUILDINGS_MANIFEST_URL = '/data/gwangju-buildings/manifest.json'
export const GWANGJU_BUILDINGS_DATA_ROOT = '/data/gwangju-buildings/'

export const GLB_MODEL_URLS = [
  '/models/cnu-main-building.glb',
  '/models/gwangju-mbc.glb',
  '/models/jeonil-building.glb',
  '/models/gwangju-fountain.glb',
  '/models/may18-cemetery.glb',
  '/models/former-jeonnam-provincial-office.glb',
  '/models/m113a1.glb',
  '/models/bell_huey_helicopter.glb',
] as const

interface BuildingFeature {
  properties: {
    bbox: Bbox
    height: number
    building?: string
  }
}

export interface BuildingChunkData {
  features: BuildingFeature[]
  name: string
}

export interface BuildingManifestChunk {
  key: string
  file: string
  bbox: Bbox
}

export interface BuildingManifest {
  chunks: BuildingManifestChunk[]
}

export interface RoadProps {
  name?: string
  roadClass?: string
  bbox: Bbox
}

export type RoadFeature = Feature<LineString, RoadProps>
export type RoadCollection = FeatureCollection<LineString, RoadProps>

const jsonCache = new Map<string, Promise<unknown>>()
let appPreloadPromise: Promise<void> | null = null

function loadJson<T>(url: string): Promise<T> {
  const cached = jsonCache.get(url)
  if (cached) return cached as Promise<T>

  const request = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`)
    }
    return response.json() as Promise<T>
  })

  jsonCache.set(url, request)
  return request
}

export function preloadModelAssets(): void {
  GLB_MODEL_URLS.forEach((url) => useGLTF.preload(url))
}

export function loadKoreaGeoJson(): Promise<FeatureCollection> {
  return loadJson<FeatureCollection>(KOREA_GEO_URL)
}

export function loadGwangjuRoads(): Promise<RoadCollection> {
  return loadJson<RoadCollection>(GWANGJU_ROADS_URL)
}

export function loadBuildingManifest(): Promise<BuildingManifest> {
  return loadJson<BuildingManifest>(GWANGJU_BUILDINGS_MANIFEST_URL)
}

export function loadBuildingChunk(chunk: BuildingManifestChunk): Promise<BuildingChunkData> {
  return loadJson<BuildingChunkData>(`${GWANGJU_BUILDINGS_DATA_ROOT}${chunk.file}`)
}

export function preloadSceneAssets(): Promise<void> {
  if (appPreloadPromise) return appPreloadPromise

  preloadModelAssets()
  appPreloadPromise = Promise.all([
    loadKoreaGeoJson(),
    loadGwangjuRoads(),
    loadBuildingManifest().then((manifest) =>
      Promise.all(manifest.chunks.map((chunk) => loadBuildingChunk(chunk)))
    ),
  ])
    .then(() => undefined)
    .catch((error) => {
      appPreloadPromise = null
      throw error
    })

  return appPreloadPromise
}
