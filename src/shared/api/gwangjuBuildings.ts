import { GWANGJU_BUILDINGS_DATA_ROOT, GWANGJU_BUILDINGS_MANIFEST_URL } from '@/shared/config/assets'
import type { Bbox } from '@/shared/lib/geo/types'
import { loadJson } from './loadJson'

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

export function loadBuildingManifest(): Promise<BuildingManifest> {
  return loadJson<BuildingManifest>(GWANGJU_BUILDINGS_MANIFEST_URL)
}

export function loadBuildingChunk(chunk: BuildingManifestChunk): Promise<BuildingChunkData> {
  return loadJson<BuildingChunkData>(`${GWANGJU_BUILDINGS_DATA_ROOT}${chunk.file}`)
}
