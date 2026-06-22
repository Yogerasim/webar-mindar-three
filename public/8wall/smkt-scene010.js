import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DEFAULT_SCENE_CONFIG } from './config/scene-config.js'

window.THREE = THREE

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(base, patch) {
  if (!isPlainObject(patch)) return base

  const result = Array.isArray(base) ? [...base] : { ...base }

  for (const [key, value] of Object.entries(patch)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value)
    } else {
      result[key] = value
    }
  }

  return result
}

function isDevPreviewMode() {
  const params = new URLSearchParams(window.location.search)
  return params.get('dev') === '1' || params.get('demo') === '1'
}

function isSafeVariantName(name) {
  return /^[a-z0-9-]+$/i.test(name)
}

async function getRuntimeSceneConfig(defaultConfig) {
  let config = defaultConfig

  try {
    const params = new URLSearchParams(window.location.search)
    const variantName = params.get('variant')
    const allowDraft = params.get('viewer') === '1' || params.get('useDraftConfig') === '1'

    if (variantName) {
      if (!isSafeVariantName(variantName)) {
        console.warn('[config] ignored unsafe variant name:', variantName)
      } else {
        const variantModule = await import(/* @vite-ignore */ `./config/variants/${variantName}.js?v=${Date.now()}`)
        const variantConfig =
          variantModule.SCENE_CONFIG_PATCH ||
          variantModule.SCENE_CONFIG ||
          variantModule.DEFAULT_SCENE_CONFIG ||
          {}

        config = deepMerge(config, variantConfig)
        console.log('[config] variant applied:', variantName)
      }
    }

    if (allowDraft) {
      const stored = window.localStorage.getItem('smktSceneConfigDraft')
      if (stored) {
        config = deepMerge(config, JSON.parse(stored))
        console.log('[config] viewer draft applied')
      }
    }
  } catch (error) {
    console.warn('[config] failed to read runtime config:', error)
  }

  return config
}

const SCENE_CONFIG = await getRuntimeSceneConfig(DEFAULT_SCENE_CONFIG)


const TARGET_NAME = SCENE_CONFIG.target.name
const TARGET_JSON = SCENE_CONFIG.target.json
const SPHERES_GLB = SCENE_CONFIG.target.spheresGlb

const AURA_APPEAR_DELAY_MS = SCENE_CONFIG.timing.auraAppearDelayMs
const AURA_LOAD_DURATION_MS = SCENE_CONFIG.timing.auraLoadDurationMs
const FIREWORK_DURATION_MS = SCENE_CONFIG.timing.fireworkDurationMs
const PLANETS_START_DELAY_MS = SCENE_CONFIG.timing.planetsStartDelayMs

const STATS_ENDPOINT = 'https://webar-stats.yogerasim.workers.dev'
const STATS_PROJECT = 'webar-mindar-three'
const STATS_TARGET = 'main'
let pageOpenStatSent = false
let scanStatSent = false

function sendStatsEvent({ target, label }) {
  if (isDevPreviewMode()) {
    console.log(`[stats] ${label} skipped in dev preview mode`)
    return Promise.resolve(true)
  }

  return fetch(`${STATS_ENDPOINT}/scan`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-store',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: STATS_PROJECT,
      target,
      page: location.href,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        console.warn(`[stats] ${label} failed:`, response.status)
        return false
      }

      console.log(`[stats] ${label} registered`)
      return true
    })
    .catch((error) => {
      console.warn(`[stats] ${label} error:`, error)
      return false
    })
}

function sendPageOpenStat() {
  if (pageOpenStatSent) return
  pageOpenStatSent = true

  sendStatsEvent({
    target: STATS_TARGET,
    label: 'page_open',
  }).then((ok) => {
    if (ok) {
      setStatus('PAGE OPEN · STATS SENT')
    } else {
      pageOpenStatSent = false
      setStatus('PAGE OPEN · STATS ERROR')
    }
  })
}

function sendScanStat() {
  if (scanStatSent) return
  scanStatSent = true

  sendStatsEvent({
    target: STATS_TARGET,
    label: 'target_scan',
  }).then((ok) => {
    if (ok) {
      setStatus('TARGET FOUND · STATS SENT')
    } else {
      scanStatSent = false
      setStatus('TARGET FOUND · STATS ERROR')
    }
  })
}

const statusEl = document.querySelector('#status')
const canvas = document.querySelector('#camerafeed')

function setStatus(text) {
  if (statusEl) statusEl.textContent = text
}

function waitForXR8() {
  return new Promise((resolve) => {
    if (window.XR8) {
      resolve()
      return
    }

    window.addEventListener('xrloaded', () => resolve(), { once: true })
  })
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createAuraData() {
  const phrases = SCENE_CONFIG.aura.phrases

  return {
    metrics: SCENE_CONFIG.aura.metrics.map((metric) => ({
      label: metric.label,
      icon: metric.icon,
      value: randomInt(metric.min, metric.max),
    })),
    phrase: phrases[randomInt(0, phrases.length - 1)],
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawAuraCanvas(ctx, auraData, progress, alpha) {
  const canvas = ctx.canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.globalAlpha = alpha

  const bgGradient = ctx.createRadialGradient(512, 512, 40, 512, 512, 520)
  bgGradient.addColorStop(0, 'rgba(210, 120, 255, 0.30)')
  bgGradient.addColorStop(0.45, 'rgba(120, 80, 255, 0.18)')
  bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, 1024, 1024)

  ctx.textAlign = 'center'
  ctx.font = 'bold 54px Arial'
  ctx.fillStyle = 'rgba(255, 225, 255, 1)'
  ctx.shadowColor = 'rgba(220, 100, 255, 1)'
  ctx.shadowBlur = 28
  ctx.fillText(SCENE_CONFIG.aura.titleLine1, 512, 165)
  ctx.fillText(SCENE_CONFIG.aura.titleLine2, 512, 230)

  ctx.shadowBlur = 30
  ctx.strokeStyle = 'rgba(230, 140, 255, 0.95)'
  ctx.lineWidth = 4
  ctx.fillStyle = 'rgba(20, 10, 35, 0.66)'

  const panelX = 135
  const panelY = 305
  const panelW = 754
  const panelH = 330
  roundRect(ctx, panelX, panelY, panelW, panelH, 36)
  ctx.fill()
  ctx.stroke()

  const startY = 382
  const rowGap = 68

  auraData.metrics.forEach((item, index) => {
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
    roundRect(ctx, barX, barY, barW, barH, 14)
    ctx.fill()

    const animatedValue = item.value * progress
    const fillW = Math.max(1, barW * (animatedValue / 100))

    const barGradient = ctx.createLinearGradient(barX, barY, barX + barW, barY)
    barGradient.addColorStop(0, 'rgba(110, 90, 255, 1)')
    barGradient.addColorStop(0.55, 'rgba(210, 95, 255, 1)')
    barGradient.addColorStop(1, 'rgba(255, 210, 255, 1)')

    ctx.fillStyle = barGradient
    ctx.shadowColor = 'rgba(210, 95, 255, 1)'
    ctx.shadowBlur = 18
    roundRect(ctx, barX, barY, fillW, barH, 14)
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
  ctx.fillStyle = 'rgba(20, 10, 35, 0.70)'
  ctx.lineWidth = 4
  roundRect(ctx, 140, 700, 744, 160, 34)
  ctx.fill()
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.textAlign = 'center'
  ctx.font = 'bold 34px Arial'
  ctx.fillStyle = 'rgba(255, 235, 255, 1)'

  const words = auraData.phrase.split(' ')
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

  for (let i = 0; i < 32; i++) {
    const x = randomInt(90, 930)
    const y = randomInt(80, 930)
    const size = randomInt(2, 7)

    ctx.fillStyle = `rgba(255, 220, 255, ${Math.random() * 0.8 + 0.2})`
    ctx.shadowColor = 'rgba(220, 120, 255, 1)'
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}


function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function easeOutCubic(value) {
  const t = clamp01(value)
  return 1 - Math.pow(1 - t, 3)
}

function easeOutBack(value) {
  const t = clamp01(value)
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function getSequentialMoodProgress(globalT, count) {
  const result = []
  if (!count) return result

  const auraWeight = 1.35
  const otherWeight = 0.85
  const totalWeight = auraWeight + otherWeight * Math.max(0, count - 1)

  let cursor = 0

  for (let i = 0; i < count; i++) {
    const weight = i === 0 ? auraWeight : otherWeight
    const start = cursor / totalWeight
    const end = (cursor + weight) / totalWeight
    const localT = clamp01((globalT - start) / (end - start))
    result.push(easeOutCubic(localT))
    cursor += weight
  }

  return result
}





function clonePanel2dConfig(panel2d) {
  return JSON.parse(JSON.stringify(panel2d))
}

function getPanel2dRuntimeConfig(panel2d) {
  const ui = clonePanel2dConfig(panel2d)
  const offsetY = Number(ui.offsetY || 0)

  if (!offsetY) return ui

  ui.main.y += offsetY
  ui.title.y1 += offsetY
  ui.title.y2 += offsetY
  ui.metrics.startY += offsetY
  ui.phrase.y += offsetY
  ui.phrase.textY += offsetY
  ui.planets.cy += offsetY

  return ui
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line.trim(), x, currentY)
}



const beautyMetricAnimationStarts = new Map()
let beautyMetricAnimationFrameRequested = false

function isBeautyMetric(metric) {
  return String(metric?.label || '').trim().toLowerCase() === 'красота'
}

function getBeautyMetricAnimationDurationMs() {
  try {
    if (typeof SCENE_CONFIG !== 'undefined') {
      return Number(SCENE_CONFIG?.timing?.auraLoadDurationMs || 4200)
    }
  } catch {}

  try {
    if (typeof config !== 'undefined') {
      return Number(config?.timing?.auraLoadDurationMs || 4200)
    }
  } catch {}

  return 4200
}

function requestBeautyMetricAnimationFrame() {
  if (beautyMetricAnimationFrameRequested) return

  beautyMetricAnimationFrameRequested = true

  requestAnimationFrame(() => {
    beautyMetricAnimationFrameRequested = false

    try {
      if (typeof drawScenePreview === 'function') {
        drawScenePreview()
      }
    } catch {}
  })
}

function getDisplayedMetricValue(metric, value) {
  if (!isBeautyMetric(metric)) {
    return value
  }

  const key = String(metric?.label || 'красота')
  const now = performance.now()

  if (!beautyMetricAnimationStarts.has(key)) {
    beautyMetricAnimationStarts.set(key, now)
  }

  const start = beautyMetricAnimationStarts.get(key)
  const duration = Math.max(300, getBeautyMetricAnimationDurationMs())
  const progress = Math.max(0, Math.min(1, (now - start) / duration))
  const displayedValue = Math.round(100 * progress)

  if (progress < 1) {
    requestBeautyMetricAnimationFrame()
  }

  return displayedValue
}


function percentToProgress(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(1, number / 100))
}

function createPanel() {
  const canvas2d = document.createElement('canvas')
  canvas2d.width = 1024
  canvas2d.height = 1024

  const ctx = canvas2d.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas2d)
  texture.colorSpace = THREE.SRGBColorSpace

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  })

  const geometry = new THREE.PlaneGeometry(1.42, 1.42)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, 0.02)

  const UI = getPanel2dRuntimeConfig(SCENE_CONFIG.panel2d)

  const starSeeds = Array.from({ length: 70 }, (_, i) => {
    const a = Math.sin(i * 999.13) * 10000
    const b = Math.sin(i * 456.77) * 10000
    const c = Math.sin(i * 77.31) * 10000
    const d = Math.sin(i * 13.51) * 10000

    return {
      x: (a - Math.floor(a)) * canvas2d.width,
      y: 30 + (b - Math.floor(b)) * (canvas2d.height - 60),
      r: 0.9 + (c - Math.floor(c)) * 2.2,
      phase: (d - Math.floor(d)) * Math.PI * 2,
    }
  })

  const bursts = [
    { x: 260, y: 220, delay: 0.00, scale: 0.86 },
    { x: 760, y: 255, delay: 0.16, scale: 0.78 },
    { x: 510, y: 355, delay: 0.32, scale: 1.04 },
    { x: 290, y: 690, delay: 0.48, scale: 0.82 },
    { x: 735, y: 665, delay: 0.64, scale: 0.92 },
  ]

  return {
    mesh,
    texture,
    redraw: (auraData, moodProgress, alpha = 1, fx = {}) => {
      const w = canvas2d.width
      const h = canvas2d.height
      const loaded = fx.loaded || false
      const fireworkT = fx.fireworkT || 0
      const planetsT = fx.planetsT || 0
      const elapsed = fx.elapsed || 0

      const progressList = Array.isArray(moodProgress)
        ? moodProgress
        : (auraData.metrics || []).map(() => moodProgress || 0)

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.globalAlpha = alpha

      const cx = w / 2

      // Спокойные звёзды: медленное мерцание, без быстрых шумных точек
      for (const star of starSeeds) {
        const twinkle = 0.34 + 0.36 * Math.sin(elapsed * 0.95 + star.phase)
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 235, 255, ${twinkle})`
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Основная карточка: только заголовок и муды
      const main = UI.main
      const mainGradient = ctx.createLinearGradient(main.x, main.y, main.x + main.w, main.y + main.h)
      mainGradient.addColorStop(0, UI.main.gradient[0])
      mainGradient.addColorStop(0.5, UI.main.gradient[1])
      mainGradient.addColorStop(1, UI.main.gradient[2])

      roundRect(ctx, main.x, main.y, main.w, main.h, main.r)
      ctx.fillStyle = mainGradient
      ctx.fill()

      ctx.lineWidth = UI.main.strokeWidth
      ctx.strokeStyle = UI.main.strokeStyle
      ctx.stroke()

      const glow = ctx.createRadialGradient(cx, main.y + 155, 10, cx, main.y + 180, 470)
      glow.addColorStop(0, UI.glow.colorStart)
      glow.addColorStop(1, UI.glow.colorEnd)
      ctx.fillStyle = glow
      ctx.fillRect(main.x - 90, main.y - 90, main.w + 180, main.h + 180)

      ctx.textAlign = 'center'
      ctx.fillStyle = UI.title.color1
      ctx.font = `800 ${UI.title.size1}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillText(SCENE_CONFIG.aura.titleLine1, cx, UI.title.y1)

      ctx.font = `800 ${UI.title.size2}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillStyle = UI.title.color2
      ctx.fillText(SCENE_CONFIG.aura.titleLine2, cx, UI.title.y2)

      // Метрики: отдельные зоны для названия, шкалы и процентов
      const metrics = auraData.metrics || []
      const m = UI.metrics

      metrics.forEach((metric, i) => {
        const p = progressList[i] ?? 0
        const value = Math.round((metric.value || 0) * p)
        const y = m.startY + i * m.gap

        const pop = Math.min(1, p * 1.2)
        const scale = 0.97 + 0.03 * easeOutBack(pop)

        ctx.save()
        ctx.translate(cx, y)
        ctx.scale(scale, scale)
        ctx.translate(-cx, -y)

        ctx.textAlign = 'left'
        ctx.font = `700 ${m.labelSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
        ctx.fillStyle = i === 0 ? m.labelColorFirst : m.labelColorOther
        ctx.fillText(metric.label || metric.name || 'Муд', m.labelX, y + 8)

        // фон шкалы
        roundRect(ctx, m.barX, y - 13, m.barW, m.barH, 14)
        ctx.fillStyle = m.barBg
        ctx.fill()

        // заполнение шкалы
        const displayValue = getDisplayedMetricValue(metric, value)
        const fillW = Math.max(0, m.barW * percentToProgress(displayValue))
        const barGradient = ctx.createLinearGradient(m.barX, y, m.barX + m.barW, y)
        barGradient.addColorStop(0, m.barGradient[0])
        barGradient.addColorStop(0.55, m.barGradient[1])
        barGradient.addColorStop(1, m.barGradient[2])

        roundRect(ctx, m.barX, y - 13, fillW, m.barH, 14)
        ctx.fillStyle = barGradient
        ctx.fill()

        // проценты справа, отдельно от шкалы
        ctx.textAlign = 'right'
        ctx.font = `800 ${m.valueSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
        ctx.fillStyle = m.valueColor
        ctx.fillText(`${displayValue}%`, m.valueX, y + 10)

        if (p > 0.05 && p < 1) {
          const sparkX = m.barX + fillW
          ctx.beginPath()
          ctx.fillStyle = m.sparkColor
          ctx.arc(sparkX, y - 2, 4.5 + 2 * Math.sin(elapsed * 3.5 + i), 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      // Отдельная нижняя рамка для фразы. Она НЕ внутри основной карточки.
      const phrase = UI.phrase
      roundRect(ctx, phrase.x, phrase.y, phrase.w, phrase.h, phrase.r)
      ctx.fillStyle = phrase.fillStyle
      ctx.fill()

      ctx.lineWidth = 2.5
      ctx.strokeStyle = loaded ? phrase.strokeLoaded : phrase.strokeLoading
      ctx.stroke()

      // Пять фейерверков по очереди
      if (fireworkT > 0 && fireworkT < 1) {
        for (const burstData of bursts) {
          const local = clamp01((fireworkT - burstData.delay) / 0.34)

          if (local <= 0 || local >= 1) continue

          const burst = easeOutCubic(local)
          const particles = 34
          const fade = 1 - burst

          for (let i = 0; i < particles; i++) {
            const angle = (Math.PI * 2 * i) / particles
            const seed = 0.75 + 0.45 * Math.sin(i * 12.989 + burstData.x)
            const radius = (25 + burst * 250 * seed) * burstData.scale
            const x = burstData.x + Math.cos(angle) * radius
            const y = burstData.y + Math.sin(angle) * radius
            const r = (6.5 * fade + 1.5) * burstData.scale

            ctx.beginPath()
            ctx.fillStyle = `rgba(255, ${150 + (i % 5) * 20}, 255, ${fade})`
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.beginPath()
          ctx.strokeStyle = `rgba(255,255,255,${0.55 * fade})`
          ctx.lineWidth = 6 * fade
          ctx.arc(burstData.x, burstData.y, 60 + burst * 150 * burstData.scale, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Фраза появляется только после фейерверков
      if (loaded) {
        const phraseAlpha = clamp01((fireworkT - 0.82) * 5.5)
        ctx.save()
        ctx.globalAlpha = alpha * phraseAlpha
        ctx.textAlign = 'center'
        ctx.fillStyle = phrase.textColor
        ctx.font = `700 ${phrase.fontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
        wrapText(ctx, auraData.phrase || '', cx, phrase.textY, phrase.w - 80, phrase.lineHeight)
        ctx.restore()
      }

      // 4 планеты после фейерверков + блёстки по траектории
      if (planetsT > 0) {
        const appear = easeOutCubic(planetsT)
        const pl = UI.planets
        const time = elapsed * pl.speed

        const planetColors = [
          ['#ff79d8', '#fff0fb'],
          ['#8c7cff', '#e7e1ff'],
          ['#65eaff', '#f0ffff'],
          ['#ffd36b', '#fff8d5'],
        ]

        for (let i = 0; i < 4; i++) {
          const a = time + i * Math.PI * 0.5
          const x = pl.cx + Math.cos(a) * pl.rx * appear
          const y = pl.cy + Math.sin(a) * pl.ry * appear
          const size = (pl.baseSize + i * 4) * appear

          // Хвост блёсток позади планеты
          for (let t = 1; t <= 12; t++) {
            const ta = a - t * 0.075
            const tx = pl.cx + Math.cos(ta) * pl.rx * appear
            const ty = pl.cy + Math.sin(ta) * pl.ry * appear
            const tr = Math.max(1, size * (0.13 - t * 0.007))
            const opacity = Math.max(0, 0.36 - t * 0.027)

            ctx.beginPath()
            ctx.fillStyle = `rgba(255, 235, 255, ${opacity})`
            ctx.arc(tx, ty, tr, 0, Math.PI * 2)
            ctx.fill()
          }

          const pg = ctx.createRadialGradient(x - size * 0.35, y - size * 0.35, 2, x, y, size)
          pg.addColorStop(0, planetColors[i][1])
          pg.addColorStop(1, planetColors[i][0])

          ctx.beginPath()
          ctx.fillStyle = pg
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.strokeStyle = `rgba(255,255,255,${0.20 * appear})`
          ctx.lineWidth = 2
          ctx.ellipse(x, y, size * 1.45, size * 0.42, -0.45, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      ctx.restore()
      texture.needsUpdate = true
    },
  }
}

async function loadSpheres() {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(SPHERES_GLB)
  const group = gltf.scene

  group.traverse((object) => {
    if (!object.isMesh) return

    object.frustumCulled = false
    object.renderOrder = 10

    object.material = new THREE.MeshPhysicalMaterial({
      color: 0xffb8ff,
      transparent: true,
      opacity: 0.34,
      roughness: 0.18,
      metalness: 0.05,
      transmission: 0.35,
      thickness: 0.6,
      emissive: 0x6a1c8c,
      emissiveIntensity: 0.18,
      depthWrite: false,
    })
  })

  // ВАЖНО: тут правим масштаб и ориентацию.
  // Если будет всё ещё крупно — уменьши 0.22 до 0.14.
  // Если будет лежать не той стороной — поменяй rotation.x на -Math.PI / 2.
  group.scale.setScalar(0.22)
  group.position.set(0, -0.34, 0.10)
  group.rotation.set(Math.PI / 2, 0, 0)

  const mixer = new THREE.AnimationMixer(group)
  const actions = []

  if (gltf.animations && gltf.animations.length > 0) {
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip)
      action.setLoop(THREE.LoopRepeat)
      action.reset()
      action.play()
      actions.push(action)
    })
  } else {
    console.warn('spheres.glb has no animations')
  }

  return {
    object: group,
    mixer,
    actions,
    restart: () => {
      mixer.setTime(0)
      actions.forEach((action) => {
        action.reset()
        action.play()
      })
    },
    update: (delta, elapsed) => {
      mixer.update(delta)

      // Если в GLB нет анимации, всё равно даём лёгкое дыхание.
      const breath = 1 + Math.sin(elapsed * 1.2) * 0.035
      group.scale.setScalar(0.22 * breath)
      group.rotation.z += delta * 0.12
    },
  }
}

function makeAuraExperience(scene) {
  const root = new THREE.Group()
  root.visible = false

  // Эта группа будет получать pose image target.
  root.matrixAutoUpdate = false

  const content = new THREE.Group()
  content.position.set(0, 0, 0.02)
  content.scale.setScalar(1.0)
  root.add(content)

  const panel = createPanel()
  content.add(panel.mesh)

  scene.add(root)

  let auraData = createAuraData()
  let found = false
  let foundAt = 0
  let lastSeenAt = 0
  let spheres = null

  const clock = new THREE.Clock()

  loadSpheres().then((loaded) => {
    spheres = loaded
    content.add(spheres.object)
  })

  function onFound() {
    auraData = createAuraData()
    found = true
    sendScanStat()
    foundAt = performance.now()
    lastSeenAt = foundAt
    root.visible = false
    panel.redraw(auraData, 0, 0)

    if (spheres) spheres.restart()

    setStatus('Таргет найден. Загружаем ауру...')
  }

  function onLostSoft() {
    found = false
    root.visible = false
    setStatus('Наведи камеру на принт')
  }

  function updateFromPose(pose) {
    if (!pose) {
      if (found && performance.now() - lastSeenAt > 500) {
        onLostSoft()
      }
      return
    }

    if (!found) onFound()

    lastSeenAt = performance.now()

    const { position, rotation, scale } = pose

    root.position.set(position.x, position.y, position.z)
    root.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)

    const s = typeof scale === 'number' ? scale : 1
    root.scale.setScalar(s)

    root.updateMatrix()
  }

  function update() {
    const now = performance.now()
    const delta = clock.getDelta()
    const elapsed = clock.elapsedTime

    if (!found) return

    const sinceFound = now - foundAt

    // Интерфейс появляется сразу. Сначала грузится аура, потом остальные муды.
    root.visible = true

    const loadT = clamp01((sinceFound - AURA_APPEAR_DELAY_MS) / AURA_LOAD_DURATION_MS)
    const metricCount = auraData.metrics ? auraData.metrics.length : 0
    const moodProgress = getSequentialMoodProgress(loadT, metricCount)

    const loaded = loadT >= 1
    const fireworkT = loaded
      ? clamp01((sinceFound - AURA_APPEAR_DELAY_MS - AURA_LOAD_DURATION_MS) / FIREWORK_DURATION_MS)
      : 0

    const planetsT = loaded
      ? clamp01((sinceFound - AURA_APPEAR_DELAY_MS - AURA_LOAD_DURATION_MS - PLANETS_START_DELAY_MS) / 1400)
      : 0

    panel.redraw(auraData, moodProgress, 1, {
      loaded,
      fireworkT,
      planetsT,
      elapsed,
    })

    if (spheres) spheres.update(delta, elapsed)

    if (!loaded) {
      setStatus(`Загрузка вайба ${Math.round(loadT * 100)}%`)
    } else if (fireworkT < 1) {
      setStatus('Вайб загружен ✨')
    } else {
      setStatus(SCENE_CONFIG.aura.statusText)
    }
  }

  return {
    root,
    updateFromPose,
    update,
  }
}

async function main() {
  setStatus('Loading 8th Wall...')

  await waitForXR8()

  setStatus('Loading target...')

  const targetData = await fetch(TARGET_JSON, { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error(`Cannot load target json: ${TARGET_JSON}`)
    return r.json()
  })

  XR8.XrController.configure({
    imageTargetData: [targetData],
    disableWorldTracking: true,
  })

  const smktPipeline = {
    name: 'smkt-aura-scene',

    onStart: () => {
      const { scene, camera, renderer } = XR8.Threejs.xrScene()

      renderer.outputColorSpace = THREE.SRGBColorSpace

      scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.0))

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.25)
      directionalLight.position.set(1, 2, 2)
      scene.add(directionalLight)

      window.SMKT_AURA = makeAuraExperience(scene)

      camera.position.set(0, 0, 0)
      setStatus('Наведи камеру на принт')
    },

    onUpdate: ({ processCpuResult }) => {
      if (!window.SMKT_AURA) return

      const detectedImages =
        processCpuResult?.reality?.detectedImages ||
        processCpuResult?.reality?.images ||
        []

      const pose = detectedImages.find((image) => image.name === TARGET_NAME)

      window.SMKT_AURA.updateFromPose(pose)
      window.SMKT_AURA.update()
    },
  }

  const modules = [
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
  ]

  if (window.LandingPage) {
    modules.push(LandingPage.pipelineModule())
  }

  modules.push(smktPipeline)

  XR8.addCameraPipelineModules(modules)

  setStatus('Starting camera...')

  function forceFullscreenCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.style.position = 'fixed'
    canvas.style.inset = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.display = 'block'
    canvas.width = Math.floor(window.innerWidth * dpr)
    canvas.height = Math.floor(window.innerHeight * dpr)
  }

  forceFullscreenCanvas()
  window.addEventListener('resize', forceFullscreenCanvas)
  window.addEventListener('orientationchange', () => {
    setTimeout(forceFullscreenCanvas, 300)
  })

  XR8.run({
    canvas,
    allowedDevices: XR8.XrConfig.device().ANY,
  })
}

main().catch((error) => {
  console.error(error)
  setStatus(`Error: ${error.message}`)
})
