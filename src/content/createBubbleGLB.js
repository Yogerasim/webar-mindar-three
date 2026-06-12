import { loadGLB } from '../loaders/loadGLB.js'
import { createBubbleMaterial } from '../materials/createBubbleMaterial.js'

export async function createBubbleGLB(THREE) {
  const gltf = await loadGLB(THREE, './assets/models/spheres.glb')

  const group = gltf.scene
  const bubbleMaterial = createBubbleMaterial(THREE)

  group.traverse((object) => {
    if (object.isMesh) {
      object.material = bubbleMaterial
      object.castShadow = false
      object.receiveShadow = false
      object.frustumCulled = false
      object.renderOrder = 10
    }
  })

  // Настройка размера и положения относительно image target.
  // Если сферы слишком большие/маленькие — правим здесь.
  group.scale.set(0.75, 0.75, 0.75)
  group.position.set(0, 0, 0.25)
  group.rotation.set(0, 0, 0)

  const mixer = new THREE.AnimationMixer(group)

  if (gltf.animations && gltf.animations.length > 0) {
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip)
      action.play()
    })
  }

  const clock = new THREE.Clock()

  function update() {
    const delta = clock.getDelta()
    mixer.update(delta)
  }

  return {
    object: group,
    update,
  }
}
