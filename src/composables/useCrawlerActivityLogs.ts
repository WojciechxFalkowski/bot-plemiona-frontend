import { ref } from 'vue'
import { BACKEND_URL } from './backendUrl'

export type CrawlerActivityEventType = 'session_expired' | 'success' | 'error' | 'info'

export interface CrawlerActivityLog {
  id: number
  executionLogId: number | null
  serverId: number
  operationType: string
  eventType: CrawlerActivityEventType
  message: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

interface ActivitiesResponse {
  success: boolean
  data: CrawlerActivityLog[]
}

/**
 * Composable for fetching crawler activity logs (detailed events per execution).
 * Used when expanding execution log rows to show sent attacks, built buildings, etc.
 */
export function useCrawlerActivityLogs() {
  const activitiesCache = ref<Map<number, CrawlerActivityLog[]>>(new Map())
  const loadingLogIds = ref<Set<number>>(new Set())

  const fetchActivities = async (executionLogId: number): Promise<CrawlerActivityLog[]> => {
    const cached = activitiesCache.value.get(executionLogId)
    if (cached !== undefined) {
      return cached
    }

    loadingLogIds.value.add(executionLogId)

    try {
      const response = await fetch(`${BACKEND_URL}/api/crawler-execution-logs/${executionLogId}/activities`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ActivitiesResponse = await response.json()
      const activities = result.data ?? []
      activitiesCache.value.set(executionLogId, activities)
      return activities
    } catch (err) {
      console.error('Error fetching activity logs:', err)
      return []
    } finally {
      loadingLogIds.value.delete(executionLogId)
    }
  }

  const getActivities = (executionLogId: number): CrawlerActivityLog[] => {
    return activitiesCache.value.get(executionLogId) ?? []
  }

  const isLoadingActivities = (executionLogId: number): boolean => {
    return loadingLogIds.value.has(executionLogId)
  }

  const clearCache = (): void => {
    activitiesCache.value.clear()
  }

  return {
    fetchActivities,
    getActivities,
    isLoadingActivities,
    activitiesCache,
    clearCache,
  }
}
