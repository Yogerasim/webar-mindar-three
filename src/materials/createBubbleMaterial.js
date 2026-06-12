export function createBubbleMaterial(THREE) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf2c6ff,
    roughness: 0.02,
    metalness: 0.0,

    transparent: true,
    opacity: 0.38,

    transmission: 0.75,
    thickness: 0.35,
    ior: 1.45,

    clearcoat: 1.0,
    clearcoatRoughness: 0.02,

    reflectivity: 0.9,
    envMapIntensity: 1.7,

    side: THREE.DoubleSide,
    depthWrite: false,
  })
}
