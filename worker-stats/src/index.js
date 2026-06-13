const ALLOWED_ORIGINS = [
  'https://yogerasim.github.io',
  'https://смкт.рф',
  'https://xn--j1adog.xn--p1ai',
]

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || ''

  const allowOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : '*'

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  }
}

function jsonResponse(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: getCorsHeaders(request),
  })
}

function getPragueDateString() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request),
      })
    }

    if (url.pathname === '/scan' && request.method === 'POST') {
      let body = {}

      try {
        body = await request.json()
      } catch (_) {
        body = {}
      }

      const project = String(body.project || 'webar-mindar-three').slice(0, 80)
      const target = String(body.target || 'main').slice(0, 80)
      const page = String(body.page || '').slice(0, 500)
      const userAgent = String(request.headers.get('User-Agent') || '').slice(0, 500)
      const createdAt = new Date().toISOString()

      await env.DB.prepare(
        `INSERT INTO scans (project, target, page, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(project, target, page, userAgent, createdAt)
        .run()

      return jsonResponse(request, {
        ok: true,
        createdAt,
      })
    }

    if (url.pathname === '/stats' && request.method === 'GET') {
      const project = url.searchParams.get('project') || 'webar-mindar-three'
      const target = url.searchParams.get('target') || 'main'

      const today = getPragueDateString()

      const totalRow = await env.DB.prepare(
        `SELECT COUNT(*) AS count
         FROM scans
         WHERE project = ? AND target = ?`
      )
        .bind(project, target)
        .first()

      const todayRow = await env.DB.prepare(
        `SELECT COUNT(*) AS count
         FROM scans
         WHERE project = ?
           AND target = ?
           AND substr(created_at, 1, 10) = ?`
      )
        .bind(project, target, today)
        .first()

      return jsonResponse(request, {
        project,
        target,
        today,
        todayCount: todayRow?.count || 0,
        totalCount: totalRow?.count || 0,
      })
    }

    if (url.pathname === '/daily' && request.method === 'GET') {
      const project = url.searchParams.get('project') || 'webar-mindar-three'
      const target = url.searchParams.get('target') || 'main'
      const limitRaw = Number(url.searchParams.get('limit') || 30)
      const limit = Math.max(1, Math.min(365, limitRaw))

      const result = await env.DB.prepare(
        `SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS count
         FROM scans
         WHERE project = ? AND target = ?
         GROUP BY substr(created_at, 1, 10)
         ORDER BY date DESC
         LIMIT ?`
      )
        .bind(project, target, limit)
        .all()

      return jsonResponse(request, {
        project,
        target,
        days: result.results || [],
      })
    }

    if (url.pathname === '/' && request.method === 'GET') {
      return jsonResponse(request, {
        ok: true,
        service: 'webar-stats',
        endpoints: ['/scan', '/stats', '/daily'],
      })
    }

    return jsonResponse(request, {
      ok: false,
      error: 'Not found',
    }, 404)
  },
}
