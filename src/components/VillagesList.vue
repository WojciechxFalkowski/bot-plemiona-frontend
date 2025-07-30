<template>
    <div class="villages-container">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Lista wiosek</h2>
            </div>

            <div class="flex gap-2">
                <button @click="manualRefresh"
                    class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                        </path>
                    </svg>
                    Manualne odświeżenie
                </button>
                <button @click="refreshData" :disabled="loading"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                        </path>
                    </svg>
                    {{ loading ? 'Odświeżanie...' : 'Odśwież' }}
                </button>
                <button @click="handleVerifyToken"
                    class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors cursor-pointer">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Zweryfikuj token
                </button>
                <button @click="handleFetchProfile"
                    class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Pobierz profil
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && villages.length === 0" class="flex justify-center items-center py-12">
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p class="mt-4 text-gray-600">Ładowanie wiosek...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error && villages.length === 0" class="text-center py-12">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z">
                    </path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-red-800">Błąd podczas ładowania</h3>
                <p class="mt-2 text-red-700">{{ error }}</p>
                <button @click="refreshData"
                    class="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors cursor-pointer">
                    Spróbuj ponownie
                </button>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="villages.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                </path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Brak wiosek</h3>
            <p class="mt-2 text-gray-600">Nie znaleziono żadnych wiosek w systemie.</p>
        </div>

        <!-- Villages Table -->
        <div v-else class="flex flex-col gap-4">
            <div class="flex gap-2 mt-4 mb-4 flex-wrap">
                <input v-model="newVillage.id" placeholder="ID" class="border rounded px-2 py-1" />
                <input v-model="newVillage.name" placeholder="Nazwa" class="border rounded px-2 py-1" />
                <input v-model="newVillage.coordinates" placeholder="Współrzędne" class="border rounded px-2 py-1" />
                <button @click="handleAddVillage" :disabled="loading"
                    class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 cursor-pointer">Dodaj
                    wioskę</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="village in villages" :key="village.id"
                    class="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 relative border border-gray-100">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <div class="flex" v-if="editId !== village.id">
                                <span class="text-lg font-semibold text-gray-900">{{ village.name }}</span>
                                <button @click="startEdit(village)"
                                    class="ml-2 text-blue-600 hover:underline cursor-pointer text-sm"
                                    title="Edytuj"><svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" />
                                    </svg></button>
                            </div>
                            <div v-else>
                                <input v-model="editVillage.name" class="border rounded px-1 py-0.5 w-32" />
                                <button @click="saveEdit(village.id)"
                                    class="ml-2 text-green-600 hover:underline cursor-pointer text-sm"
                                    title="Zapisz"><svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg></button>
                                <button @click="cancelEdit"
                                    class="ml-2 text-gray-600 hover:underline cursor-pointer text-sm"
                                    title="Anuluj"><svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg></button>
                            </div>
                            <div class="text-xs text-gray-400 mt-1">ID: {{ village.id }}</div>
                        </div>
                        <button @click="handleDeleteVillage(village.id)"
                            class="text-red-500 hover:text-red-700 cursor-pointer text-sm p-1 rounded-full transition-colors"
                            title="Usuń"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg></button>
                    </div>
                    <div class="flex flex-col items-center justify-center mb-2">
                        <span v-if="editId !== village.id"
                            class="font-mono text-lg bg-gray-50 rounded px-2 py-1 text-gray-700 tracking-wider">{{
                                village.coordinates }}</span>
                        <input v-else v-model="editVillage.coordinates"
                            class="border rounded px-1 py-0.5 w-24 font-mono text-center" />
                    </div>
                    <div class="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                        <button @click="toggleBuilding(village.name)" :disabled="loading" :class="[
                            'flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded transition-all duration-200 border',
                            'hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                            village.isAutoBuildEnabled
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                        ]" :title="`Kliknij aby ${village.isAutoBuildEnabled ? 'wyłączyć' : 'włączyć'} auto-building`">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 10h4l3 8 4-16 3 8h4" />
                            </svg>
                            {{ village.isAutoBuildEnabled ? 'Auto Build: ON' : 'Auto Build: OFF' }}
                        </button>
                        <button @click="toggleScavenging(village.name)" :disabled="loading" :class="[
                            'flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded transition-all duration-200 border',
                            'hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                            village.isAutoScavengingEnabled
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                        ]"
                            :title="`Kliknij aby ${village.isAutoScavengingEnabled ? 'wyłączyć' : 'włączyć'} auto-scavenging`">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {{ village.isAutoScavengingEnabled ? 'Scavenging: ON' : 'Scavenging: OFF' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useVillages } from '@/composables/useVillages'
import { useSnackbar } from 'vue3-snackbar'
import { useAuthStore } from '@/stores/auth'
import { BACKEND_URL } from '@/composables/backendUrl'

interface Props {
    autoRefresh?: boolean
    refreshInterval?: number
    serverId?: number
}

const props = withDefaults(defineProps<Props>(), {
    autoRefresh: false,
    refreshInterval: 30000, // 30 seconds
    serverId: undefined
})

const {
    villages,
    loading,
    error,
    totalCount,
    fetchVillages,
    refreshVillages,
    toggleAutoScavenging,
    toggleAutoBuilding,
    addVillage,
    updateVillage,
    deleteVillage
} = useVillages()

const snackbar = useSnackbar()
const authStore = useAuthStore()

const formatDate = (date: Date | null): string => {
    if (!date) return 'Nieznana'

    return new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date)
}

const refreshData = async () => {
    await refreshVillages(props.serverId)
}

const toggleScavenging = async (villageName: string) => {
    try {
        await toggleAutoScavenging(villageName, props.serverId)
    } catch (err) {
        // Error is already handled in the composable with snackbar
        console.error('Failed to toggle auto-scavenging:', err)
    }
}

const toggleBuilding = async (villageName: string) => {
    try {
        await toggleAutoBuilding(villageName, props.serverId)
    } catch (err) {
        // Error is already handled in the composable with snackbar
        console.error('Failed to toggle auto-building:', err)
    }
}

const manualRefresh = async () => {
    if (!props.serverId) {
        snackbar.add({
            type: 'error',
            text: 'ServerId jest wymagany do odświeżania danych'
        })
        return
    }

    try {
        await fetch(`${BACKEND_URL}/api/villages/${props.serverId}/refresh`, {
            method: 'POST',
        })
        snackbar.add({
            type: 'success',
            text: 'Rozpoczęto ręczne odświeżanie danych wiosek'
        })
        // Po zakończeniu manualnego odświeżania odśwież listę wiosek
        await refreshData()
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
        snackbar.add({
            type: 'error',
            text: `Błąd podczas ręcznego odświeżania: ${errorMessage}`
        })
    }
}

const handleVerifyToken = async () => {
    try {
        const valid = await authStore.verifyToken()
        snackbar.add({
            type: valid ? 'success' : 'error',
            text: valid ? 'Token jest prawidłowy!' : 'Token jest nieprawidłowy lub nie zalogowano.'
        })
    } catch (err) {
        snackbar.add({
            type: 'error',
            text: 'Błąd podczas weryfikacji tokena'
        })
    }
}

const handleFetchProfile = async () => {
    try {
        const profile = await authStore.fetchUserProfile()
        console.log('User profile:', profile)
    } catch (err) {
        console.error('Błąd podczas pobierania profilu użytkownika', err)
    }
}

const newVillage = ref({ id: '', name: '', coordinates: '' })
const editId = ref<string | null>(null)
const editVillage = ref({ name: '', coordinates: '' })

const handleAddVillage = async () => {
    if (!newVillage.value.id || !newVillage.value.name || !newVillage.value.coordinates) return
    await addVillage({ ...newVillage.value })
    newVillage.value = { id: '', name: '', coordinates: '' }
}

const startEdit = (village: any) => {
    editId.value = village.id
    editVillage.value = { name: village.name, coordinates: village.coordinates }
}

const saveEdit = async (id: string) => {
    await updateVillage(id, { ...editVillage.value })
    editId.value = null
}

const cancelEdit = () => {
    editId.value = null
}

const handleDeleteVillage = async (id: string) => {
    await deleteVillage(id)
}

onMounted(async () => {
  await fetchVillages(props.serverId)

    // Setup auto-refresh if enabled
    if (props.autoRefresh) {
        setInterval(() => refreshData(), props.refreshInterval)
    }
})

// Watch for serverId changes and refetch villages
watch(() => props.serverId, async (newServerId) => {
    await fetchVillages(newServerId)
})
</script>

<style></style>
