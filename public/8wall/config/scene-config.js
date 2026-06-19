export const DEFAULT_SCENE_CONFIG = {
  target: {
    name: 'waves',
    json: './image-targets/waves.json',
    spheresGlb: './assets/models/spheres.glb',
    previewRotationDeg: -90,
    previewImage: '/8wall/image-targets/waves_original.jpg',
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

  panel2d: {
    offsetY: 0,
    main: {
      x: 92,
      y: 62,
      w: 840,
      h: 500,
      r: 38,
      gradient: [
        'rgba(255, 76, 205, 0.27)',
        'rgba(138, 84, 255, 0.21)',
        'rgba(57, 210, 255, 0.16)',
      ],
      strokeStyle: 'rgba(255, 215, 255, 0.82)',
      strokeWidth: 3,
    },

    glow: {
      colorStart: 'rgba(255, 86, 205, 0.22)',
      colorEnd: 'rgba(255, 86, 205, 0)',
    },

    title: {
      y1: 145,
      y2: 197,
      size1: 58,
      size2: 42,
      color1: '#ffffff',
      color2: 'rgba(255, 224, 255, 0.96)',
    },

    metrics: {
      startY: 270,
      gap: 68,
      labelX: 150,
      barX: 340,
      barW: 350,
      valueX: 830,
      barH: 22,
      labelSize: 27,
      valueSize: 30,
      labelColorFirst: 'rgba(255, 245, 255, 1)',
      labelColorOther: 'rgba(240, 226, 255, 0.94)',
      barBg: 'rgba(255, 255, 255, 0.15)',
      barGradient: ['#ff68df', '#b079ff', '#67e8ff'],
      valueColor: 'rgba(255, 255, 255, 0.98)',
      sparkColor: 'rgba(255,255,255,0.88)',
    },

    phrase: {
      x: 118,
      y: 610,
      w: 788,
      h: 116,
      r: 32,
      textY: 658,
      fontSize: 29,
      lineHeight: 34,
      fillStyle: 'rgba(20, 8, 38, 0.42)',
      strokeLoaded: 'rgba(255, 225, 255, 0.94)',
      strokeLoading: 'rgba(255, 225, 255, 0.38)',
      textColor: 'rgba(255,255,255,0.98)',
    },

    planets: {
      cx: 512,
      cy: 392,
      rx: 510,
      ry: 310,
      baseSize: 22,
      speed: 0.42,
    },
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
