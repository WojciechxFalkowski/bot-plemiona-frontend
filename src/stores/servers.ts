import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Server, CreateServerDto, UpdateServerDto, UpdateServerCookiesDto } from '@/types/servers'
import { BACKEND_URL } from '@/composables/backendUrl'

/**
 * Servers store responsible for managing Tribal Wars servers collection and selection.
 */
export const useServersStore = defineStore('servers', () => {
  const servers = ref<Server[]>([])
  const selectedServer = ref<Server | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const activeServers = computed<Server[]>(() => servers.value.filter(server => server.isActive))

  const sortedServers = computed<Server[]>(() => {
    return [...servers.value].sort((a, b) => a.serverName.localeCompare(b.serverName))
  })

  const setSelectedServer = (server: Server | null): void => {
    selectedServer.value = server
  }

  const clearError = (): void => {
    error.value = null
  }

  const fetchServers = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data: Server[] = await response.json()
      servers.value = data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania serwerów'
      error.value = errorMessage
      console.error('Error fetching servers:', err)
    } finally {
      loading.value = false
    }
  }

  const getServer = async (id: number): Promise<Server | null> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers/${id}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (err) {
      console.error('Error fetching server:', err)
      return null
    }
  }

  const getServerByCode = async (serverCode: string): Promise<Server | null> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers/code/${serverCode}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (err) {
      console.error('Error fetching server by code:', err)
      return null
    }
  }

  const createServer = async (serverData: CreateServerDto): Promise<Server> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const newServer: Server = await response.json()
      servers.value.push(newServer)
      return newServer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas tworzenia serwera'
      error.value = errorMessage
      console.error('Error creating server:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateServer = async (id: number, updateData: UpdateServerDto): Promise<Server> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const updatedServer: Server = await response.json()
      const index = servers.value.findIndex(server => server.id === id)
      if (index !== -1) servers.value[index] = updatedServer
      if (selectedServer.value?.id === id) selectedServer.value = updatedServer
      return updatedServer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas aktualizacji serwera'
      error.value = errorMessage
      console.error('Error updating server:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteServer = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      servers.value = servers.value.filter(server => server.id !== id)
      if (selectedServer.value?.id === id) selectedServer.value = null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania serwera'
      error.value = errorMessage
      console.error('Error deleting server:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateServerCookies = async (id: number, cookiesData: UpdateServerCookiesDto): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers/${id}/cookies`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cookiesData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      await fetchServers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas aktualizacji cookies serwera'
      error.value = errorMessage
      console.error('Error updating server cookies:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteServerCookies = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${BACKEND_URL}/api/servers/${id}/cookies`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      await fetchServers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania cookies serwera'
      error.value = errorMessage
      console.error('Error deleting server cookies:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshServers = async (): Promise<void> => {
    await fetchServers()
  }

  return {
    servers: readonly(servers),
    selectedServer: readonly(selectedServer),
    activeServers,
    sortedServers,
    loading: readonly(loading),
    error: readonly(error),
    fetchServers,
    getServer,
    getServerByCode,
    createServer,
    updateServer,
    deleteServer,
    updateServerCookies,
    deleteServerCookies,
    refreshServers,
    clearError,
    setSelectedServer,
  }
})


