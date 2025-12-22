import { ref, readonly } from 'vue'
import type {
  ScheduledAttack,
  ImportAttackPlanDto,
  CreateScheduledAttackDto,
  UpdateScheduledAttackDto
} from '@/types/scheduled-attacks'
import { BACKEND_URL } from './backendUrl'

export function useScheduledAttacks() {
  const attacks = ref<ScheduledAttack[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAllAttacks = async (serverId?: number): Promise<ScheduledAttack[]> => {
    loading.value = true
    error.value = null

    try {
      const url = serverId
        ? `${BACKEND_URL}/api/scheduled-attacks?serverId=${serverId}`
        : `${BACKEND_URL}/api/scheduled-attacks`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ScheduledAttack[] = await response.json()
      // Convert date strings to Date objects
      attacks.value = data.map((attack) => ({
        ...attack,
        sendTimeFrom: new Date(attack.sendTimeFrom),
        sendTimeTo: new Date(attack.sendTimeTo),
        createdAt: new Date(attack.createdAt),
        updatedAt: new Date(attack.updatedAt),
        executedAt: attack.executedAt ? new Date(attack.executedAt) : undefined,
      }))

      return attacks.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania ataków'
      error.value = errorMessage
      console.error('Error fetching scheduled attacks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAttacksByServer = async (serverId: number): Promise<ScheduledAttack[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks/server/${serverId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ScheduledAttack[] = await response.json()
      // Convert date strings to Date objects
      attacks.value = data.map((attack) => ({
        ...attack,
        sendTimeFrom: new Date(attack.sendTimeFrom),
        sendTimeTo: new Date(attack.sendTimeTo),
        createdAt: new Date(attack.createdAt),
        updatedAt: new Date(attack.updatedAt),
        executedAt: attack.executedAt ? new Date(attack.executedAt) : undefined,
      }))

      return attacks.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania ataków'
      error.value = errorMessage
      console.error('Error fetching scheduled attacks by server:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAttackById = async (id: number): Promise<ScheduledAttack> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ScheduledAttack = await response.json()
      // Convert date strings to Date objects
      const attack: ScheduledAttack = {
        ...data,
        sendTimeFrom: new Date(data.sendTimeFrom),
        sendTimeTo: new Date(data.sendTimeTo),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
      }

      return attack
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania ataku'
      error.value = errorMessage
      console.error('Error fetching scheduled attack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const importAttackPlan = async (
    serverId: number,
    rawPlan: string,
    skipDuplicates: boolean = true
  ): Promise<ScheduledAttack[]> => {
    loading.value = true
    error.value = null

    try {
      const dto: ImportAttackPlanDto = {
        serverId,
        rawPlan,
        skipDuplicates,
      }

      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: ScheduledAttack[] = await response.json()
      // Convert date strings to Date objects
      const importedAttacks = data.map((attack) => ({
        ...attack,
        sendTimeFrom: new Date(attack.sendTimeFrom),
        sendTimeTo: new Date(attack.sendTimeTo),
        createdAt: new Date(attack.createdAt),
        updatedAt: new Date(attack.updatedAt),
        executedAt: attack.executedAt ? new Date(attack.executedAt) : undefined,
      }))

      // Refresh attacks list
      await getAllAttacks(serverId)

      return importedAttacks
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas importu planu'
      error.value = errorMessage
      console.error('Error importing attack plan:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAttack = async (createDto: CreateScheduledAttackDto): Promise<ScheduledAttack> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createDto),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: ScheduledAttack = await response.json()
      // Convert date strings to Date objects
      const attack: ScheduledAttack = {
        ...data,
        sendTimeFrom: new Date(data.sendTimeFrom),
        sendTimeTo: new Date(data.sendTimeTo),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
      }

      // Refresh attacks list
      await getAllAttacks(createDto.serverId)

      return attack
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas tworzenia ataku'
      error.value = errorMessage
      console.error('Error creating scheduled attack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAttack = async (id: number, updateDto: UpdateScheduledAttackDto): Promise<ScheduledAttack> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDto),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: ScheduledAttack = await response.json()
      // Convert date strings to Date objects
      const attack: ScheduledAttack = {
        ...data,
        sendTimeFrom: new Date(data.sendTimeFrom),
        sendTimeTo: new Date(data.sendTimeTo),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
      }

      // Refresh attacks list
      const serverId = updateDto.serverId || attacks.value.find((a) => a.id === id)?.serverId
      if (serverId) {
        await getAllAttacks(serverId)
      } else {
        await getAllAttacks()
      }

      return attack
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas aktualizacji ataku'
      error.value = errorMessage
      console.error('Error updating scheduled attack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAttack = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const attack = attacks.value.find((a) => a.id === id)
      const serverId = attack?.serverId

      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Refresh attacks list
      if (serverId) {
        await getAllAttacks(serverId)
      } else {
        await getAllAttacks()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania ataku'
      error.value = errorMessage
      console.error('Error deleting scheduled attack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const scheduleAllAttacks = async (serverId: number): Promise<{ scheduledCount: number; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks/server/${serverId}/schedule`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: { scheduledCount: number; message: string } = await response.json()

      // Refresh attacks list
      await getAllAttacks(serverId)

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas harmonogramowania'
      error.value = errorMessage
      console.error('Error scheduling attacks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const executeAttackNow = async (id: number): Promise<ScheduledAttack> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/scheduled-attacks/${id}/execute-now`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: ScheduledAttack = await response.json()
      // Convert date strings to Date objects
      const attack: ScheduledAttack = {
        ...data,
        sendTimeFrom: new Date(data.sendTimeFrom),
        sendTimeTo: new Date(data.sendTimeTo),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
      }

      // Refresh attacks list
      await getAllAttacks(attack.serverId)

      return attack
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas wykonywania ataku'
      error.value = errorMessage
      console.error('Error executing attack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAllAttacks = async (serverId?: number): Promise<number> => {
    loading.value = true
    error.value = null

    try {
      const url = serverId
        ? `${BACKEND_URL}/api/scheduled-attacks?serverId=${serverId}`
        : `${BACKEND_URL}/api/scheduled-attacks`

      const response = await fetch(url, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: { deletedCount: number; message: string } = await response.json()

      // Refresh attacks list
      if (serverId) {
        await getAllAttacks(serverId)
      } else {
        await getAllAttacks()
      }

      return data.deletedCount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania ataków'
      error.value = errorMessage
      console.error('Error deleting all attacks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    attacks: readonly(attacks),
    loading: readonly(loading),
    error: readonly(error),
    getAllAttacks,
    getAttacksByServer,
    getAttackById,
    importAttackPlan,
    createAttack,
    updateAttack,
    deleteAttack,
    deleteAllAttacks,
    scheduleAllAttacks,
    executeAttackNow,
    clearError,
  }
}
