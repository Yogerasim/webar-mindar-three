# WebAR 8th Wall Scene — СМКТ

Production WebAR-проект для футболки «СМКТ».

Пользователь сканирует QR-код, открывает WebAR-страницу, разрешает доступ к камере и наводит телефон на принт футболки. AR-сцена привязывается к image target на футболке, а не к человеку целиком.

## Production URLs

- Main: https://смкт.рф/
- Stats dashboard: https://смкт.рф/corporate.html
- Repository: https://github.com/Yogerasim/webar-mindar-three

## Главная цель архитектуры

Визуальные правки не должны ломать:

- отправку статистики;
- image target tracking;
- загрузку 8th Wall;
- production deploy;
- production dashboard статистики.

Проект должен быть устроен так, чтобы визуал можно было быстро докручивать через конфиг или viewer, не трогая стабильные технические модули.

## Основной принцип

Проект делится на независимые слои:

1. AR / Target layer
2. Stats layer
3. Visual scene layer
4. Viewer / tuning layer
5. Deploy layer
6. Experiments archive

Каждый слой должен меняться отдельно.

---

# Структура проекта

```txt
src/
  app/
    # запуск приложения, boot logic

  ar/
    # настройки image target и tracking
    targetConfig.js

  stats/
    # отправка статистики скана
    registerScanOnce.js

  scene/
    # визуальная сцена
    config/
      sceneConfig.js
    elements/
      # отдельные элементы сцены: panel, planets, bubbles, text, effects

  viewer/
    # визуальный редактор настроек сцены

  utils/
    # общие вспомогательные функции

public/
  8wall/
    # production/основная WebAR-технология

  assets/
    # модели, текстуры, картинки, GLB, PNG, WEBP

  image-targets/
    # production image target files

  corporate.html
    # dashboard статистики

  experiments/
    # архив альтернативных технологий и тестов:
    # arjs, mindar, zappar, onirix

  archive/
    scenes/
      # старые версии сцен
```

---

# Что можно менять при визуальных правках

При настройке внешнего вида сцены можно менять только:

```txt
src/scene/config/sceneConfig.js
src/scene/elements/*
public/assets/*
```

Сюда относятся:

- положение всей сцены;
- масштаб всей сцены;
- положение текста;
- размер текста;
- прозрачность;
- свечение;
- рамки;
- подложки;
- планеты;
- ось движения планет;
- радиус орбит планет;
- размер планет;
- скорость планет;
- trails / шлейфы;
- bubbles / spheres;
- интенсивность свечения;
- тайминги появления визуальных элементов.

---

# Что нельзя менять при визуальных правках

При обычной визуальной настройке нельзя трогать:

```txt
src/stats/registerScanOnce.js
src/ar/targetConfig.js
public/image-targets/*
public/corporate.html
vite.config.js
package.json
```

Иначе можно случайно сломать:

- статистику;
- image target;
- 8th Wall boot;
- production deploy;
- dashboard.

---

# AR / Target layer

Target-настройки должны жить отдельно от визуала.

Файл:

```txt
src/ar/targetConfig.js
```

Пример:

```js
export const TARGET_CONFIG = Object.freeze({
  name: 'waves',
  jsonPath: './image-targets/waves.json',
})
```

Этот файл отвечает только за:

- имя target;
- путь к target JSON;
- production image marker.

Если задача звучит как «подвинуть планеты», «усилить glow», «поменять прозрачность», этот файл не трогать.

---

# Stats layer

Статистика должна жить отдельно от сцены.

Файл:

```txt
src/stats/registerScanOnce.js
```

Задачи модуля:

- отправить scan event;
- не отправлять дубли внутри одной browser session;
- отправить данные в правильном формате;
- не зависеть от визуала.

Endpoint:

```txt
https://webar-stats.yogerasim.workers.dev/scan
```

Формат запроса:

```json
{
  "project": "webar-mindar-three",
  "target": "main",
  "page": "current page url",
  "user_agent": "browser user agent",
  "created_at": "ISO date"
}
```

Правило:

> Визуальные правки не должны менять код статистики.

---

# Visual scene layer

Вся настройка визуала должна постепенно переехать в:

```txt
src/scene/config/sceneConfig.js
```

Пример структуры:

```js
export const SCENE_CONFIG = {
  root: {
    x: 0,
    y: 0,
    z: 0.02,
    scale: 1,
  },

  panel: {
    x: 92,
    y: 62,
    width: 840,
    height: 500,
    opacity: 0.66,
    borderOpacity: 0.82,
    glow: 0.82,
  },

  planets: {
    centerX: 512,
    centerY: 392,
    radiusX: 420,
    radiusY: 250,
    baseSize: 20,
    speed: 0.42,
    opacity: 1,
    glow: 1,
    trailLength: 12,
    trailOpacity: 0.36,
  },
}
```

Viewer и ручные донастройки должны менять именно этот конфиг.

---

# Viewer

Viewer нужен для быстрой настройки сцены без переписывания кода.

Viewer должен уметь менять:

- позицию всей сцены;
- масштаб всей сцены;
- положение panel/card;
- прозрачность panel/card;
- прозрачность рамок;
- glow рамок;
- положение title;
- размеры title;
- положение metrics;
- ширину progress bars;
- положение phrase box;
- размер phrase text;
- opacity phrase box;
- орбиту планет `radiusX / radiusY`;
- размер планет;
- скорость планет;
- opacity планет;
- glow планет;
- длину trail;
- opacity trail;
- положение bubbles/spheres;
- scale bubbles/spheres;
- opacity bubbles/spheres;
- emissive intensity.

Viewer не должен менять:

- stats;
- target;
- 8th Wall boot logic;
- deploy config.

---

# Production deploy

Production deploy идёт через Vite и `gh-pages`.

Типовые команды:

```bash
npm install
npm run dev
npm run build
npm run deploy
```

Рекомендуемые команды после уборки:

```bash
npm run check:prod
npm run build:prod
npm run deploy:prod
```

---

# Cache busting

Чтобы обновления быстрее доходили до пользователя, нужно использовать hashed assets или версию в URL.

Хороший вариант через Vite:

```txt
assets/[name]-[hash].js
assets/[name]-[hash].css
assets/[name]-[hash][extname]
```

Тогда при изменении файла браузер получает новый URL и не держит старую версию.

Если используется ручное подключение файла сцены, нужно обновлять query string:

```html
<script src="/smkt-scene-current.js?v=20260616-001"></script>
```

Но предпочтительнее использовать сборку Vite с hashed assets.

---

# Branch policy

Рекомендуемая политика веток:

```txt
master
  production source

gh-pages
  production deploy only

cleanup/repo-architecture
  временная ветка уборки архитектуры

experiments/*
  экспериментальные ветки

backup/*
  backup перед большими изменениями
```

Старые ветки не удалять, пока production не проверен.

Особенно не удалять сразу:

```txt
improve-tracking-and-stats
```

В ней может быть полезный код статистики.

---

# Experiments

Альтернативные технологии должны лежать отдельно от production:

```txt
public/experiments/arjs
public/experiments/mindar
public/experiments/zappar
public/experiments/onirix
```

Production-путь должен быть один:

```txt
public/8wall
```

---

# Правило для человека или AI-агента

Перед любой правкой определить тип задачи.

## 1. Визуальная настройка

Менять только:

```txt
src/scene/config/sceneConfig.js
src/scene/elements/*
public/assets/*
```

Не трогать:

```txt
src/stats/*
src/ar/*
public/image-targets/*
```

## 2. Статистика

Менять только:

```txt
src/stats/*
public/corporate.html
```

Не трогать визуал без отдельной задачи.

## 3. Target / marker

Менять только:

```txt
src/ar/*
public/image-targets/*
```

Не трогать visual scene без отдельной задачи.

## 4. Deploy / cache

Менять только:

```txt
vite.config.js
package.json
scripts/*
.github/workflows/*
```

## 5. Experiment

Делать в отдельной ветке:

```txt
experiments/name-of-experiment
```

---

# Production safety checklist

Перед deploy проверить:

```bash
npm run check:prod
npm run build:prod
```

После deploy проверить:

```bash
curl -I "https://xn--j1adog.xn--p1ai/"
curl -H "Cache-Control: no-cache" -s "https://xn--j1adog.xn--p1ai/" | head -40
```

Проверить статистику вручную:

```bash
curl -i -X POST "https://webar-stats.yogerasim.workers.dev/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "webar-mindar-three",
    "target": "manual-test",
    "page": "terminal-test",
    "user_agent": "curl",
    "created_at": "2026-06-16T00:00:00.000Z"
  }'
```

Потом:

```bash
curl -s "https://webar-stats.yogerasim.workers.dev/stats"
curl -s "https://webar-stats.yogerasim.workers.dev/daily?limit=7"
```

---

# Важное правило проекта

Не чинить визуал через изменение статистики.

Не чинить статистику через изменение визуала.

Не менять target без явной задачи на target.

Не пушить experiments в production.

Сцена должна быть настраиваемой, но стабильные механики должны оставаться изолированными.
