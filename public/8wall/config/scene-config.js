export const DEFAULT_SCENE_CONFIG = {
  target: {
    name: 'waves',
    json: './image-targets/waves.json',
    spheresGlb: './assets/models/spheres.glb',
  },

  timing: {
    auraAppearDelayMs: 0,
    auraLoadDurationMs: 4300,
    fireworkDurationMs: 2200,
    planetsStartDelayMs: 2200,
  },

  aura: {
    titleLine1: 'ТВОЙ ВАЙБ',
    titleLine2: 'ТВОЯ КРАСОТА',
    statusText: 'ТВОЙ ВАЙБ — ТВОЯ КРАСОТА',

    phrases: [
      'Сегодня твоя энергия особенно сильна ✨',
      'Не подстраивайся под чужие стандарты. Создавай свои.',
      'Вселенная сегодня на твоей стороне 🌙',
      'Время сиять ярче обычного ✨',
      'Твоя аура сегодня особенно сильна 💜',
    ],

    metrics: [
      { label: 'сияние', icon: '✦', min: 80, max: 100 },
      { label: 'красота', icon: '♥', min: 80, max: 100 },
      { label: 'энергия', icon: '⚡', min: 80, max: 100 },
      { label: 'аура', icon: '☁', min: 80, max: 100 },
    ],
  },

  spheres: {
    scale: 0.22,
    breathScale: 0.22,
    position: { x: 0, y: -0.34, z: 0.10 },
    rotation: { x: 1.5707963267948966, y: 0, z: 0 },
    spinSpeed: 0.12,
  },

  content: {
    position: { x: 0, y: 0, z: 0.02 },
    scale: 1.0,
  },

  panel: {
    zOffset: 0.02,
  },
}
