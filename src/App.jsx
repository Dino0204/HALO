import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import Experience from './scene/Experience'
import ScrollSync from './scene/ScrollSync'
import TextOverlay from './ui/TextOverlay'
import HUDTimeline from './ui/HUDTimeline'
import HUDLocation from './ui/HUDLocation'
import CustomScrollbar from './ui/CustomScrollbar'

export default function App() {
  return (
    <>
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: false }}
        camera={{ fov: 60, near: 0.1, far: 2000 }}
      >
        <ScrollControls pages={11} damping={0.15}>
          <ScrollSync />
          <Experience />
        </ScrollControls>
      </Canvas>
      <TextOverlay />
      <HUDTimeline />
      <HUDLocation />
      <CustomScrollbar />
    </>
  )
}
