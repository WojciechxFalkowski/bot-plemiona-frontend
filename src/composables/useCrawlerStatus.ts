import { ref, onMounted, onUnmounted } from 'vue'
import { BACKEND_URL } from './backendUrl'

export interface CrawlerStatusActiveServer {
  serverId: number
  serverCode: string
  serverName: string
  taskType: string
  startedAt: string
  durationSeconds: number
}

export interface CrawlerStatusRecaptchaBlocked {
  serverId: number
  serverCode: string
  serverName: string
  detectedAt: string
}

export interface CrawlerStatusNextScheduledTask {
  taskType: string
  serverCode: string
}

export interface CrawlerStatus {
  activeServer: CrawlerStatusActiveServer | null
  recaptchaBlocked: CrawlerStatusRecaptchaBlocked[]
  nextScheduledInSeconds: number | null
  nextScheduledTask: CrawlerStatusNextScheduledTask | null
}

interface CrawlerStatusResponse {
  success: boolean
  activeServer: CrawlerStatusActiveServer | null
  recaptchaBlocked: CrawlerStatusRecaptchaBlocked[]
  nextScheduledInSeconds?: number | null
  nextScheduledTask?: CrawlerStatusNextScheduledTask | null
}

/**
 * Composable for crawler status (active server, recaptcha-blocked servers).
 * Used by CrawlerStatusBar for header display. Polls every 5 seconds.
 */
export function useCrawlerStatus() {
  const status = ref<CrawlerStatus>({
    activeServer: null,
    recaptchaBlocked: [],
    nextScheduledInSeconds: null,
    nextScheduledTask: null
  })

  let pollInterval: ReturnType<typeof setInterval> | null = null

  const fetchStatus = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/crawler-status`)
      if (!response.ok) return
      const result: CrawlerStatusResponse = await response.json()
      if (result.success) {
        status.value = {
          activeServer: result.activeServer ?? null,
          recaptchaBlocked: result.recaptchaBlocked ?? [],
          nextScheduledInSeconds: result.nextScheduledInSeconds ?? null,
          nextScheduledTask: result.nextScheduledTask ?? null
        }
      }
    } catch (err) {
      console.error('Error fetching crawler status:', err)
    }
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`
    const h = Math.floor(m / 60)
    const mm = m % 60
    return mm > 0 ? `${h}h ${mm}m` : `${h}h`
  }

  const startPolling = (intervalMs = 5000): void => {
    if (pollInterval) return
    fetchStatus()
    pollInterval = setInterval(fetchStatus, intervalMs)
  }

  const stopPolling = (): void => {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  onMounted(() => {
    startPolling(5000)
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    status,
    fetchStatus,
    formatDuration,
    startPolling,
    stopPolling
  }
}
