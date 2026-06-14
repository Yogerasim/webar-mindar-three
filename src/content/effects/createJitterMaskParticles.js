export function createJitterMaskParticles(THREE) {
  const group = new THREE.Group()

  const particles = []
  const count = 55

  const geometry = new THREE.SphereGeometry(0.01, 8, 8)

  for (let i = 0; i < count; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xf4c8ff,
      transparent: true,
      opacity: 0.35 + Math.random() * 0.45,
      depthWrite: false,
    })

    const particle = new THREE.Mesh(geometry, material)

    particle.position.set(
      (Math.random() - 0.5) * 2.1,
      -0.4 + (Math.random() - 0.5) * 1.8,
      0.15 + Math.random() * 0.55
    )

    particle.userData = {
      baseX: particle.position.x,
      baseY: particle.position.y,
      baseZ: particle.position.z,
      speed: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      scale: 0.7 + Math.random() * 1.6,
    }

    particle.scale.setScalar(particle.userData.scale)
    group.add(particle)
    particles.push(particle)
  }

  function update(time) {
    particles.forEach((particle) => {
      const d = particle.userData

      particle.position.x = d.baseX + Math.sin(time * d.speed + d.phase) * 0.035
      particle.position.y = d.baseY + Math.cos(time * d.speed + d.phase) * 0.035
      particle.position.z = d.baseZ + Math.sin(time * d.speed * 1.4 + d.phase) * 0.035

      const pulse = 1 + Math.sin(time * d.speed * 2 + d.phase) * 0.22
      particle.scale.setScalar(d.scale * pulse)
    })
  }

  return {
    object: group,
    update,
  }
}
