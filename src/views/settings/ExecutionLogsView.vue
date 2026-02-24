<script lang="ts" setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCrawlerExecutionLogs } from '@/composables/useCrawlerExecutionLogs'
import { useServersStore } from '@/stores/servers'
import type { ExecutionStatus, OperationTitle } from '@/types/crawler-execution-logs'

declare const useToast: () => any

const route = useRoute()
const toast = useToast()
const serversStore = useServersStore()

const {
  logs,
  isLoading,
  error,
  total,
  currentPage,
  totalPages,
  fetchLogs,
  refreshLogs,
  updateFilters,
  formatDuration,
  parseQueryParams
} = useCrawlerExecutionLogs()

const filters = computed(() => parseQueryParams())

const statusFilter = computed(() => filters.value.status || 'all')
const titleFilter = computed(() => filters.value.title || 'all')
const startDateFilter = computed(() => filters.value.startDate || '')
const endDateFilter = computed(() => filters.value.endDate || '')

const statusOptions = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Sukces', value: 'success' },
  { label: 'Błąd', value: 'error' }
]

const titleOptions = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Construction Queue', value: 'Construction Queue' },
  { label: 'Scavenging', value: 'Scavenging' },
  { label: 'Mini Attacks', value: 'Mini Attacks' },
  { label: 'Player Village Attacks', value: 'Player Village Attacks' },
  { label: 'Army Training', value: 'Army Training' }
]

const getTitleIcon = (title: OperationTitle): string => {
  const iconMap: Record<OperationTitle, string> = {
    'Construction Queue': 'i-lucide-hammer',
    'Scavenging': 'i-lucide-package-search',
    'Mini Attacks': 'i-lucide-sword',
    'Player Village Attacks': 'i-lucide-target',
    'Army Training': 'i-lucide-dumbbell'
  }
  return iconMap[title] || 'i-lucide-file-text'
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleStatusChange = async (value: string) => {
  const status = value === 'all' ? undefined : (value as ExecutionStatus)
  await updateFilters({ status, page: 1 })
}

const handleTitleChange = async (value: string) => {
  const title = value === 'all' ? undefined : (value as OperationTitle)
  await updateFilters({ title, page: 1 })
}

const handleStartDateChange = async (value: string) => {
  await updateFilters({ startDate: value || undefined, page: 1 })
}

const handleEndDateChange = async (value: string) => {
  await updateFilters({ endDate: value || undefined, page: 1 })
}

const handlePageChange = async (page: number) => {
  await updateFilters({ page })
}

const handleRefresh = async () => {
  try {
    await refreshLogs()
    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Logi wykonania zostały zaktualizowane',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch (err) {
    toast.add({
      title: 'Błąd odświeżania',
      description: 'Nie udało się zaktualizować logów',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const getServerName = (serverId: number): string => {
  const server = serversStore.servers.find(s => s.id === serverId)
  return server ? `${server.serverName} (${server.serverCode})` : `Serwer ${serverId}`
}

onMounted(async () => {
  if (serversStore.servers.length === 0) {
    await serversStore.fetchServers()
  }
  await fetchLogs()
})

watch(() => route.query, async () => {
  await fetchLogs()
}, { deep: true })
</script>

<template>
  <div class="space-y-4 sm:space-y-6 px-2 sm:px-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex-1">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Logi wykonania</h1>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Przeglądaj historię wykonania operacji crawlera</p>
      </div>

      <UButton
        icon="i-lucide-refresh-cw"
        :loading="isLoading"
        color="secondary"
        variant="outline"
        size="sm"
        class="w-full sm:w-auto cursor-pointer dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        @click="handleRefresh"
      >
        <span class="hidden sm:inline">Odśwież</span>
      </UButton>
    </div>

    <!-- Filters Card -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-filter" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Filtry</span>
        </div>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <UFormField label="Status">
          <USelect
            :model-value="statusFilter"
            :items="statusOptions"
            value-key="value"
            @update:model-value="handleStatusChange"
          />
        </UFormField>

        <UFormField label="Typ operacji">
          <USelect
            :model-value="titleFilter"
            :items="titleOptions"
            value-key="value"
            @update:model-value="handleTitleChange"
          />
        </UFormField>

        <UFormField label="Data od">
          <UInput
            :model-value="startDateFilter"
            type="date"
            @update:model-value="handleStartDateChange"
          />
        </UFormField>

        <UFormField label="Data do">
          <UInput
            :model-value="endDateFilter"
            type="date"
            @update:model-value="handleEndDateChange"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Error Alert -->
    <UAlert v-if="error" icon="i-lucide-alert-circle" color="red" title="Błąd" :description="error" />

    <!-- Loading State -->
    <div v-if="isLoading && logs.length === 0" class="flex items-center justify-center py-8 sm:py-12">
      <UIcon name="i-lucide-loader-circle" class="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400 dark:text-gray-500" />
      <span class="ml-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Ładowanie logów...</span>
    </div>

    <!-- Empty State -->
    <UCard v-else-if="!isLoading && logs.length === 0">
      <div class="text-center py-8 sm:py-12 px-4">
        <UIcon name="i-lucide-file-x" class="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
        <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Brak logów</h3>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">Nie znaleziono logów wykonania dla wybranych filtrów.</p>
      </div>
    </UCard>

    <!-- Logs List -->
    <div v-else class="space-y-3 sm:space-y-4">
      <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-0">
        Znaleziono <strong class="text-gray-900 dark:text-white">{{ total }}</strong> {{ total === 1 ? 'log' : total < 5 ? 'logi' : 'logów' }}
      </div>

      <UCard v-for="log in logs" :key="log.id" class="hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between w-full">
          <div class="flex-1 w-full min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <UIcon :name="getTitleIcon(log.title as OperationTitle)" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">{{ log.title }}</h3>
              </div>
              <UBadge
                :color="log.status === 'success' ? 'green' : 'red'"
                :label="log.status === 'success' ? 'Sukces' : 'Błąd'"
                class="flex-shrink-0 self-start sm:self-center"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div class="break-words">
                <span class="text-gray-600 dark:text-gray-400">Serwer:</span>
                <span class="ml-1 sm:ml-2 font-medium text-gray-900 dark:text-white break-words">{{ getServerName(log.serverId) }}</span>
              </div>

              <div v-if="log.villageId" class="break-words">
                <span class="text-gray-600 dark:text-gray-400">Wioska:</span>
                <span class="ml-1 sm:ml-2 font-medium text-gray-900 dark:text-white break-words">{{ log.villageId }}</span>
              </div>

              <div class="break-words">
                <span class="text-gray-600 dark:text-gray-400">Rozpoczęto:</span>
                <span class="ml-1 sm:ml-2 font-medium text-gray-900 dark:text-white break-words">{{ formatDateTime(log.startedAt) }}</span>
              </div>

              <div class="break-words">
                <span class="text-gray-600 dark:text-gray-400">Zakończono:</span>
                <span class="ml-1 sm:ml-2 font-medium text-gray-900 dark:text-white break-words">{{ formatDateTime(log.endedAt) }}</span>
              </div>

              <div class="sm:col-span-2">
                <span class="text-gray-600 dark:text-gray-400">Czas trwania:</span>
                <span class="ml-1 sm:ml-2 font-medium text-primary">{{ formatDuration(log.duration) }}</span>
              </div>
            </div>

            <div v-if="log.description" class="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                <span class="font-medium">Opis:</span> {{ log.description }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center pt-4 sm:pt-6 px-2 sm:px-0">
        <UPagination
          :page="currentPage"
          :total="total"
          :items-per-page="50"
          size="sm"
          class="overflow-x-auto"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>

