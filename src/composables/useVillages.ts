import { ref, computed } from 'vue'
import type { Village, VillageToggleResponse } from '@/types/villages'
import { useSnackbar } from 'vue3-snackbar'
import { BACKEND_URL } from './backendUrl'

export function useVillages() {
    const villages = ref<Village[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const totalCount = ref(0)

    console.log("import.meta.env.VITE_BACKEND_PLEMIONA");
    console.log(import.meta.env.VITE_BACKEND_PLEMIONA);

    const snackbar = useSnackbar()

    const sortedVillages = computed(() => {
        return [...villages.value].sort((a, b) => a.name.localeCompare(b.name))
    })

    const fetchVillages = async (): Promise<void> => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${BACKEND_URL}/api/villages`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: Village[] = await response.json()

            villages.value = data.map((village) => ({
                ...village,
                createdAt: new Date(village.createdAt),
                updatedAt: new Date(village.updatedAt)
            }))

            totalCount.value = data.length

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania wiosek'
            error.value = errorMessage

            // Wyświetl błąd w snackbar
            snackbar.add({
                type: 'error',
                text: `Nie udało się pobrać listy wiosek: ${errorMessage}`
            })

            console.error('Error fetching villages:', err)
        } finally {
            loading.value = false
        }
    }

    const refreshVillages = async (): Promise<void> => {
        await fetchVillages()
    }

    const toggleAutoScavenging = async (villageName: string): Promise<void> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/villages/${villageName}/scavenging`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: VillageToggleResponse = await response.json()

            // Update the village in the local state
            const villageIndex = villages.value.findIndex(v => v.name === villageName)
            if (villageIndex !== -1 && data.isAutoScavengingEnabled !== undefined) {
                villages.value[villageIndex].isAutoScavengingEnabled = data.isAutoScavengingEnabled
                villages.value[villageIndex].updatedAt = new Date()
            }

            // Show success message
            snackbar.add({
                type: 'success',
                text: `Auto-scavenging dla wioski ${villageName} został ${data.isAutoScavengingEnabled ? 'włączony' : 'wyłączony'}`
            })

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas zmiany ustawień'

            // Show error message
            snackbar.add({
                type: 'error',
                text: `Nie udało się zmienić ustawień auto-scavenging: ${errorMessage}`
            })

            console.error('Error toggling auto-scavenging:', err)
            throw err
        }
    }

    const toggleAutoBuilding = async (villageName: string): Promise<void> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/villages/${villageName}/building`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: VillageToggleResponse = await response.json()

            // Update the village in the local state
            const villageIndex = villages.value.findIndex(v => v.name === villageName)
            if (villageIndex !== -1 && data.isAutoBuildEnabled !== undefined) {
                villages.value[villageIndex].isAutoBuildEnabled = data.isAutoBuildEnabled
                villages.value[villageIndex].updatedAt = new Date()
            }

            // Show success message
            snackbar.add({
                type: 'success',
                text: `Auto-building dla wioski ${villageName} został ${data.isAutoBuildEnabled ? 'włączony' : 'wyłączony'}`
            })

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas zmiany ustawień'

            // Show error message
            snackbar.add({
                type: 'error',
                text: `Nie udało się zmienić ustawień auto-building: ${errorMessage}`
            })

            console.error('Error toggling auto-building:', err)
            throw err
        }
    }

    const addVillage = async (village: { id: string; name: string; coordinates: string }) => {
        loading.value = true
        try {
            const response = await fetch(`${BACKEND_URL}/api/villages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(village)
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data: Village = await response.json()
            villages.value.push({
                ...data,
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt)
            })
            snackbar.add({ type: 'success', text: 'Dodano nową wioskę!' })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas dodawania wioski'
            snackbar.add({ type: 'error', text: `Nie udało się dodać wioski: ${errorMessage}` })
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateVillage = async (id: string, update: { name: string; coordinates: string }) => {
        loading.value = true
        try {
            const response = await fetch(`${BACKEND_URL}/api/villages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update)
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data: Village = await response.json()
            const idx = villages.value.findIndex(v => v.id === id)
            if (idx !== -1) {
                villages.value[idx].name = data.name
                villages.value[idx].coordinates = data.coordinates
                villages.value[idx].updatedAt = new Date(data.updatedAt)
            }
            snackbar.add({ type: 'success', text: 'Zaktualizowano wioskę!' })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas aktualizacji wioski'
            snackbar.add({ type: 'error', text: `Nie udało się zaktualizować wioski: ${errorMessage}` })
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteVillage = async (id: string) => {
        loading.value = true
        try {
            const response = await fetch(`${BACKEND_URL}/api/villages/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const idx = villages.value.findIndex(v => v.id === id)
            if (idx !== -1) {
                villages.value.splice(idx, 1)
            }
            snackbar.add({ type: 'success', text: 'Usunięto wioskę!' })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania wioski'
            snackbar.add({ type: 'error', text: `Nie udało się usunąć wioski: ${errorMessage}` })
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        // State
        villages: sortedVillages,
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        totalCount: computed(() => totalCount.value),

        // Actions
        fetchVillages,
        refreshVillages,
        toggleAutoScavenging,
        toggleAutoBuilding,
        addVillage,
        updateVillage,
        deleteVillage
    }
} 