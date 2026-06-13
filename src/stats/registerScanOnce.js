import { STATS_CONFIG } from '../config/statsConfig.js'

export async function registerScanOnce() {
  if (!STATS_CONFIG.endpoint) {
    console.info('Stats endpoint is empty. Scan was not sent.')
    return
  }

  const sessionKey = `scan-registered:${STATS_CONFIG.project}:${STATS_CONFIG.target}`

  if (sessionStorage.getItem(sessionKey) === '1') {
    return
  }

  sessionStorage.setItem(sessionKey, '1')

  try {
    await fetch(`${STATS_CONFIG.endpoint}/scan`, {
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
  } catch (error) {
    console.warn('Scan stats failed:', error)
  }
}
