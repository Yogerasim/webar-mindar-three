export function createBubbleMaterial(THREE, envMap = null) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffd6ff,

    // Стеклянность / глянец
    roughness: 0.0,
    metalness: 0.0,
    transmission: 1.0,
    thickness: 0.85,
    ior: 1.48,

    // Прозрачность
    transparent: true,
    opacity: 0.24,

    // Блики и отражения
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    reflectivity: 1.0,
    envMap,
    envMapIntensity: 4.5,

    // Лёгкий розовый оттенок внутри стекла
    attenuationColor: new THREE.Color(0xffb7ff),
    attenuationDistance: 0.7,

    // Перелив, если поддерживается текущей версией Three.js
    iridescence: 0.85,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 420],

    side: THREE.DoubleSide,

    // Для прозрачных объектов в AR обычно лучше false,
    // чтобы пузыри не перекрывали друг друга жёсткими артефактами.
    depthWrite: false,
  })
}
