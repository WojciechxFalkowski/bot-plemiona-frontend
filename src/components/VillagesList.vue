<template>
    <div class="villages-container">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Lista wiosek</h2>
            </div>
            <button @click="refreshData" :disabled="loading"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
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
                    class="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
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
        <div v-else class="bg-white shadow rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nazwa
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Współrzędne
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Auto Build
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Auto Scavenging
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ostatnia aktualizacja
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="village in villages" :key="village.id" class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ village.name }}</div>
                                <div class="text-sm text-gray-500">ID: {{ village.id }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900 font-mono">{{ village.coordinates }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button @click="toggleBuilding(village.name)" :disabled="loading" :class="[
                                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 border-2',
                                    'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
                                    village.isAutoBuildEnabled
                                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                        : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                ]"
                                    :title="`Kliknij aby ${village.isAutoBuildEnabled ? 'wyłączyć' : 'włączyć'} auto-building`">
                                    {{ village.isAutoBuildEnabled ? 'Włączone' : 'Wyłączone' }}
                                </button>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button @click="toggleScavenging(village.name)" :disabled="loading" :class="[
                                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 border-2',
                                    'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
                                    village.isAutoScavengingEnabled
                                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                        : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                ]"
                                    :title="`Kliknij aby ${village.isAutoScavengingEnabled ? 'wyłączyć' : 'włączyć'} auto-scavenging`">
                                    {{ village.isAutoScavengingEnabled ? 'Włączone' : 'Wyłączone' }}
                                </button>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatDate(village.updatedAt) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useVillages } from '@/composables/useVillages'

interface Props {
    autoRefresh?: boolean
    refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
    autoRefresh: false,
    refreshInterval: 30000 // 30 seconds
})

const {
    villages,
    loading,
    error,
    totalCount,
    fetchVillages,
    refreshVillages,
    toggleAutoScavenging,
    toggleAutoBuilding
} = useVillages()

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
    await refreshVillages()
}

const toggleScavenging = async (villageName: string) => {
    try {
        await toggleAutoScavenging(villageName)
    } catch (err) {
        // Error is already handled in the composable with snackbar
        console.error('Failed to toggle auto-scavenging:', err)
    }
}

const toggleBuilding = async (villageName: string) => {
    try {
        await toggleAutoBuilding(villageName)
    } catch (err) {
        // Error is already handled in the composable with snackbar
        console.error('Failed to toggle auto-building:', err)
    }
}

onMounted(async () => {
    await fetchVillages()

    // Setup auto-refresh if enabled
    if (props.autoRefresh) {
        setInterval(refreshData, props.refreshInterval)
    }
})
</script>

<style></style>