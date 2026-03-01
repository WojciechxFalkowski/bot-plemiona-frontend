<script lang="ts" setup>
import { onMounted, computed, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCrawlerExecutionLogs } from '@/composables/useCrawlerExecutionLogs'
import { useCrawlerActivityLogs } from '@/composables/useCrawlerActivityLogs'
import { useServersStore } from '@/stores/servers'
import type { ExecutionStatus, OperationTitle } from '@/types/crawler-execution-logs'
import type { CrawlerActivityEventType } from '@/composables/useCrawlerActivityLogs'

declare const useToast: () => any

const route = useRoute()
const toast = useToast()
const serversStore = useServersStore()
const expandedLogId = ref<number | null>(null)

const { fetchActivities, getActivities, isLoadingActivities } = useCrawlerActivityLogs()

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
const triggeredManuallyFilter = computed(() => {
  const v = filters.value.triggeredManually
  if (v === true) return 'manual'
  if (v === false) return 'scheduler'
  return 'all'
})
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
  { label: 'Army Training', value: 'Army Training' },
  { label: 'TW Database', value: 'TW Database' }
]

const getTitleIcon = (title: OperationTitle): string => {
  const iconMap: Record<OperationTitle, string> = {
    'Construction Queue': 'i-lucide-hammer',
    'Scavenging': 'i-lucide-package-search',
    'Mini Attacks': 'i-lucide-sword',
    'Player Village Attacks': 'i-lucide-target',
    'Army Training': 'i-lucide-dumbbell',
    'TW Database': 'i-lucide-database'
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

const triggerSourceOptions = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Ręczne', value: 'manual' },
  { label: 'Harmonogram', value: 'scheduler' }
]

const handleTriggerSourceChange = async (value: string) => {
  const triggeredManually =
    value === 'all' ? undefined : value === 'manual' ? true : false
  await updateFilters({ triggeredManually, page: 1 })
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

const handleToggleActivities = async (logId: number) => {
  if (expandedLogId.value === logId) {
    expandedLogId.value = null
    return
  }
  expandedLogId.value = logId
  await fetchActivities(logId)
}

const getEventTypeBadgeColor = (eventType: CrawlerActivityEventType): string => {
  const colorMap: Record<CrawlerActivityEventType, string> = {
    session_expired: 'warning',
    success: 'success',
    error: 'error',
    info: 'info'
  }
  return colorMap[eventType] ?? 'neutral'
}

const getEventTypeLabel = (eventType: CrawlerActivityEventType): string => {
  const labelMap: Record<CrawlerActivityEventType, string> = {
    session_expired: 'Sesja wygasła',
    success: 'Sukces',
    error: 'Błąd',
    info: 'Info'
  }
  return labelMap[eventType] ?? eventType
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

      <div class="flex flex-wrap items-end gap-2">
        <UFormField label="Status" class="shrink-0 min-w-[6.5rem] sm:min-w-[7rem]">
          <USelect
            :model-value="statusFilter"
            :items="statusOptions"
            value-key="value"
            size="sm"
            @update:model-value="handleStatusChange"
          />
        </UFormField>

        <UFormField label="Typ operacji" class="shrink-0 min-w-[10rem] sm:min-w-[11rem]">
          <USelect
            :model-value="titleFilter"
            :items="titleOptions"
            value-key="value"
            size="sm"
            @update:model-value="handleTitleChange"
          />
        </UFormField>

        <UFormField label="Źródło" class="shrink-0 min-w-[6.5rem] sm:min-w-[7rem]">
          <USelect
            :model-value="triggeredManuallyFilter"
            :items="triggerSourceOptions"
            value-key="value"
            size="sm"
            @update:model-value="handleTriggerSourceChange"
          />
        </UFormField>

        <UFormField label="Data od" class="shrink-0 min-w-[8rem]">
          <UInput
            :model-value="startDateFilter"
            type="date"
            size="sm"
            @update:model-value="handleStartDateChange"
          />
        </UFormField>

        <UFormField label="Data do" class="shrink-0 min-w-[8rem]">
          <UInput
            :model-value="endDateFilter"
            type="date"
            size="sm"
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
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <UIcon :name="getTitleIcon(log.title as OperationTitle)" class="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 class="text-base font-semibold text-gray-900 dark:text-white break-words">{{ log.title }}</h3>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <UBadge
                  v-if="log.description === 'Uruchomienie ręczne'"
                  color="primary"
                  label="Ręczne"
                  size="xs"
                  variant="soft"
                />
                <UBadge
                  :color="log.status === 'success' ? 'success' : 'error'"
                  :label="log.status === 'success' ? 'Sukces' : 'Błąd'"
                  size="xs"
                  variant="soft"
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
              <span class="shrink-0 break-words">
                <span class="text-gray-600 dark:text-gray-400">Serwer:</span>
                <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ getServerName(log.serverId) }}</span>
              </span>
              <span v-if="log.villageId" class="shrink-0 break-words">
                <span class="text-gray-600 dark:text-gray-400">Wioska:</span>
                <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ log.villageId }}</span>
              </span>
              <span class="shrink-0 break-words">
                <span class="text-gray-600 dark:text-gray-400">Rozpoczęto:</span>
                <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ formatDateTime(log.startedAt) }}</span>
              </span>
              <span class="shrink-0 break-words">
                <span class="text-gray-600 dark:text-gray-400">Zakończono:</span>
                <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ formatDateTime(log.endedAt) }}</span>
              </span>
              <span class="shrink-0">
                <span class="text-gray-600 dark:text-gray-400">Czas:</span>
                <span class="ml-1 font-medium text-primary">{{ formatDuration(log.duration) }}</span>
              </span>
            </div>

            <div v-if="log.description" class="mt-2 py-1.5 px-2 bg-gray-50 dark:bg-gray-800 rounded text-xs sm:text-sm">
              <span class="text-gray-700 dark:text-gray-300 break-words">
                <span class="text-gray-600 dark:text-gray-400">Opis:</span> {{ log.description }}
              </span>
            </div>

            <!-- Expandable activities section -->
            <div class="mt-3 sm:mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
              <button
                type="button"
                class="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                :aria-expanded="expandedLogId === log.id"
                :aria-label="expandedLogId === log.id ? 'Zwiń zdarzenia' : 'Pokaż zdarzenia'"
                @click="handleToggleActivities(log.id)"
                @keydown.enter="handleToggleActivities(log.id)"
              >
                <UIcon
                  :name="expandedLogId === log.id ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                  class="w-4 h-4 transition-transform"
                  aria-hidden="true"
                />
                Zdarzenia
              </button>

              <div
                v-if="expandedLogId === log.id"
                class="mt-3 space-y-2"
              >
                <div
                  v-if="isLoadingActivities(log.id)"
                  class="flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400"
                >
                  <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" aria-hidden="true" />
                  Ładowanie zdarzeń...
                </div>

                <div
                  v-else-if="getActivities(log.id).length === 0"
                  class="py-4 text-sm text-gray-500 dark:text-gray-400"
                >
                  Brak zdarzeń dla tego wykonania
                </div>

                <div
                  v-else
                  class="space-y-2"
                >
                  <div
                    v-for="activity in getActivities(log.id)"
                    :key="activity.id"
                    class="flex flex-col sm:flex-row sm:items-start gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs sm:text-sm"
                  >
                    <span class="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {{ formatDateTime(activity.createdAt) }}
                    </span>
                    <UBadge
                      :color="getEventTypeBadgeColor(activity.eventType)"
                      :label="getEventTypeLabel(activity.eventType)"
                      size="xs"
                      variant="soft"
                      class="flex-shrink-0 w-fit"
                    />
                    <span class="text-gray-700 dark:text-gray-300 break-words flex-1">
                      {{ activity.message }}
                    </span>
                  </div>
                </div>
              </div>
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

