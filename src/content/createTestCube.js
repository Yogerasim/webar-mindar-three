export function createTestCube(THREE) {
  const cubeGeometry = new THREE.BoxGeometry(0.45, 0.45, 0.45)
  const cubeMaterial = new THREE.MeshNormalMaterial()
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

  cube.position.set(0, 0, 0.3)
  cube.visible = false

  function update() {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.015
  }

  return {
    object: cube,
    update,
  }
}
