import { useRef } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import fragmentShader from './film.frag.glsl?raw'

class FilmEffectImpl extends Effect {
  constructor() {
    super('FilmEffect', fragmentShader, {
      uniforms: new Map([
        ['uProgress', new Uniform(0)],
        ['uTime', new Uniform(0)],
      ]),
    })
  }
}

export function FilmEffect() {
  const effectRef = useRef(new FilmEffectImpl())
  const scroll = useScroll()

  useFrame(({ clock }) => {
    effectRef.current.uniforms.get('uProgress').value = scroll.offset
    effectRef.current.uniforms.get('uTime').value = clock.elapsedTime
  })

  return <primitive object={effectRef.current} />
}
