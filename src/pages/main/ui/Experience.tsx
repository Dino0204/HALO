import { Suspense } from 'react'
import { EffectComposer } from '@react-three/postprocessing'
import { Preload } from '@react-three/drei'
import GwangjuCity from '@/entities/gwangju/ui/GwangjuCity'
import GwangjuLandmarks from '@/entities/gwangju/ui/GwangjuLandmarks'
import GwangjuRoads from '@/entities/gwangju/ui/GwangjuRoads'
import KoreaMap from '@/entities/korea-map/ui/KoreaMap'
import MapMarkers from '@/entities/korea-map/ui/MapMarkers'
import CameraRig from '@/features/camera-descent/ui/CameraRig'
import { FilmEffect } from '@/shared/ui/film-effect/FilmEffect'
import GwangjuBlockade from '@/widgets/scene-blockade/ui/GwangjuBlockade'
import May18Cemetery from '@/widgets/scene-cemetery/ui/May18Cemetery'
import CnuMainBuilding from '@/widgets/scene-cnu-gate/ui/CnuMainBuilding'
import TearGasParticles from '@/widgets/scene-cnu-gate/ui/TearGasParticles'
import DemocracySquare from '@/widgets/scene-democracy-square/ui/DemocracySquare'
import VehicleConvoy from '@/widgets/scene-geumnamro-convoy/ui/VehicleConvoy'
import JeonilBuilding from '@/widgets/scene-jeonil-building/ui/JeonilBuilding'
import FlashScene from '@/widgets/scene-mass-shooting/ui/FlashScene'
import GwangjuMBCBuilding from '@/widgets/scene-mbc-fire/ui/GwangjuMBCBuilding'
import ProvincialOffice from '@/widgets/scene-provincial-office/ui/ProvincialOffice'

export default function Experience() {
  return (
    <>
      <CameraRig />
      <Suspense fallback={null}>
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
      <Preload all />
    </>
  )
}
