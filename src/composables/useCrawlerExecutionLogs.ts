import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type {
  CrawlerExecutionLog,
  ExecutionLogsResponse,
  ExecutionLogFilters,
  ExecutionStatus,
  OperationTitle
} from '@/types/crawler-execution-logs'
import { BACKEND_URL } from './backendUrl'

declare const useToast: () => any

export function useCrawlerExecutionLogs() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const logs = ref<CrawlerExecutionLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const limit = ref(50)

  const buildQueryParams = (filters: ExecutionLogFilters): string => {
    const params = new URLSearchParams()

    if (filters.serverId !== undefined) {
      params.append('serverId', filters.serverId.toString())
    }
    if (filters.status !== undefined) {
      params.append('status', filters.status)
    }
    if (filters.title !== undefined && filters.title !== '') {
      params.append('title', filters.title)
    }
    if (filters.startDate !== undefined) {
      params.append('startDate', filters.startDate)
    }
    if (filters.endDate !== undefined) {
      params.append('endDate', filters.endDate)
    }
    if (filters.page !== undefined) {
      params.append('page', filters.page.toString())
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString())
    }

    return params.toString()
  }

  const parseQueryParams = (): ExecutionLogFilters => {
    const filters: ExecutionLogFilters = {}

    const serverId = route.query.serverId as string | undefined
    if (serverId) {
      const parsed = parseInt(serverId, 10)
      if (!isNaN(parsed)) {
        filters.serverId = parsed
      }
    }

    const status = route.query.status as string | undefined
    if (status === 'success' || status === 'error') {
      filters.status = status as ExecutionStatus
    }

    const title = route.query.title as string | undefined
    if (title) {
      filters.title = title as OperationTitle
    }

    const startDate = route.query.startDate as string | undefined
    if (startDate) {
      filters.startDate = startDate
    }

    const endDate = route.query.endDate as string | undefined
    if (endDate) {
      filters.endDate = endDate
    }

    const page = route.query.page as string | undefined
    if (page) {
      const parsed = parseInt(page, 10)
      if (!isNaN(parsed) && parsed > 0) {
        filters.page = parsed
        currentPage.value = parsed
      }
    }

    const limitParam = route.query.limit as string | undefined
    if (limitParam) {
      const parsed = parseInt(limitParam, 10)
      if (!isNaN(parsed) && parsed > 0) {
        filters.limit = parsed
        limit.value = parsed
      }
    }

    return filters
  }

  const fetchLogs = async (filters?: ExecutionLogFilters): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const activeFilters = filters || parseQueryParams()
      activeFilters.page = activeFilters.page || currentPage.value
      activeFilters.limit = activeFilters.limit || limit.value

      const queryString = buildQueryParams(activeFilters)
      const url = `${BACKEND_URL}/api/crawler-execution-logs${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ExecutionLogsResponse = await response.json()
      logs.value = data.logs
      total.value = data.total
      currentPage.value = data.page
      limit.value = data.limit

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania logów wykonania'
      error.value = errorMessage
      console.error('Error fetching execution logs:', err)
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się pobrać logów wykonania',
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    } finally {
      isLoading.value = false
    }
  }

  const updateFilters = async (newFilters: Partial<ExecutionLogFilters>): Promise<void> => {
    const currentFilters = parseQueryParams()
    const updatedFilters = { ...currentFilters, ...newFilters }

    if (updatedFilters.page === undefined || updatedFilters.page === 1) {
      updatedFilters.page = 1
    }

    const query: Record<string, string> = {}
    if (updatedFilters.serverId !== undefined) {
      query.serverId = updatedFilters.serverId.toString()
    }
    if (updatedFilters.status !== undefined) {
      query.status = updatedFilters.status
    }
    if (updatedFilters.title !== undefined && updatedFilters.title !== '') {
      query.title = updatedFilters.title
    }
    if (updatedFilters.startDate !== undefined) {
      query.startDate = updatedFilters.startDate
    }
    if (updatedFilters.endDate !== undefined) {
      query.endDate = updatedFilters.endDate
    }
    if (updatedFilters.page !== undefined && updatedFilters.page > 1) {
      query.page = updatedFilters.page.toString()
    }
    if (updatedFilters.limit !== undefined && updatedFilters.limit !== 50) {
      query.limit = updatedFilters.limit.toString()
    }

    await router.replace({ query })
    await fetchLogs(updatedFilters)
  }

  const refreshLogs = async (): Promise<void> => {
    await fetchLogs()
  }

  const formatDuration = (durationMs: number): string => {
    const seconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      const remainingMinutes = minutes % 60
      const remainingSeconds = seconds % 60
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const totalPages = computed(() => {
    return Math.ceil(total.value / limit.value)
  })

  return {
    logs,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    totalPages,
    fetchLogs,
    refreshLogs,
    updateFilters,
    formatDuration,
    parseQueryParams
  }
}

