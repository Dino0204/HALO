import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, useProgress } from '@react-three/drei'
import Experience from './scene/Experience'
import ScrollSync from './scene/ScrollSync'
import { preloadSceneAssets } from './utils/assetPreload'
import TextOverlay from './ui/TextOverlay'
import HUDTimeline from './ui/HUDTimeline'
import HUDLocation from './ui/HUDLocation'
import CustomScrollbar from './ui/CustomScrollbar'
import AutoPlayButton from './ui/AutoPlayButton'

const SCROLL_PAGES = 28
const MIN_LOADING_TIME = 1800
const LOADING_LOGO_SRC = '/logo.png'

function LoadingScreen() {
  const { active, progress } = useProgress()
  const [hidden, setHidden] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const loadingProgress = Math.round(progress)
  const loadingStatus =
    active || loadingProgress < 100 || !assetsReady ? '자료를 불러오는 중' : '입장 준비 완료'

  useEffect(() => {
    let cancelled = false

    preloadSceneAssets()
      .then(() => {
        if (!cancelled) setAssetsReady(true)
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) setAssetsReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (active || progress < 100 || !assetsReady) return

    const hideTimer = setTimeout(() => {
      setHidden(true)
    }, MIN_LOADING_TIME)

    return () => clearTimeout(hideTimer)
  }, [active, assetsReady, progress])

  return (
    <div
      aria-hidden={hidden}
      className={[
        'fixed inset-0 z-[1000] flex items-center justify-center',
        'bg-[#0a0a0a] text-[#f4efe8] font-sans',
        'transition-opacity duration-700 ease-out',
        hidden ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible',
      ].join(' ')}
      style={{
        transitionProperty: 'opacity, visibility',
        transitionDelay: hidden ? '0s, 0.7s' : '0s, 0s',
      }}
    >
      <div className="flex flex-col items-center gap-[18px] text-center w-[min(84vw,460px)]">
        <img
          className="object-contain w-[min(30vw,180px)] max-h-[26vh] drop-shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
          src={LOADING_LOGO_SRC}
          alt="강하"
        />
        <div className="flex flex-col gap-[10px] min-h-[124px] justify-center">
          <h1 className="font-bold leading-[1.05] text-[clamp(42px,9vw,68px)]">강하</h1>
          <p className="leading-[1.4] text-[clamp(15px,3.5vw,18px)] text-[rgba(244,239,232,0.72)]">
            5.18 민주화운동
          </p>
          <p className="text-sm leading-[1.5] text-[rgba(244,239,232,0.8)]">
            {loadingStatus} · {loadingProgress}%
          </p>
        </div>
        <div
          aria-label={`로딩 ${loadingProgress}%`}
          className="w-[min(100%,280px)] h-[2px] overflow-hidden bg-[rgba(244,239,232,0.18)]"
        >
          <span
            className="block w-full h-full bg-[#d5442f] origin-left transition-transform duration-[250ms] ease-out"
            style={{ transform: `scaleX(${loadingProgress / 100})` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
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
