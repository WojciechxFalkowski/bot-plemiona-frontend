import { ref, computed } from 'vue'
import { BACKEND_URL } from './backendUrl'
import type { AddBuildingToQueueRequest } from '@/types/buildings'

export interface QueueItem {
  id: number
  serverId: number
  villageId: string
  buildingId: string
  buildingName: string
  targetLevel: number
  status: 'pending' | 'processing'
  createdAt: Date
  updatedAt: Date
  village?: {
    id: string
    name: string
    coordinates: string
  }
}

export function useQueue() {
  const queueItems = ref<QueueItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedQueueItems = computed(() => {
    return [...queueItems.value].sort((a, b) => {
      // Sort by status: pending first, then processing
      const statusOrder = { pending: 0, processing: 1 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff

      // Then sort by creation date (oldest first for FIFO)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  })

  const filteredQueueItems = computed(() => {
    return sortedQueueItems.value
  })

  const fetchQueue = async (serverId?: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const url = serverId
        ? `${BACKEND_URL}/api/village-construction-queue/all?serverId=${serverId}`
        : `${BACKEND_URL}/api/village-construction-queue/all`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: QueueItem[] = await response.json()

      queueItems.value = data.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }))

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania kolejki'
      error.value = errorMessage
      console.error('Error fetching queue:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshQueue = async (serverId?: number): Promise<void> => {
    await fetchQueue(serverId)
  }

  const addBuildingToQueue = async (request: AddBuildingToQueueRequest): Promise<QueueItem> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/village-construction-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: QueueItem = await response.json()
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas dodawania budynku do kolejki'
      error.value = errorMessage
      console.error('Error adding building to queue:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeFromQueue = async (queueItemId: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/village-construction-queue/${queueItemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Remove item from local state
      queueItems.value = queueItems.value.filter(item => item.id !== queueItemId)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania z kolejki'
      error.value = errorMessage
      console.error('Error removing from queue:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    queueItems: filteredQueueItems,
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    fetchQueue,
    refreshQueue,
    addBuildingToQueue,
    removeFromQueue,
    clearError
  }
}
