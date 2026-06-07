export function createLights(scene, THREE) {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(1, 2, 2)

  scene.add(hemisphereLight)
  scene.add(directionalLight)

  return {
    hemisphereLight,
    directionalLight,
  }
}
