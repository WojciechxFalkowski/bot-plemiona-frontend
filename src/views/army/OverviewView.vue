<template>
  <div class="army-overview-view space-y-6">
    <!-- Server Selection Message -->
    <div v-if="!serverId" class="no-server-selected">
      <UCard>
        <div class="text-center py-12">
          <UIcon name="i-lucide-server" class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Wybierz serwer
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Aby pobrać dane o jednostkach wojskowych, wybierz serwer z menu po lewej stronie.
          </p>
        </div>
      </UCard>
    </div>

    <!-- Server Selected Content -->
    <div v-else class="space-y-6">
      <!-- Header with Action Buttons -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Przegląd wojska</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Stan jednostek wojskowych we wszystkich wioskach
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <UButton
            icon="i-lucide-download"
            color="primary"
            :loading="loading"
            :disabled="loading"
            @click="handleFetchData"
            class="cursor-pointer md:flex-none"
          >
            <span class="hidden sm:inline">Pobierz stany wojsk</span>
            <span class="sm:hidden">Pobierz</span>
          </UButton>
          <UButton
            icon="i-lucide-refresh-cw"
            variant="outline"
            :loading="loading"
            :disabled="loading"
            @click="handleRefreshData"
            class="cursor-pointer md:flex-none"
          >
            <span class="hidden sm:inline">Odśwież i pobierz</span>
            <span class="sm:hidden">Odśwież</span>
          </UButton>
          <UButton
            icon="i-lucide-send"
            color="success"
            :disabled="villageUnits.length === 0"
            @click="isSendSupportModalOpen = true"
            class="cursor-pointer md:flex-none"
          >
            <span class="hidden sm:inline">Wyślij wsparcie</span>
            <span class="sm:hidden">Wsparcie</span>
          </UButton>
        </div>
      </div>

      <!-- Cache Validity Info -->
      <div
        v-if="villageUnits.length > 0 && isCacheValid && cachedAt"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs"
      >
        <UIcon name="i-lucide-check-circle" class="w-4 h-4 flex-shrink-0" />
        <span class="hidden sm:inline whitespace-nowrap">
          Dane aktualne przez najbliższe 5 minut. Pobrano: {{ formatDate(cachedAt) }}
        </span>
        <span class="sm:hidden whitespace-nowrap">
          Dane aktualne. Pobrano: {{ formatDate(cachedAt) }}
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="loading && villageUnits.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin mx-auto" />
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Pobieranie danych o jednostkach...</p>
      </div>

      <!-- Data Display -->
      <div v-else-if="villageUnits.length > 0" class="space-y-4">
        <!-- Table View - visible on all screen sizes -->
        <ArmyOverviewTable :villages="villageUnits" />
      </div>

      <!-- Empty State (no data fetched yet) -->
      <div v-else-if="!loading && villageUnits.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-shield" class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Brak danych</h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Kliknij przycisk "Pobierz stany wojsk" aby pobrać dane o jednostkach we wszystkich wioskach.
        </p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
        <div class="flex items-start">
          <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 class="text-sm font-medium text-red-800 dark:text-red-400">Błąd pobierania danych</h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Support Modal -->
    <SendSupportModal
      :is-open="isSendSupportModalOpen"
      :villages="villageUnits"
      :server-id="serverId"
      @close="isSendSupportModalOpen = false"
      @success="handleSupportSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArmyOverview } from '@/composables/useArmyOverview'
import ArmyOverviewTable from '@/components/army/ArmyOverviewTable.vue'
import SendSupportModal from '@/components/army/SendSupportModal.vue'

const route = useRoute()

// Modal visibility state
const isSendSupportModalOpen = ref(false)

const serverId = computed(() => {
	const id = route.query.serverId as string | undefined
	return id ? parseInt(id) : undefined
})

const {
	villageUnits,
	loading,
	error,
	cachedAt,
	isCacheValid,
	fetchVillageUnits,
	refreshVillageUnits,
	startAutoRefresh,
	stopAutoRefresh,
	clearCache
} = useArmyOverview()

const handleFetchData = async () => {
	if (!serverId.value) {
		return
	}

	await fetchVillageUnits(serverId.value, false)
	
	// Start auto-refresh after first fetch
	if (villageUnits.value.length > 0) {
		startAutoRefresh(serverId.value)
	}
}

const handleRefreshData = async () => {
	if (!serverId.value) {
		return
	}

	await refreshVillageUnits(serverId.value)
	
	// Restart auto-refresh after manual refresh
	if (villageUnits.value.length > 0) {
		startAutoRefresh(serverId.value)
	}
}

const handleSupportSent = () => {
	// Support is now queued asynchronously - do NOT auto-refresh here
	// as it would create a second browser session and invalidate the support session.
	// User should manually refresh after the support task completes.
	// TODO: Consider polling task status and refreshing only after completion
}

const formatDate = (date: Date | null): string => {
	if (!date) return ''
	const d = new Date(date)
	return d.toLocaleString('pl-PL', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})
}

// Watch for server changes
watch(serverId, (newServerId, oldServerId) => {
	if (oldServerId && newServerId !== oldServerId) {
		stopAutoRefresh()
		clearCache()
	}
}, { immediate: false })

// Cleanup on unmount
onUnmounted(() => {
	stopAutoRefresh()
})
</script>

<style scoped>
.army-overview-view {
	/* Additional styles if needed */
}
</style>

