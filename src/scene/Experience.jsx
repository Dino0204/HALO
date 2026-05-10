import { EffectComposer } from '@react-three/postprocessing'
import CameraRig from './CameraRig'
import KoreaMap from './KoreaMap'
import MapMarkers from './MapMarkers'
import GwangjuCity from './GwangjuCity'
import TearGasParticles from './TearGasParticles'
import VehicleConvoy from './VehicleConvoy'
import FlashScene from './FlashScene'
import GwangjuBlockade from './GwangjuBlockade'
import ProvincialOffice from './ProvincialOffice'
import { FilmEffect } from '../shaders/FilmEffect'

export default function Experience() {
  return (
    <>
      <CameraRig />
      <KoreaMap />
      <MapMarkers />
      <GwangjuCity />
      <TearGasParticles />
      <VehicleConvoy />
      <FlashScene />
      <GwangjuBlockade />
      <ProvincialOffice />
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={0.6} />
      <EffectComposer>
        <FilmEffect />
      </EffectComposer>
    </>
  )
}
