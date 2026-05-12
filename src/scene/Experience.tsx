import { Suspense } from 'react'
import { EffectComposer } from '@react-three/postprocessing'
import CameraRig from './CameraRig'
import KoreaMap from './KoreaMap'
import MapMarkers from './MapMarkers'
import GwangjuCity from './GwangjuCity'
import GwangjuRoads from './GwangjuRoads'
import GwangjuLandmarks from './GwangjuLandmarks'
import TearGasParticles from './TearGasParticles'
import VehicleConvoy from './VehicleConvoy'
import FlashScene from './FlashScene'
import GwangjuBlockade from './GwangjuBlockade'
import ProvincialOffice from './ProvincialOffice'
import GwangjuMBCBuilding from './GwangjuMBCBuilding'
import JeonilBuilding from './JeonilBuilding'
import DemocracySquare from './DemocracySquare'
import May18Cemetery from './May18Cemetery'
import CnuMainBuilding from './CnuMainBuilding'
import { FilmEffect } from '../shaders/FilmEffect'

export default function Experience() {
  return (
    <>
      <CameraRig />
      <KoreaMap />
      <MapMarkers />
      <GwangjuCity />
      <GwangjuRoads />
      <GwangjuLandmarks />
      <TearGasParticles />
      <VehicleConvoy />
      <FlashScene />
      <GwangjuBlockade />
      <ProvincialOffice />
      <Suspense fallback={null}>
        <CnuMainBuilding />
        <GwangjuMBCBuilding />
        <JeonilBuilding />
        <DemocracySquare />
        <May18Cemetery />
      </Suspense>
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={0.6} />
      <EffectComposer>
        <FilmEffect />
      </EffectComposer>
    </>
  )
}
