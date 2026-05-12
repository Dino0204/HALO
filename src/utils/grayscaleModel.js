function applyGrayscaleMaterial(material) {
  const nextMaterial = material.clone()

  if (nextMaterial.color) {
    const hsl = {}
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

export function cloneAsGrayscale(scene) {
  const clone = scene.clone(true)

  clone.traverse((object) => {
    if (!object.isMesh || !object.material) return
    object.material = Array.isArray(object.material)
      ? object.material.map(applyGrayscaleMaterial)
      : applyGrayscaleMaterial(object.material)
    object.castShadow = true
    object.receiveShadow = true
  })

  return clone
}
