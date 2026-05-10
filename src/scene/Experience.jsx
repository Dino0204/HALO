import { EffectComposer } from '@react-three/postprocessing'
import CameraRig from './CameraRig'
import CityMesh from './CityMesh'
import Particles from './Particles'
import { FilmEffect } from '../shaders/FilmEffect'

export default function Experience() {
  return (
    <>
      <CameraRig />
      <CityMesh />
      <Particles />
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={0.8} />
      <EffectComposer>
        <FilmEffect />
      </EffectComposer>
    </>
  )
}
