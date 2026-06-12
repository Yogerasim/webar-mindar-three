import { loadGLB } from '../loaders/loadGLB.js'
import { createBubbleMaterial } from '../materials/createBubbleMaterial.js'

export async function createBubbleGLB(THREE, envMap = null) {
  const gltf = await loadGLB(THREE, './assets/models/spheres.glb')

  const group = gltf.scene
  const bubbleMaterial = createBubbleMaterial(THREE, envMap)

  group.traverse((object) => {
    if (object.isMesh) {
      object.material = bubbleMaterial
      object.castShadow = false
      object.receiveShadow = false
      object.frustumCulled = false
      object.renderOrder = 10
    }
  })

  group.scale.set(0.75, 0.75, 0.75)
  group.position.set(0, -0.90, 0.25)

  // Поворот по вертикальной оси на 90 градусов.
  // Если после теста будет не туда — поменяем на -Math.PI / 2.
  group.rotation.set(0, Math.PI / 2, 0)

  const mixer = new THREE.AnimationMixer(group)
  const actions = []

  if (gltf.animations && gltf.animations.length > 0) {
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip)
      action.setLoop(THREE.LoopRepeat)
      action.clampWhenFinished = false
      action.enabled = true
      action.play()
      actions.push(action)
    })
  }

  const clock = new THREE.Clock()

  function restart() {
    mixer.setTime(0)
    clock.start()

    actions.forEach((action) => {
      action.reset()
      action.play()
    })
  }

  function update() {
    const delta = clock.getDelta()
    mixer.update(delta)
  }

  return {
    object: group,
    restart,
    update,
  }
}
