import { useGLTF } from '@react-three/drei'
import ScrollRange from '../ScrollRange'
import SunLight from './SunLight'
import {
  GROUND_SIZE,
  MODEL_SCALE,
  MODEL_URL,
  SCROLL_END,
  SCROLL_START,
  SQUARE_POS,
} from './constants'

export default function DemocracySquare() {
  const { scene } = useGLTF(MODEL_URL)

  return (
    <ScrollRange from={SCROLL_START} to={SCROLL_END}>
      <primitive
        object={scene}
        position={[SQUARE_POS.x, SQUARE_POS.y, SQUARE_POS.z]}
        scale={MODEL_SCALE}
      />
      <mesh
        position={[SQUARE_POS.x, SQUARE_POS.y - 0.01, SQUARE_POS.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <SunLight />
    </ScrollRange>
  )
}
