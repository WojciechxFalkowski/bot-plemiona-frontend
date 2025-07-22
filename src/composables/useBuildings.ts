import { ref, computed } from 'vue'
import type { Building, BuildingsResponse, AddBuildingToQueueRequest, QueueItem } from '@/types/buildings'
import { BACKEND_URL } from './backendUrl'

export const useBuildings = () => {
  const buildings = ref<Building[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedBuildings = computed(() => {
    return [...buildings.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const fetchBuildings = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/buildings`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: BuildingsResponse = await response.json()
      buildings.value = data.buildings

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania budynków'
      error.value = errorMessage
      console.error('Error fetching buildings:', err)
    } finally {
      loading.value = false
    }
  }

  const getBuildingByScreen = (screen: string): Building | undefined => {
    return buildings.value.find(building => building.screen === screen)
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

  return {
    // State
    buildings: sortedBuildings,
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    fetchBuildings,
    getBuildingByScreen,
    addBuildingToQueue
  }
}
