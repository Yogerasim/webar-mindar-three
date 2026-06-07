export function createTestCube(THREE) {
  const group = new THREE.Group()

  const planeGeometry = new THREE.PlaneGeometry(1, 1)
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  })

  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.position.set(0, 0, 0.01)
  group.add(plane)

  const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const cubeMaterial = new THREE.MeshNormalMaterial()
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

  cube.position.set(0, 0, 0.35)
  group.add(cube)

  group.visible = false

  function update() {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.015
  }

  return {
    object: group,
    update,
  }
}
