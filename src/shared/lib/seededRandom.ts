// LCG (numerical recipes) — 씬 재현성을 위한 결정적 난수.
// 프레임마다 같은 배치를 만들어야 하므로 Math.random()을 쓰면 안 된다.
export function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}
