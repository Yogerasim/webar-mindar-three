export async function registerScanOnce({
  endpoint = 'https://webar-stats.yogerasim.workers.dev',
  project = 'webar-mindar-three',
  target = 'main',
  debug = true,
} = {}) {
  const key = `scan:${project}:${target}`

  if (sessionStorage.getItem(key)) {
    if (debug) console.log('[stats] scan already registered in this session')
    return false
  }

  sessionStorage.setItem(key, '1')

  try {
    const response = await fetch(`${endpoint}/scan`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project,
        target,
        page: location.href,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      sessionStorage.removeItem(key)
      console.warn('[stats] scan failed:', response.status)
      return false
    }

    if (debug) console.log('[stats] scan registered')
    return true
  } catch (error) {
    sessionStorage.removeItem(key)
    console.warn('[stats] scan error:', error)
    return false
  }
}
