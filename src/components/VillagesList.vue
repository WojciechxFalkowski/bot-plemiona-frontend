<template>
  <div class="villages-container">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Lista wiosek</h2>
      </div>

      <div class="flex gap-2">
        <UButton icon="i-lucide-refresh-cw" label="Manualne odświeżenie" :loading="manualRefreshLoading" color="secondary"
          variant="ghost" @click="manualRefresh" class="cursor-pointer" />
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
    <VillagesTable
      v-else
      :villages="villages"
      :loading="loading"
      :server-id="props.serverId"
      @add-village="handleAddVillage"
      @delete-village="handleDeleteVillage"
      @toggle-auto-scavenging="toggleScavenging"
      @toggle-auto-building="toggleBuilding"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useVillages } from '@/composables/useVillages'
import { useSnackbar } from 'vue3-snackbar'
import { useAuthStore } from '@/stores/auth'
import { BACKEND_URL } from '@/composables/backendUrl'
import VillagesTable from './VillagesTable.vue'

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

  manualRefreshLoading.value = true

  try {
    // Trigger manual refresh on backend
    await fetch(`${BACKEND_URL}/api/villages/${props.serverId}/refresh`, {
      method: 'POST',
    })
    snackbar.add({
      type: 'success',
      text: 'Rozpoczęto ręczne odświeżanie danych wiosek'
    })
    // Refresh the villages list using the composable function which properly manages loading state
    await refreshVillages(props.serverId)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    snackbar.add({
      type: 'error',
      text: `Błąd podczas ręcznego odświeżania: ${errorMessage}`
    })
  } finally {
    manualRefreshLoading.value = false
  }
}

const manualRefreshLoading = ref(false)

const handleAddVillage = async (village: { id: string; name: string; coordinates: string }) => {
  await addVillage(village)
}



const handleDeleteVillage = async (id: string) => {
  await deleteVillage(id, props.serverId)
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
