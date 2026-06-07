export function createTestCube(THREE) {
  const geometry = new THREE.BoxGeometry(1, 1, 1)

  const material = new THREE.MeshNormalMaterial()

  const cube = new THREE.Mesh(geometry, material)

  cube.scale.set(0.7, 0.7, 0.7)

  // Z — это высота над image target.
  // Если оставить z = 0, часть куба может быть "внутри" плоскости target.
  cube.position.set(0, 0, 0.35)

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
