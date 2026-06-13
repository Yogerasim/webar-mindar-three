import { STATS_CONFIG } from '../config/statsConfig.js'

export async function registerScanOnce() {
  const sessionKey = `scan-registered:${STATS_CONFIG.project}:${STATS_CONFIG.target}`

  if (sessionStorage.getItem(sessionKey) === '1') {
    return
  }

  sessionStorage.setItem(sessionKey, '1')

  try {
    const response = await fetch(`${STATS_CONFIG.endpoint}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: STATS_CONFIG.project,
        target: STATS_CONFIG.target,
        page: location.href,
        createdAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Stats request failed: ${response.status}`)
    }

    console.info('Scan registered')
  } catch (error) {
    console.warn('Scan stats failed:', error)
  }
}
