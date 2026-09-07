import { useGLTF } from '@react-three/drei'
import { GLB_MODEL_URLS } from '@/shared/config/assets'
import { loadBuildingChunk, loadBuildingManifest } from './gwangjuBuildings'
import { loadGwangjuRoads } from './gwangjuRoads'
import { loadKoreaGeoJson } from './koreaGeo'

let appPreloadPromise: Promise<void> | null = null

export function preloadModelAssets(): void {
  GLB_MODEL_URLS.forEach((url) => useGLTF.preload(url))
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
