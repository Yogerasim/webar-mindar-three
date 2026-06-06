import * as THREE from 'three'

export async function startAR({ container, statusText }) {
  const { MindARThree } = await import(
    'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js'
  )

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: './assets/targets/tracker.mind',
  })

  const { renderer, scene, camera } = mindarThree
  const anchor = mindarThree.addAnchor(0)

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
  scene.add(light)

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    roughness: 0.35,
    metalness: 0.15,
  })

  const cube = new THREE.Mesh(geometry, material)
  cube.scale.set(0.5, 0.5, 0.5)
  anchor.group.add(cube)

  anchor.onTargetFound = () => {
    statusText.textContent = 'Target found'
  }

  anchor.onTargetLost = () => {
    statusText.textContent = 'Target lost'
  }

  await mindarThree.start()

  renderer.setAnimationLoop(() => {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.015
    renderer.render(scene, camera)
  })
}
