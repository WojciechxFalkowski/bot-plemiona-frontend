import { ref, computed } from 'vue'
import type { Building, BuildingsResponse } from '@/types/buildings'
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

  return {
    // State
    buildings: sortedBuildings,
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    fetchBuildings,
    getBuildingByScreen
  }
}
