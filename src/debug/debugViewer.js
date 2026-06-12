import * as THREE from 'three'
import GUI from 'lil-gui'
import { createLights } from '../scene/createLights.js'
import { createAuraScene } from '../content/createAuraScene.js'
import { loadEnvironmentMap } from '../loaders/loadEnvironmentMap.js'
import '../style.css'

const root = document.querySelector('#debug-root')

root.style.position = 'fixed'
root.style.inset = '0'
root.style.background = '#111'
root.style.overflow = 'hidden'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  100
)

camera.position.set(0, 0, 4.2)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace

root.appendChild(renderer.domElement)

createLights(scene, THREE)

const targetGeometry = new THREE.PlaneGeometry(1.4, 1.9)
const targetMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222,
  transparent: true,
  opacity: 0.45,
  side: THREE.DoubleSide,
})

const targetMock = new THREE.Mesh(targetGeometry, targetMaterial)
targetMock.position.set(0, 0, -0.02)
scene.add(targetMock)

const gridHelper = new THREE.GridHelper(4, 20, 0x8844ff, 0x333333)
gridHelper.rotation.x = Math.PI / 2
gridHelper.position.z = -0.04
scene.add(gridHelper)

let envMap = null

try {
  envMap = await loadEnvironmentMap(
    THREE,
    renderer,
    './assets/hdri/sunset.exr'
  )

  scene.environment = envMap
} catch (error) {
  console.warn('HDRI debug loading failed:', error)
}

const auraScene = await createAuraScene(THREE, envMap)
scene.add(auraScene.object)
auraScene.restart()

const params = {
  sceneY: -0.8,
  panelY: -0.8,
  bubblesY: -0.8,
  scale: 1.0,
  opacity: 0.24,
  roughness: 0.0,
  transmission: 1.0,
  thickness: 0.85,
  clearcoat: 1.0,
  envMapIntensity: 4.5,
  restartLoading: () => auraScene.restart(),
}

function findPanel() {
  let panel = null

  auraScene.object.traverse((object) => {
    if (object.isMesh && object.material?.map) {
      panel = object
    }
  })

  return panel
}

function findBubbleMeshes() {
  const meshes = []

  auraScene.object.traverse((object) => {
    if (object.isMesh && !object.material?.map) {
      meshes.push(object)
    }
  })

  return meshes
}

function findBubbleRoot() {
  let bubbleRoot = null

  auraScene.object.children.forEach((child) => {
    const hasMeshes = []
    child.traverse?.((object) => {
      if (object.isMesh && !object.material?.map) {
        hasMeshes.push(object)
      }
    })

    if (hasMeshes.length > 0) {
      bubbleRoot = child
    }
  })

  return bubbleRoot
}

const panel = findPanel()
const bubbleRoot = findBubbleRoot()
const bubbleMeshes = findBubbleMeshes()

function applyParams() {
  auraScene.object.position.y = params.sceneY
  auraScene.object.scale.setScalar(params.scale)

  if (panel) {
    panel.position.y = params.panelY
  }

  if (bubbleRoot) {
    bubbleRoot.position.y = params.bubblesY
  }

  bubbleMeshes.forEach((mesh) => {
    const material = mesh.material

    material.opacity = params.opacity
    material.roughness = params.roughness
    material.transmission = params.transmission
    material.thickness = params.thickness
    material.clearcoat = params.clearcoat
    material.envMapIntensity = params.envMapIntensity
    material.needsUpdate = true
  })
}

applyParams()

const gui = new GUI({
  title: 'AR Scene Debug',
})

const positionFolder = gui.addFolder('Position')
positionFolder.add(params, 'sceneY', -3, 2, 0.01).onChange(applyParams)
positionFolder.add(params, 'panelY', -3, 2, 0.01).onChange(applyParams)
positionFolder.add(params, 'bubblesY', -3, 2, 0.01).onChange(applyParams)
positionFolder.add(params, 'scale', 0.2, 2.5, 0.01).onChange(applyParams)

const materialFolder = gui.addFolder('Bubble Material')
materialFolder.add(params, 'opacity', 0.02, 1, 0.01).onChange(applyParams)
materialFolder.add(params, 'roughness', 0, 1, 0.01).onChange(applyParams)
materialFolder.add(params, 'transmission', 0, 1, 0.01).onChange(applyParams)
materialFolder.add(params, 'thickness', 0, 3, 0.01).onChange(applyParams)
materialFolder.add(params, 'clearcoat', 0, 1, 0.01).onChange(applyParams)
materialFolder.add(params, 'envMapIntensity', 0, 10, 0.1).onChange(applyParams)

gui.add(params, 'restartLoading').name('Restart loading')

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
})

renderer.setAnimationLoop(() => {
  auraScene.update()
  renderer.render(scene, camera)
})
