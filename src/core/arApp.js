import { AR_CONFIG } from '../config/arConfig.js'
import { createLights } from '../scene/createLights.js'
import { createTestCube } from '../content/createTestCube.js'

export async function startAR({ container, statusText }) {
  const { MindARThree } = await import(
    'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js'
  )

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: AR_CONFIG.targetSrc,
  })

  const { renderer, scene, camera } = mindarThree

  createLights(scene)

  const anchor = mindarThree.addAnchor(AR_CONFIG.targetIndex)

  const testCube = createTestCube()
  anchor.group.add(testCube.object)

  anchor.onTargetFound = () => {
    statusText.textContent = 'Target found'
  }

  anchor.onTargetLost = () => {
    statusText.textContent = 'Target lost'
  }

  await mindarThree.start()

  renderer.setAnimationLoop(() => {
    testCube.update()
    renderer.render(scene, camera)
  })
}
