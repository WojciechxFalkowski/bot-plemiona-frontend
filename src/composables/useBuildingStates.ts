import { ref, computed } from 'vue'
import type { VillageBuildingStatesResponse, AddBuildingToQueueRequest, AddBuildingToQueueFromCacheResponse } from '@/types/buildings'
import { BACKEND_URL } from './backendUrl'
import { useQueue } from './useQueue'

export function useBuildingStates() {
  const buildingStates = ref<VillageBuildingStatesResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { addBuildingToQueue: addToQueue } = useQueue()

  const fetchBuildingStates = async (serverId: number, villageName: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const url = `${BACKEND_URL}/api/village-construction-queue/building-states/${encodeURIComponent(villageName)}?serverId=${serverId}`
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json().catch(() => ({ message: 'Stany budynków nie są dostępne. Spróbuj ponownie za chwilę.' }))
          throw new Error(errorData.message || 'Stany budynków nie są dostępne. Spróbuj ponownie za chwilę.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VillageBuildingStatesResponse = await response.json()
      buildingStates.value = {
        ...data,
        cachedAt: data.cachedAt
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania stanów budynków'
      error.value = errorMessage
      console.error('Error fetching building states:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshBuildingStates = async (serverId: number, villageName: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const url = `${BACKEND_URL}/api/village-construction-queue/building-states/${encodeURIComponent(villageName)}?serverId=${serverId}&forceRefresh=true`
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json().catch(() => ({ message: 'Stany budynków nie są dostępne. Spróbuj ponownie za chwilę.' }))
          throw new Error(errorData.message || 'Stany budynków nie są dostępne. Spróbuj ponownie za chwilę.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VillageBuildingStatesResponse = await response.json()
      buildingStates.value = {
        ...data,
        cachedAt: data.cachedAt
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas odświeżania stanów budynków'
      error.value = errorMessage
      console.error('Error refreshing building states:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addBuildingToQueue = async (request: AddBuildingToQueueRequest): Promise<void> => {
    try {
      await addToQueue(request)
    } catch (err) {
      console.error('Error adding building to queue:', err)
      throw err
    }
  }

  const addBuildingToQueueFromCache = async (request: AddBuildingToQueueRequest): Promise<AddBuildingToQueueFromCacheResponse> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/village-construction-queue/from-cache`, {
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

      const data: AddBuildingToQueueFromCacheResponse = await response.json()

      // Zaktualizuj lokalny stan buildingStates z nową kolejką z bazy
      if (buildingStates.value) {
        buildingStates.value = {
          ...buildingStates.value,
          databaseQueue: data.databaseQueue.map(item => ({
            id: item.id,
            buildingId: item.buildingId,
            buildingName: item.buildingName,
            targetLevel: item.targetLevel,
            status: item.status || 'pending',
            createdAt: typeof item.createdAt === 'string' ? item.createdAt : item.createdAt.toISOString(),
            updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : item.updatedAt.toISOString()
          }))
        }
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas dodawania budynku do kolejki'
      error.value = errorMessage
      console.error('Error adding building to queue from cache:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const clearStates = (): void => {
    buildingStates.value = null
    error.value = null
  }

  return {
    buildingStates: computed(() => buildingStates.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchBuildingStates,
    refreshBuildingStates,
    addBuildingToQueue,
    addBuildingToQueueFromCache,
    clearError,
    clearStates
  }
}

