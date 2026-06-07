export function createTestCube(THREE) {
  const geometry = new THREE.BoxGeometry(1, 1, 1)

  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    roughness: 0.35,
    metalness: 0.15,
  })

  const cube = new THREE.Mesh(geometry, material)

  cube.scale.set(0.5, 0.5, 0.5)
  cube.position.set(0, 0, 0)

  function update() {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.015
  }

  return {
    object: cube,
    update,
  }
}
