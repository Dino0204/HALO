import { useGLTF } from '@react-three/drei'
import { GWANGJU_LANDMARKS } from '../utils/gwangjuCityScale'
import ScrollRange from './ScrollRange'

const SCROLL_START = 0.2857
const SCROLL_END = 0.5
const MODEL_URL = '/models/cnu-main-building.glb'
const MODEL_SCALE = 0.035
const MODEL_Y_OFFSET = -0.1

export default function CnuMainBuilding() {
  const { scene } = useGLTF(MODEL_URL)
  const { x, z } = GWANGJU_LANDMARKS.cnuGate

  return (
    <ScrollRange from={SCROLL_START} to={SCROLL_END}>
      <primitive object={scene} position={[x, MODEL_Y_OFFSET, z - 3]} scale={MODEL_SCALE} />
    </ScrollRange>
  )
}
