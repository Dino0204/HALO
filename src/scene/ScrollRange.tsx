import { useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import type { Group } from 'three'
import { inRange, SCROLL_RANGE_END } from '../utils/scrollRange'

type ScrollRangeProps = Omit<ThreeElements['group'], 'ref' | 'visible'> & {
  from: number
  to?: number
  children: ReactNode
}

// [from, to) 구간에서만 보이는 그룹.
// three.js는 visible=false 노드에서 하위 순회를 끊으므로 자식 메시·라이트가
// 모두 렌더 목록에서 빠진다. 자식이 각자 visible을 토글할 필요가 없다.
export default function ScrollRange({
  from,
  to = SCROLL_RANGE_END,
  children,
  ...groupProps
}: ScrollRangeProps) {
  const ref = useRef<Group>(null!)
  const scroll = useScroll()

  useFrame(() => {
    if (!ref.current) return
    ref.current.visible = inRange(scroll.offset, from, to)
  })

  return (
    <group ref={ref} visible={false} {...groupProps}>
      {children}
    </group>
  )
}
