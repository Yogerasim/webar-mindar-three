import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const variantName = process.argv[2]

if (!variantName) {
  console.error('Usage: npm run save:variant -- client-a')
  process.exit(1)
}

if (!/^[a-z0-9-]+$/i.test(variantName)) {
  console.error(`Unsafe variant name: ${variantName}`)
  process.exit(1)
}

let clipboard = ''

try {
  clipboard = execSync('pbpaste', { encoding: 'utf8' }).trim()
} catch {
  console.error('Failed to read macOS clipboard via pbpaste')
  process.exit(1)
}

if (!clipboard) {
  console.error('Clipboard is empty. Copy config from viewer first.')
  process.exit(1)
}

let output = clipboard

if (output.includes('export const DEFAULT_SCENE_CONFIG')) {
  output = output.replace('export const DEFAULT_SCENE_CONFIG', 'export const SCENE_CONFIG_PATCH')
} else if (output.includes('export const SCENE_CONFIG_PATCH')) {
  // ok
} else {
  try {
    JSON.parse(output)
    output = `export const SCENE_CONFIG_PATCH = ${output}\n`
  } catch {
    console.error('Clipboard must contain viewer config module or raw JSON.')
    process.exit(1)
  }
}

if (!output.endsWith('\n')) output += '\n'

const variantsDir = path.join('public', '8wall', 'config', 'variants')
fs.mkdirSync(variantsDir, { recursive: true })

const targetPath = path.join(variantsDir, `${variantName}.js`)
fs.writeFileSync(targetPath, output)

console.log(`Saved variant: ${targetPath}`)
console.log(`Preview URL: /8wall/?variant=${variantName}&dev=1`)
