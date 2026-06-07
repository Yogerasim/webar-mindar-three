import { AR_CONFIG } from '../config/arConfig.js'
import { createLights } from '../scene/createLights.js'
import { createTestCube } from '../content/createTestCube.js'

async function checkTargetFile(targetSrc) {
  const response = await fetch(targetSrc)

  if (!response.ok) {
    throw new Error(`Target file not found: ${targetSrc}`)
  }
}

export async function startAR({ container, statusText }) {
  statusText.textContent = 'Loading AR engine...'

  const { MindARThree } = await import(
    'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js'
  )

  statusText.textContent = 'Checking tracker file...'
  await checkTargetFile(AR_CONFIG.targetSrc)

  statusText.textContent = 'Starting camera...'

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

  statusText.textContent = 'Camera started. Point at target image.'

  renderer.setAnimationLoop(() => {
    testCube.update()
    renderer.render(scene, camera)
  })
}
