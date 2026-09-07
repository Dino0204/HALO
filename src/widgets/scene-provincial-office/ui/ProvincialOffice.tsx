import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { cloneAsGrayscale } from '@/shared/lib/three/cloneAsGrayscale'
import ScrollRange from '@/entities/scroll/ui/ScrollRange'
import ArmoredVehicle from './ArmoredVehicle'
import {
  OFFICE_MODEL_SCALE,
  OFFICE_MODEL_URL,
  OFFICE_MODEL_Y_OFFSET,
  OFFICE_POS,
  SCROLL_END,
  SCROLL_START,
  VEHICLE_OFFSETS,
} from '../model/constants'

export default function ProvincialOffice() {
  const { scene } = useGLTF(OFFICE_MODEL_URL)
  const officeModel = useMemo(() => cloneAsGrayscale(scene), [scene])

  return (
    <ScrollRange from={SCROLL_START} to={SCROLL_END}>
      <primitive
        object={officeModel}
        position={[OFFICE_POS.x, OFFICE_MODEL_Y_OFFSET, OFFICE_POS.z]}
        rotation={[0, Math.PI, 0]}
        scale={OFFICE_MODEL_SCALE}
      />
      {VEHICLE_OFFSETS.map((offset, i) => (
        <ArmoredVehicle key={i} offsetX={offset.x} offsetZ={offset.z} />
      ))}
    </ScrollRange>
  )
}
