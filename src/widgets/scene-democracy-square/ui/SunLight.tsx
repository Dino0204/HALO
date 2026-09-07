import { SQUARE_POS } from '../model/constants'

// 가시성은 부모 ScrollRange가 관리한다 — 라이트도 invisible 그룹 아래에서는
// 렌더러 라이트 목록에 오르지 않는다.
export default function SunLight() {
  return (
    <directionalLight
      color="#fff6e0"
      intensity={1.0}
      position={[SQUARE_POS.x + 8, 20, SQUARE_POS.z + 8]}
    />
  )
}
