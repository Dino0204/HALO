import { useMemo } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import fragmentShader from './film.frag.glsl?raw'

// Per-scene shader parameters [grain, vignette, bw, redTint]
const SCENE_PARAMS = [
  [0.1, 0.3, 1.0, 0.0], // Scene 00
  [0.12, 0.4, 1.0, 0.0], // Scene 01
  [0.08, 0.3, 1.0, 0.0], // Scene 02
  [0.1, 0.35, 1.0, 0.0], // Scene 03
  [0.15, 0.6, 1.0, 0.08], // Scene 04
  [0.1, 0.3, 0.85, 0.0], // Scene 05
  [0.18, 0.7, 1.0, 0.15], // Scene 06
  [0.12, 0.5, 1.0, 0.0], // Scene 07
  [0.14, 0.6, 0.9, 0.0], // Scene 08
  [0.06, 0.3, 0.5, 0.0], // Scene 09
  [0.03, 0.1, 0.0, 0.0], // Scene 10
]

const SCENE_RANGES = [
  [0.0, 0.09],
  [0.09, 0.18],
  [0.18, 0.27],
  [0.27, 0.36],
  [0.36, 0.45],
  [0.45, 0.54],
  [0.54, 0.63],
  [0.63, 0.72],
  [0.72, 0.81],
  [0.81, 0.9],
  [0.9, 1.0],
]

class FilmEffectImpl extends Effect {
  constructor() {
    super('FilmEffect', fragmentShader, {
      uniforms: new Map([
        ['uProgress', new Uniform(0)],
        ['uTime', new Uniform(0)],
        ['uGrain', new Uniform(0.1)],
        ['uVignette', new Uniform(0.3)],
        ['uBW', new Uniform(1.0)],
        ['uRedTint', new Uniform(0.0)],
      ]),
    })
  }
}

export function FilmEffect() {
  const effect = useMemo(() => new FilmEffectImpl(), [])
  const scroll = useScroll()
  const prevParams = useMemo(() => ({ grain: 0.1, vignette: 0.3, bw: 1.0, red: 0.0 }), [])

  useFrame(({ clock }) => {
    const t = scroll.offset
    effect.uniforms.get('uProgress').value = t
    effect.uniforms.get('uTime').value = clock.elapsedTime

    // Find current scene
    let sceneIdx = SCENE_RANGES.findIndex(([s, e]) => t >= s && t < e)
    if (sceneIdx === -1) sceneIdx = 10

    const [grain, vig, bw, red] = SCENE_PARAMS[sceneIdx]
    // Smooth transitions
    prevParams.grain += (grain - prevParams.grain) * 0.05
    prevParams.vignette += (vig - prevParams.vignette) * 0.05
    prevParams.bw += (bw - prevParams.bw) * 0.05
    prevParams.red += (red - prevParams.red) * 0.05

    effect.uniforms.get('uGrain').value = prevParams.grain
    effect.uniforms.get('uVignette').value = prevParams.vignette
    effect.uniforms.get('uBW').value = prevParams.bw
    effect.uniforms.get('uRedTint').value = prevParams.red
  })

  return <primitive object={effect} />
}
