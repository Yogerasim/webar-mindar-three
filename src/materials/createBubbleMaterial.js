export function createBubbleMaterial(THREE, envMap = null) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf2b8ff,

    roughness: 0.0,
    metalness: 0.0,

    transparent: true,
    opacity: 0.42,

    transmission: 0.82,
    thickness: 0.55,
    ior: 1.45,

    clearcoat: 1.0,
    clearcoatRoughness: 0.0,

    reflectivity: 1.0,
    envMap,
    envMapIntensity: 2.4,

    side: THREE.DoubleSide,
    depthWrite: false,
  })
}
