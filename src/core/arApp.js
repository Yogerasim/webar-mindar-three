import { AR_CONFIG } from '../config/arConfig.js'
import { createLights } from '../scene/createLights.js'
import { createTestCube } from '../content/createTestCube.js'

async function checkTargetFile(targetSrc) {
  const response = await fetch(targetSrc, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Target file not found: ${targetSrc}`)
  }

  const buffer = await response.arrayBuffer()

  if (buffer.byteLength < 100) {
    throw new Error(`Target file is too small or empty: ${targetSrc}`)
  }

  return buffer.byteLength
}

async function withTimeout(promise, ms, message) {
  let timeoutId

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function startAR({ container, statusText }) {
  statusText.textContent = 'Loading Three.js...'

  const THREE = await import('three')

  statusText.textContent = 'Loading MindAR engine...'

  const { MindARThree } = await import(
    'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js'
  )

  statusText.textContent = 'Checking tracker file...'

  const targetSize = await checkTargetFile(AR_CONFIG.targetSrc)

  statusText.textContent = `Tracker loaded: ${Math.round(targetSize / 1024)} KB`

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: AR_CONFIG.targetSrc,
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  })

  const { renderer, scene, camera } = mindarThree

  createLights(scene, THREE)

  const anchor = mindarThree.addAnchor(AR_CONFIG.targetIndex)

  const testCube = createTestCube(THREE)
  anchor.group.add(testCube.object)

  anchor.onTargetFound = () => {
    statusText.textContent = 'Target found'
  }

  anchor.onTargetLost = () => {
    statusText.textContent = 'Camera started. Point at target image.'
  }

  statusText.textContent = 'Starting camera...'

  await withTimeout(
    mindarThree.start(),
    20000,
    'MindAR start timeout. Camera permission may be stuck or tracker may be invalid.'
  )

  statusText.textContent = 'Camera started. Point at target image.'

  renderer.setAnimationLoop(() => {
    testCube.update()
    renderer.render(scene, camera)
  })
}
