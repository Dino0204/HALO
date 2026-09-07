import { useGLTF } from '@react-three/drei'
import ScrollRange from '@/entities/scroll/ui/ScrollRange'
import { MBC_POS } from '@/entities/gwangju/model/landmarks'
import Crowd from './Crowd'
import FireFlicker from './FireFlicker'
import { MODEL_SCALE, MODEL_URL, SCROLL_END, SCROLL_START } from '../model/constants'

export default function GwangjuMBCBuilding() {
  const { scene } = useGLTF(MODEL_URL)

  return (
    <ScrollRange from={SCROLL_START} to={SCROLL_END}>
      <primitive object={scene} position={[MBC_POS.x, MBC_POS.y, MBC_POS.z]} scale={MODEL_SCALE} />
      <FireFlicker />
      <Crowd />
    </ScrollRange>
  )
}
