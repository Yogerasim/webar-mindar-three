function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createCanvasTexture(THREE, auraData, progress) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024

  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Background glow
  const bgGradient = ctx.createRadialGradient(512, 512, 40, 512, 512, 520)
  bgGradient.addColorStop(0, 'rgba(210, 120, 255, 0.26)')
  bgGradient.addColorStop(0.45, 'rgba(120, 80, 255, 0.16)')
  bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, 1024, 1024)

  // Main title
  ctx.textAlign = 'center'
  ctx.font = 'bold 56px Arial'
  ctx.fillStyle = 'rgba(235, 190, 255, 1)'
  ctx.shadowColor = 'rgba(210, 90, 255, 1)'
  ctx.shadowBlur = 24
  ctx.fillText('ТВОЯ АУРА', 512, 170)
  ctx.fillText('ЗАГРУЖЕНА', 512, 235)

  // Panel
  ctx.shadowBlur = 32
  ctx.strokeStyle = 'rgba(220, 120, 255, 0.9)'
  ctx.lineWidth = 4
  ctx.fillStyle = 'rgba(20, 10, 35, 0.64)'

  const panelX = 140
  const panelY = 310
  const panelW = 744
  const panelH = 330
  const radius = 36

  ctx.beginPath()
  ctx.roundRect(panelX, panelY, panelW, panelH, radius)
  ctx.fill()
  ctx.stroke()

  const rows = auraData.metrics
  const startY = 385
  const rowGap = 68

  rows.forEach((item, index) => {
    const y = startY + index * rowGap

    ctx.shadowBlur = 0
    ctx.textAlign = 'left'
    ctx.font = 'bold 34px Arial'
    ctx.fillStyle = 'rgba(255, 235, 255, 1)'
    ctx.fillText(item.label, 220, y)

    // Icon
    ctx.textAlign = 'center'
    ctx.font = '36px Arial'
    ctx.fillText(item.icon, 178, y + 2)

    // Bar background
    const barX = 510
    const barY = y - 27
    const barW = 260
    const barH = 28

    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, 14)
    ctx.fill()

    // Bar fill
    const animatedValue = item.value * progress
    const fillW = barW * (animatedValue / 100)

    const barGradient = ctx.createLinearGradient(barX, barY, barX + barW, barY)
    barGradient.addColorStop(0, 'rgba(110, 90, 255, 1)')
    barGradient.addColorStop(0.55, 'rgba(210, 95, 255, 1)')
    barGradient.addColorStop(1, 'rgba(255, 210, 255, 1)')

    ctx.fillStyle = barGradient
    ctx.shadowColor = 'rgba(210, 95, 255, 1)'
    ctx.shadowBlur = 18
    ctx.beginPath()
    ctx.roundRect(barX, barY, fillW, barH, 14)
    ctx.fill()

    // Percent
    ctx.shadowBlur = 0
    ctx.textAlign = 'left'
    ctx.font = 'bold 32px Arial'
    ctx.fillStyle = 'rgba(255, 240, 255, 1)'
    ctx.fillText(`${Math.round(animatedValue)}%`, 800, y)
  })

  // Phrase panel
  ctx.shadowColor = 'rgba(210, 90, 255, 1)'
  ctx.shadowBlur = 24
  ctx.strokeStyle = 'rgba(220, 120, 255, 0.9)'
  ctx.fillStyle = 'rgba(20, 10, 35, 0.68)'
  ctx.lineWidth = 4

  ctx.beginPath()
  ctx.roundRect(140, 700, 744, 160, 34)
  ctx.fill()
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.textAlign = 'center'
  ctx.font = 'bold 34px Arial'
  ctx.fillStyle = 'rgba(255, 235, 255, 1)'

  const phrase = auraData.phrase
  const words = phrase.split(' ')
  let line = ''
  const lines = []

  words.forEach((word) => {
    const testLine = line + word + ' '
    const width = ctx.measureText(testLine).width

    if (width > 620) {
      lines.push(line)
      line = word + ' '
    } else {
      line = testLine
    }
  })

  lines.push(line)

  lines.forEach((text, index) => {
    ctx.fillText(text.trim(), 512, 765 + index * 42)
  })

  // Small stars
  for (let i = 0; i < 36; i++) {
    const x = randomInt(80, 940)
    const y = randomInt(80, 940)
    const size = randomInt(2, 7)

    ctx.fillStyle = `rgba(255, 220, 255, ${Math.random() * 0.8 + 0.2})`
    ctx.shadowColor = 'rgba(220, 120, 255, 1)'
    ctx.shadowBlur = 14

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  return texture
}

function createAuraData() {
  const phrases = [
    'Сегодня твоя энергия особенно сильна ✨',
    'Не подстраивайся под чужие стандарты. Создавай свои.',
    'Вселенная сегодня на твоей стороне 🌙',
    'Время сиять ярче обычного ✨',
    'Твоя аура сегодня особенно сильна 💜',
  ]

  return {
    metrics: [
      { label: 'сияние', icon: '✦', value: randomInt(80, 100) },
      { label: 'красота', icon: '♥', value: randomInt(80, 100) },
      { label: 'энергия', icon: '⚡', value: randomInt(80, 100) },
      { label: 'аура', icon: '☁', value: randomInt(80, 100) },
    ],
    phrase: phrases[randomInt(0, phrases.length - 1)],
  }
}

function createBubble(THREE, index) {
  const geometry = new THREE.SphereGeometry(0.09 + Math.random() * 0.07, 32, 32)

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xd9b3ff,
    transparent: true,
    opacity: 0.38,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.75,
    thickness: 0.4,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  })

  const bubble = new THREE.Mesh(geometry, material)

  const angle = (index / 10) * Math.PI * 2
  const radius = 0.82 + Math.random() * 0.45

  bubble.position.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * 0.75,
    0.28 + Math.random() * 0.25
  )

  bubble.userData = {
    baseX: bubble.position.x,
    baseY: bubble.position.y,
    baseZ: bubble.position.z,
    speed: 0.7 + Math.random() * 0.9,
    phase: Math.random() * Math.PI * 2,
  }

  return bubble
}

export function createAuraScene(THREE) {
  const group = new THREE.Group()
  group.visible = false

  let auraData = createAuraData()
  let progress = 0
  let time = 0

  const panelGeometry = new THREE.PlaneGeometry(1.65, 1.65)
  let panelTexture = createCanvasTexture(THREE, auraData, progress)

  const panelMaterial = new THREE.MeshBasicMaterial({
    map: panelTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const panel = new THREE.Mesh(panelGeometry, panelMaterial)
  panel.position.set(0, 0, 0.05)
  group.add(panel)

  const bubbles = []

  for (let i = 0; i < 10; i++) {
    const bubble = createBubble(THREE, i)
    bubbles.push(bubble)
    group.add(bubble)
  }

  function restart() {
    auraData = createAuraData()
    progress = 0
    time = 0
    group.visible = true

    panelTexture.dispose()
    panelTexture = createCanvasTexture(THREE, auraData, progress)
    panelMaterial.map = panelTexture
    panelMaterial.needsUpdate = true
  }

  function hide() {
    group.visible = false
  }

  function update() {
    if (!group.visible) return

    time += 0.016

    if (progress < 1) {
      progress += 0.012

      panelTexture.dispose()
      panelTexture = createCanvasTexture(THREE, auraData, Math.min(progress, 1))
      panelMaterial.map = panelTexture
      panelMaterial.needsUpdate = true
    }

    bubbles.forEach((bubble, index) => {
      const data = bubble.userData

      bubble.position.x = data.baseX + Math.sin(time * data.speed + data.phase) * 0.04
      bubble.position.y = data.baseY + Math.cos(time * data.speed + data.phase) * 0.04
      bubble.position.z = data.baseZ + Math.sin(time * data.speed * 1.3 + data.phase) * 0.06

      const scale = 1 + Math.sin(time * data.speed + data.phase) * 0.13
      bubble.scale.setScalar(scale)

      bubble.rotation.x += 0.004
      bubble.rotation.y += 0.006
    })
  }

  return {
    object: group,
    restart,
    hide,
    update,
  }
}
