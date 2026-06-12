import { createBubbleGLB } from './createBubbleGLB.js'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createCanvasTexture(THREE, auraData, progress) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024

  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const bgGradient = ctx.createRadialGradient(512, 512, 40, 512, 512, 520)
  bgGradient.addColorStop(0, 'rgba(210, 120, 255, 0.26)')
  bgGradient.addColorStop(0.45, 'rgba(120, 80, 255, 0.16)')
  bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, 1024, 1024)

  ctx.textAlign = 'center'
  ctx.font = 'bold 56px Arial'
  ctx.fillStyle = 'rgba(235, 190, 255, 1)'
  ctx.shadowColor = 'rgba(210, 90, 255, 1)'
  ctx.shadowBlur = 24
  ctx.fillText('ТВОЯ АУРА', 512, 170)
  ctx.fillText('ЗАГРУЖЕНА', 512, 235)

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

    ctx.textAlign = 'center'
    ctx.font = '36px Arial'
    ctx.fillText(item.icon, 178, y + 2)

    const barX = 510
    const barY = y - 27
    const barW = 260
    const barH = 28

    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, 14)
    ctx.fill()

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

    ctx.shadowBlur = 0
    ctx.textAlign = 'left'
    ctx.font = 'bold 32px Arial'
    ctx.fillStyle = 'rgba(255, 240, 255, 1)'
    ctx.fillText(`${Math.round(animatedValue)}%`, 800, y)
  })

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

export async function createAuraScene(THREE, envMap = null) {
  const group = new THREE.Group()
  group.visible = false

  let auraData = createAuraData()
  let progress = 0

  const panelGeometry = new THREE.PlaneGeometry(1.42, 1.42)
  let panelTexture = createCanvasTexture(THREE, auraData, progress)

  const panelMaterial = new THREE.MeshBasicMaterial({
    map: panelTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const panel = new THREE.Mesh(panelGeometry, panelMaterial)
  panel.position.set(0, -0.80, 0.05)
  panel.renderOrder = 20
  group.add(panel)

  const bubbleGLB = await createBubbleGLB(THREE, envMap)
  bubbleGLB.object.renderOrder = 10
  group.add(bubbleGLB.object)

  function restart() {
    auraData = createAuraData()
    progress = 0
    group.visible = true

    panelTexture.dispose()
    panelTexture = createCanvasTexture(THREE, auraData, progress)
    panelMaterial.map = panelTexture
    panelMaterial.needsUpdate = true

    bubbleGLB.restart()
  }

  function hide() {
    group.visible = false
  }

  function update() {
    if (!group.visible) return

    if (progress < 1) {
      progress += 0.012

      panelTexture.dispose()
      panelTexture = createCanvasTexture(THREE, auraData, Math.min(progress, 1))
      panelMaterial.map = panelTexture
      panelMaterial.needsUpdate = true
    }

    bubbleGLB.update()
  }

  return {
    object: group,
    restart,
    hide,
    update,
  }
}
