import { ref, computed } from 'vue'
import type {
  BarbarianVillage,
  CreateAndUpdateBarbarianVillageDto,
  CreateBarbarianVillageFromUrlDto,
} from '@/types/barbarian-villages'
import { BACKEND_URL } from './backendUrl'

export function useBarbarianVillages() {
  const villages = ref<BarbarianVillage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedVillages = computed(() => {
    return [...villages.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const fetchVillages = async (serverId?: number, canAttack?: boolean): Promise<void> => {
    loading.value = true
    error.value = null

    if (!serverId) {
      error.value = 'ServerId is required for fetching barbarian villages'
      loading.value = false
      return
    }

    try {
      let response: Response
      if (typeof canAttack === 'boolean') {
        // Use global endpoint with filter, then narrow to server
        response = await fetch(`${BACKEND_URL}/api/barbarian-villages?canAttack=${canAttack}`)
      } else {
        response = await fetch(`${BACKEND_URL}/api/barbarian-villages/${serverId}`)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: BarbarianVillage[] = await response.json()
      villages.value = typeof canAttack === 'boolean' ? data.filter(v => (v as any).serverId === serverId) : data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania wiosek barbarzynskich'
      error.value = errorMessage
      console.error('Error fetching barbarian villages:', err)
    } finally {
      loading.value = false
    }
  }

  const getVillage = async (target: string, serverId?: number): Promise<BarbarianVillage | null> => {
    if (!serverId) {
      throw new Error('ServerId is required for fetching barbarian village')
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/barbarian-villages/${serverId}/${target}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching barbarian village:', err)
      return null
    }
  }

  const createVillage = async (villageData: CreateAndUpdateBarbarianVillageDto, serverId?: number): Promise<BarbarianVillage> => {
    loading.value = true
    error.value = null

    if (!serverId) {
      error.value = 'ServerId is required for creating barbarian village'
      loading.value = false
      throw new Error('ServerId is required for creating barbarian village')
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/barbarian-villages/${serverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...villageData,
          canAttack: villageData.canAttack ?? true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const newVillage: BarbarianVillage = await response.json()
      villages.value.push(newVillage)

      return newVillage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas tworzenia wioski'
      error.value = errorMessage
      console.error('Error creating barbarian village:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createVillageFromUrl = async (urlData: CreateBarbarianVillageFromUrlDto, serverId?: number): Promise<BarbarianVillage> => {
    loading.value = true
    error.value = null

    if (!serverId) {
      error.value = 'ServerId is required for creating barbarian village from URL'
      loading.value = false
      throw new Error('ServerId is required for creating barbarian village from URL')
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/barbarian-villages/${serverId}/from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(urlData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const newVillage: BarbarianVillage = await response.json()
      villages.value.push(newVillage)

      return newVillage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas tworzenia wioski z URL'
      error.value = errorMessage
      console.error('Error creating barbarian village from URL:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateVillage = async (target: string, updateData: CreateAndUpdateBarbarianVillageDto, serverId?: number): Promise<BarbarianVillage> => {
    loading.value = true
    error.value = null

    if (!serverId) {
      error.value = 'ServerId is required for updating barbarian village'
      loading.value = false
      throw new Error('ServerId is required for updating barbarian village')
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/barbarian-villages/${serverId}/${target}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const updatedVillage: BarbarianVillage = await response.json()

      // Update local state
      const index = villages.value.findIndex(v => v.target === target)
      if (index !== -1) {
        villages.value[index] = updatedVillage
      }

      return updatedVillage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas aktualizacji wioski'
      error.value = errorMessage
      console.error('Error updating barbarian village:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteVillage = async (target: string, serverId?: number): Promise<void> => {
    loading.value = true
    error.value = null

    if (!serverId) {
      error.value = 'ServerId is required for deleting barbarian village'
      loading.value = false
      throw new Error('ServerId is required for deleting barbarian village')
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/barbarian-villages/${serverId}/${target}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Remove from local state
      const index = villages.value.findIndex(v => v.target === target)
      if (index !== -1) {
        villages.value.splice(index, 1)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania wioski'
      error.value = errorMessage
      console.error('Error deleting barbarian village:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshVillages = async (serverId?: number, canAttack?: boolean): Promise<void> => {
    await fetchVillages(serverId, canAttack)
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    villages: sortedVillages,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    totalCount: computed(() => villages.value.length),

    // Actions
    fetchVillages,
    getVillage,
    createVillage,
    createVillageFromUrl,
    updateVillage,
    deleteVillage,
    refreshVillages,
    clearError
  }
}
