interface ScrollStore {
  offset: number
  el: HTMLElement | null
}

// ScrollControls 내부 scroll.offset 및 DOM 요소를 Canvas 외부와 공유하기 위한 store
export const scrollStore: ScrollStore = {
  offset: 0,
  el: null,
}
