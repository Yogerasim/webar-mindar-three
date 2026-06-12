export function createBubbleMaterial(THREE, envMap = null) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffd6ff,

    roughness: 0.0,
    metalness: 0.0,

    transmission: 1.0,
    thickness: 3.0,
    ior: 1.48,

    transparent: true,
    opacity: 0.86,

    clearcoat: 0.0,
    clearcoatRoughness: 0.0,

    reflectivity: 1.0,
    envMap,
    envMapIntensity: 10.0,

    attenuationColor: new THREE.Color(0xffb7ff),
    attenuationDistance: 0.7,

    iridescence: 0.85,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 420],

    side: THREE.DoubleSide,
    depthWrite: false,
  })
}
