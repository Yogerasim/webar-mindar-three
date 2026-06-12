import { AR_CONFIG } from '../config/arConfig.js'
import { createLights } from '../scene/createLights.js'
import { createAuraScene } from '../content/createAuraScene.js'

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

  const THREE = await import(
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
  )

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
    filterMinCF: AR_CONFIG.filterMinCF,
    filterBeta: AR_CONFIG.filterBeta,
  })

  const { renderer, scene, camera } = mindarThree

  renderer.outputColorSpace = THREE.SRGBColorSpace

  createLights(scene, THREE)

  const anchor = mindarThree.addAnchor(AR_CONFIG.targetIndex)

  const auraScene = await createAuraScene(THREE)
  anchor.group.add(auraScene.object)

  anchor.onTargetFound = () => {
    auraScene.restart()
    statusText.textContent = 'ТВОЯ АУРА ЗАГРУЖЕНА'
  }

  anchor.onTargetLost = () => {
    auraScene.hide()
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
    auraScene.update()
    renderer.render(scene, camera)
  })
}
