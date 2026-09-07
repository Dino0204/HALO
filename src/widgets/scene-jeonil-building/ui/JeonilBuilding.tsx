import { useGLTF } from '@react-three/drei'
import ScrollRange from '@/entities/scroll/ui/ScrollRange'
import BulletHoles from './BulletHoles'
import BulletTracers from './BulletTracers'
import Helicopter from './Helicopter'
import {
  BUILDING_MODEL_SCALE,
  BUILDING_MODEL_URL,
  BUILDING_POS,
  SCROLL_END,
  SCROLL_START,
} from '../model/constants'

export default function JeonilBuilding() {
  const { scene } = useGLTF(BUILDING_MODEL_URL)

  return (
    <ScrollRange from={SCROLL_START} to={SCROLL_END}>
      <primitive
        object={scene}
        position={[BUILDING_POS.x, BUILDING_POS.y, BUILDING_POS.z]}
        scale={BUILDING_MODEL_SCALE}
      />
      <Helicopter />
      <BulletTracers />
      <BulletHoles />
    </ScrollRange>
  )
}
