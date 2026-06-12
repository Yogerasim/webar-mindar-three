export async function loadEnvironmentMap(THREE, renderer, hdriPath) {
  const { EXRLoader } = await import(
    'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/EXRLoader.js'
  )

  const loader = new EXRLoader()

  return await new Promise((resolve, reject) => {
    loader.load(
      hdriPath,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping

        const pmremGenerator = new THREE.PMREMGenerator(renderer)
        pmremGenerator.compileEquirectangularShader()

        const envMap = pmremGenerator.fromEquirectangular(texture).texture

        texture.dispose()
        pmremGenerator.dispose()

        resolve(envMap)
      },
      undefined,
      (error) => reject(error)
    )
  })
}
