import fs from 'node:fs'

const requiredFiles = [
  'src/stats/registerScanOnce.js',
  'src/ar/targetConfig.js',
  'src/scene/config/sceneConfig.js',
]

let ok = true

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`[check-prod] Missing file: ${file}`)
    ok = false
  }
}

const stats = fs.readFileSync('src/stats/registerScanOnce.js', 'utf8')

if (!stats.includes('webar-stats.yogerasim.workers.dev')) {
  console.error('[check-prod] Stats endpoint is missing')
  ok = false
}

if (!stats.includes('sessionStorage')) {
  console.error('[check-prod] sessionStorage duplicate protection is missing')
  ok = false
}

if (!stats.includes('Content-Type')) {
  console.error('[check-prod] JSON POST headers are missing')
  ok = false
}

if (!ok) {
  process.exit(1)
}

console.log('[check-prod] OK')
