/// <reference types="vite/client" />

declare module '*.glsl?raw' {
  const src: string
  export default src
}

declare module '*.frag.glsl?raw' {
  const src: string
  export default src
}

declare module '*.vert.glsl?raw' {
  const src: string
  export default src
}

interface Window {
  _518scrollEl?: HTMLElement
  _518mouseRef?: { current: { x: number; y: number } }
}
