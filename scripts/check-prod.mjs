import fs from 'node:fs'

const requiredFiles = [
  'index.html',
  'public/8wall/index.html',
  'public/8wall/smkt-scene010.js',
  'public/8wall/external/runtime/runtime.js',
  'public/8wall/image-targets/waves.json',
  'public/8wall/assets/models/spheres.glb',
  'public/corporate.html',
]

const forbiddenPaths = [
  'public/8wall005',
  'public/archive',
]

function fail(message) {
  console.error(`[check-prod] ERROR: ${message}`)
  process.exitCode = 1
}

function read(path) {
  return fs.readFileSync(path, 'utf8')
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    fail(`Required file is missing: ${file}`)
  }
}

for (const path of forbiddenPaths) {
  if (fs.existsSync(path)) {
    fail(`Forbidden legacy path exists: ${path}`)
  }
}

if (fs.existsSync('index.html')) {
  const rootIndex = read('index.html')

  if (!rootIndex.includes('/8wall/')) {
    fail('Root index.html must redirect to /8wall/')
  }

  if (!rootIndex.includes('webar-stats.yogerasim.workers.dev/scan')) {
    fail('Root index.html must track QR-open stats before AR redirect')
  }

  if (!rootIndex.includes('target: \'main\'') && !rootIndex.includes('"target": "main"')) {
    fail('Root index.html QR-open stats must use target main')
  }
}

if (fs.existsSync('public/8wall/index.html')) {
  const arIndex = read('public/8wall/index.html')

  const checks = [
    ['runtime.js', '8wall index must load local runtime.js'],
    ['@8thwall/engine-binary', '8wall index must load 8th Wall engine'],
    ['smkt-scene010.js', '8wall index must load smkt-scene010.js'],
    ['#status', '8wall index must contain status element/styles'],
    ['#camerafeed', '8wall index must contain camera canvas'],
  ]

  for (const [needle, message] of checks) {
    if (!arIndex.includes(needle)) fail(message)
  }
}

if (fs.existsSync('public/8wall/smkt-scene010.js')) {
  const scene = read('public/8wall/smkt-scene010.js')

  const checks = [
    ['STATS_ENDPOINT', 'scene must contain STATS_ENDPOINT'],
    ['sendScanStat', 'scene must contain target-found stats function'],
    ['sendStatsEvent', 'scene must contain reusable stats sender'],
    ['function onFound', 'scene must contain onFound target handler'],
    ['sendScanStat()', 'onFound must call sendScanStat()'],
    ['TARGET_JSON', 'scene must reference image target json'],
    ['SPHERES_GLB', 'scene must reference spheres model'],
  ]

  for (const [needle, message] of checks) {
    if (!scene.includes(needle)) fail(message)
  }
}

if (process.exitCode) {
  process.exit(process.exitCode)
}

console.log('[check-prod] OK')
