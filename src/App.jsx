import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, useProgress } from '@react-three/drei'
import Experience from './scene/Experience'
import ScrollSync from './scene/ScrollSync'
import TextOverlay from './ui/TextOverlay'
import HUDTimeline from './ui/HUDTimeline'
import HUDLocation from './ui/HUDLocation'
import CustomScrollbar from './ui/CustomScrollbar'
import './App.css'

const SCROLL_PAGES = 28
const MIN_LOADING_TIME = 1800
const LOADING_LOGO_SRC = '/%E1%84%80%E1%85%A1%E1%86%BC%E1%84%92%E1%85%A1.png'

function LoadingScreen() {
  const { active, progress } = useProgress()
  const [hidden, setHidden] = useState(false)
  const loadingProgress = Math.round(progress)
  const loadingStatus = active || loadingProgress < 100 ? '자료를 불러오는 중' : '입장 준비 완료'

  useEffect(() => {
    if (active || progress < 100) return

    const hideTimer = setTimeout(() => {
      setHidden(true)
    }, MIN_LOADING_TIME)

    return () => clearTimeout(hideTimer)
  }, [active, progress])

  return (
    <div className={`loading-screen${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
      <div className="loading-content">
        <img className="loading-logo" src={LOADING_LOGO_SRC} alt="강하" />
        <div className="loading-copy">
          <h1 className="loading-title">강하</h1>
          <p className="loading-description">5.18 민주화운동</p>
          <p className="loading-status">
            {loadingStatus} · {loadingProgress}%
          </p>
        </div>
        <div className="loading-progress" aria-label={`로딩 ${loadingProgress}%`}>
          <span style={{ transform: `scaleX(${loadingProgress / 100})` }} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
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
      <LoadingScreen />
    </>
  )
}
