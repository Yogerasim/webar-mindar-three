export async function loadGLB(THREE, modelPath) {
  const { GLTFLoader } = await import(
    'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'
  )

  const loader = new GLTFLoader()

  return await new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => resolve(gltf),
      undefined,
      (error) => reject(error)
    )
  })
}
