import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { cloneAsGrayscale } from '@/shared/lib/three/cloneAsGrayscale'
import ScrollRange from '@/entities/scroll/ui/ScrollRange'
import { CEMETERY_POS } from '@/entities/gwangju/model/landmarks'
import MemorialParticles from './MemorialParticles'
import { MODEL_SCALE, MODEL_URL, SCROLL_START } from '../model/constants'

export default function May18Cemetery() {
  const { scene } = useGLTF(MODEL_URL)
  const cemeteryModel = useMemo(() => cloneAsGrayscale(scene), [scene])

  return (
    <ScrollRange from={SCROLL_START}>
      <primitive
        object={cemeteryModel}
        position={[CEMETERY_POS.x, CEMETERY_POS.y, CEMETERY_POS.z]}
        scale={MODEL_SCALE}
      />
      <directionalLight
        color="#ffd9a0"
        intensity={1.2}
        position={[CEMETERY_POS.x + 10, 20, CEMETERY_POS.z + 10]}
      />
      <MemorialParticles />
    </ScrollRange>
  )
}
