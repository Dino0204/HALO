import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import ScrollSync from '@/entities/scroll/ui/ScrollSync'
import AutoPlayButton from '@/features/auto-play/ui/AutoPlayButton'
import CustomScrollbar from '@/features/scroll-progress/ui/CustomScrollbar'
import HUDLocation from '@/widgets/hud-location/ui/HUDLocation'
import HUDTimeline from '@/widgets/hud-timeline/ui/HUDTimeline'
import { LoadingScreen } from '@/widgets/loading-screen/ui/LoadingScreen'
import TextOverlay from '@/widgets/narration-overlay/ui/TextOverlay'
import Experience from './Experience'

const SCROLL_PAGES = 28

export default function Main() {
  return (
    <>
      <Canvas
        className="fixed top-0 left-0 w-full h-full"
        gl={{ antialias: false }}
        camera={{ fov: 60, near: 0.1, far: 2000 }}
      >
        <ScrollControls pages={SCROLL_PAGES} damping={0.15}>
          <ScrollSync />
          <Experience />
        </ScrollControls>
      </Canvas>
      <TextOverlay />
      <HUDTimeline />
      <HUDLocation />
      <CustomScrollbar />
      <AutoPlayButton />
      <LoadingScreen />
    </>
  )
}
