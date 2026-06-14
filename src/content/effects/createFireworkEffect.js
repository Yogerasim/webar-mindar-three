export function createFireworkEffect(THREE) {
  const group = new THREE.Group()
  group.visible = false

  const particles = []
  const count = 90

  const geometry = new THREE.SphereGeometry(0.015, 12, 12)

  for (let i = 0; i < count; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.78 + Math.random() * 0.12, 1, 0.72),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })

    const particle = new THREE.Mesh(geometry, material)

    const angle = Math.random() * Math.PI * 2
    const elevation = (Math.random() - 0.5) * 0.9
    const speed = 0.45 + Math.random() * 1.35

    particle.userData = {
      direction: new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        elevation * speed
      ),
      startScale: 0.7 + Math.random() * 1.4,
    }

    particle.scale.setScalar(particle.userData.startScale)
    group.add(particle)
    particles.push(particle)
  }

  let active = false
  let time = 0

  function start() {
    active = true
    time = 0
    group.visible = true

    particles.forEach((particle) => {
      particle.position.set(0, 0.08, 0.45)
      particle.material.opacity = 1
      particle.scale.setScalar(particle.userData.startScale)
    })
  }

  function hide() {
    active = false
    group.visible = false
  }

  function update(delta) {
    if (!active) return

    time += delta

    particles.forEach((particle) => {
      const d = particle.userData.direction

      particle.position.x += d.x * delta
      particle.position.y += d.y * delta
      particle.position.z += d.z * delta

      particle.material.opacity = Math.max(0, 1 - time / 1.2)
      particle.scale.multiplyScalar(0.985)
    })

    if (time > 1.2) {
      hide()
    }
  }

  return {
    object: group,
    start,
    hide,
    update,
  }
}
