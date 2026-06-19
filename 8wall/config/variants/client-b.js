export const SCENE_CONFIG_PATCH = {
  "target": {
    "name": "waves",
    "json": "./image-targets/waves.json",
    "spheresGlb": "./assets/models/spheres.glb"
  },
  "timing": {
    "auraAppearDelayMs": 0,
    "auraLoadDurationMs": 4200,
    "fireworkDurationMs": 2200,
    "planetsStartDelayMs": 2200
  },
  "aura": {
    "titleLine1": "ТВОЙ ВАЙБ",
    "titleLine2": "ТВОЯ КРАСОТА",
    "statusText": "ТВОЙ ВАЙБ — ТВОЯ КРАСОТА",
    "phrases": [
      "Сегодня твоя энергия особенно сильна ✨",
      "Не подстраивайся под чужие стандарты. Создавай свои.",
      "Вселенная сегодня на твоей стороне 🌙",
      "Время сиять ярче обычного ✨",
      "Твоя аура сегодня особенно сильна 💜"
    ],
    "metrics": [
      { "label": "сияние", "icon": "✦", "min": 56, "max": 100 },
      { "label": "красота", "icon": "♥", "min": 56, "max": 100 },
      { "label": "энергия", "icon": "⚡", "min": 56, "max": 100 },
      { "label": "аура", "icon": "☁", "min": 56, "max": 100 }
    ]
  },
  "panel2d": {
    "main": {
      "x": 120,
      "y": 287,
      "w": 790,
      "h": 428,
      "r": 100,
      "gradient": [
        "rgba(255, 76, 205, 0.7)",
        "rgba(138, 84, 255, 0.61)",
        "rgba(57, 0, 255, 0.56)"
      ],
      "strokeStyle": "rgba(25, 215, 255, 0.32)",
      "strokeWidth": 9.5
    },
    "glow": {
      "colorStart": "rgba(255, 86, 25, 0.4)",
      "colorEnd": "rgba(255, 86, 205, 0)"
    },
    "title": {
      "y1": 374,
      "y2": 432,
      "size1": 75,
      "size2": 47,
      "color1": "#ffffff",
      "color2": "rgba(255, 224, 255, 0.96)"
    },
    "metrics": {
      "startY": 476,
      "gap": 60,
      "labelX": 165,
      "barX": 321,
      "barW": 422,
      "valueX": 862,
      "barH": 22,
      "labelSize": 36,
      "valueSize": 42,
      "labelColorFirst": "rgba(255, 245, 255, 1)",
      "labelColorOther": "rgba(240, 226, 255, 0.94)",
      "barBg": "rgba(255, 255, 255, 0.15)",
      "barGradient": [
        "#ff68df",
        "#b079ff",
        "#67e8ff"
      ],
      "valueColor": "rgba(255, 255, 255, 0.98)",
      "sparkColor": "rgba(255,255,255,0.88)"
    },
    "phrase": {
      "x": 126,
      "y": 752,
      "w": 776,
      "h": 123,
      "r": 32,
      "textY": 818,
      "fontSize": 31,
      "lineHeight": 44,
      "fillStyle": "rgba(20, 8, 38, 0.72)",
      "strokeLoaded": "rgba(255, 225, 255, 0.94)",
      "strokeLoading": "rgba(255, 225, 255, 0.38)",
      "textColor": "rgba(255,255,255,0.98)"
    },
    "planets": {
      "cx": 514,
      "cy": 546,
      "rx": 431,
      "ry": 382,
      "baseSize": 57,
      "speed": 0.46
    }
  },
  "spheres": {
    "scale": 0.22,
    "breathScale": 0.22,
    "position": { "x": 0, "y": -0.34, "z": 0.1 },
    "rotation": { "x": 1.5707963267948966, "y": 0, "z": 0 },
    "spinSpeed": 0.12
  },
  "content": {
    "position": { "x": 0, "y": 0, "z": 0.02 },
    "scale": 1
  },
  "panel": {
    "zOffset": 0.02
  }
}
