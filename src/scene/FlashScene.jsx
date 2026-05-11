import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'

const FLASH_POSITIONS = [
  [-18, 2, 22],
  [-15, 2, 24],
  [-20, 2, 20],
  [-12, 2, 23],
  [-16, 3, 21],
]

export default function FlashScene() {
  const refs = useRef([])
  const scroll = useScroll()

  useFrame(({ clock }) => {
    const t = scroll.offset
    const visible = t > 0.5 && t < 0.5714

    refs.current.forEach((light, i) => {
      if (!light) return
      const phase = (clock.elapsedTime * 3 + i * 1.3) % 4
      light.intensity = visible && phase < 0.05 ? 8 : 0
    })
  })

  return (
    <>
      {FLASH_POSITIONS.map((pos, i) => (
        <pointLight
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={pos}
          color="#ffffff"
          intensity={0}
          distance={15}
        />
      ))}
    </>
  )
}
