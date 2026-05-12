import * as THREE from 'three'

type MaterialWithColor = THREE.Material & {
  color?: THREE.Color
  onBeforeCompile?: (shader: THREE.WebGLProgramParametersWithUniforms) => void
  customProgramCacheKey?: () => string
  needsUpdate?: boolean
}

function applyGrayscaleMaterial(material: THREE.Material): THREE.Material {
  const nextMaterial = material.clone() as MaterialWithColor

  if (nextMaterial.color) {
    const hsl = { h: 0, s: 0, l: 0 }
    nextMaterial.color.getHSL(hsl)
    nextMaterial.color.setHSL(0, 0, hsl.l)
  }

  nextMaterial.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <tonemapping_fragment>',
      `
        float grayscaleValue = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = vec3(grayscaleValue);
        #include <tonemapping_fragment>
      `
    )
  }
  nextMaterial.customProgramCacheKey = () => 'grayscale-material'
  nextMaterial.needsUpdate = true

  return nextMaterial
}

export function cloneAsGrayscale(scene: THREE.Object3D): THREE.Object3D {
  const clone = scene.clone(true)

  clone.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return
    const mesh = object as THREE.Mesh
    if (!mesh.material) return
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(applyGrayscaleMaterial)
      : applyGrayscaleMaterial(mesh.material)
    mesh.castShadow = true
    mesh.receiveShadow = true
  })

  return clone
}
