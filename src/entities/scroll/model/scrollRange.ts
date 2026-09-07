// 스크롤 구간 판정. ScrollRange 래퍼와, 프레임 작업을 건너뛰어야 하는
// 서브컴포넌트가 같은 정의를 쓴다.
export const SCROLL_RANGE_END = 1.0001

export function inRange(t: number, from: number, to: number = SCROLL_RANGE_END): boolean {
  return t >= from && t < to
}
