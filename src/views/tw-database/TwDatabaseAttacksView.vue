<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Ataki TW Database</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Lista ataków z planera TW Database dla wybranego serwera
        </p>
      </div>
      <UButton
        v-if="selectedServerId"
        icon="i-lucide-play"
        label="Uruchom teraz"
        :loading="isTriggering"
        color="secondary"
        variant="outline"
        class="shrink-0 cursor-pointer"
        @click="handleTriggerNow"
      />
    </div>

    <div v-if="!selectedServerId" class="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6">
      <p class="text-amber-800 dark:text-amber-200">
        Wybierz serwer z menu po lewej stronie, aby zobaczyć ataki.
      </p>
    </div>

    <template v-else>
      <UCard class="mb-6">
        <template #header>
          <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div class="flex flex-wrap gap-4">
              <div class="min-w-[160px]">
                <UFormField label="Status">
                  <USelect
                    :model-value="statusFilter"
                    :items="statusOptions"
                    value-key="value"
                    placeholder="Wszystkie"
                    @update:model-value="handleStatusChange"
                  />
                </UFormField>
              </div>
            </div>
            <UButton
              icon="i-lucide-refresh-cw"
              label="Odśwież"
              :loading="isLoading"
              color="secondary"
              variant="outline"
              class="cursor-pointer"
              @click="handleRefresh"
            />
          </div>
        </template>
      </UCard>

      <UCard v-if="error">
        <UAlert icon="i-lucide-alert-circle" color="red" :title="error" />
      </UCard>

      <UCard v-else>
        <div v-if="isLoading" class="py-12 text-center text-gray-500">
          Ładowanie ataków...
        </div>
        <div v-else-if="attacks.length === 0" class="py-12 text-center text-gray-500">
          Brak ataków dla wybranego serwera
        </div>
        <UTable v-else :data="tableRows" :columns="columns" :ui="{ separator: 'hidden', table: 'z-0' }" class="w-full">
          <template #status-cell="{ row }">
            <UBadge
              :color="getStatusColor(row.original.status)"
              :label="getStatusLabel(row.original.status)"
              variant="soft"
              size="xs"
            />
          </template>
          <template #lp-cell="{ row }">
            {{ row.original.details?.lp ?? '-' }}
          </template>
          <template #wioskaWysylajaca-cell="{ row }">
            {{ row.original.details?.wioskaWysylajaca ?? '-' }}
          </template>
          <template #wioskaDocelowa-cell="{ row }">
            {{ row.original.details?.wioskaDocelowa ?? '-' }}
          </template>
          <template #etykietaAtaku-cell="{ row }">
            <span class="line-clamp-2 max-w-xs" :title="row.original.details?.etykietaAtaku ?? ''">
              {{ row.original.details?.etykietaAtaku ?? '-' }}
            </span>
          </template>
          <template #czasDoWysylki-cell="{ row }">
            {{ row.original.details?.czasDoWysylki ?? '-' }}
          </template>
          <template #sentOrError-cell="{ row }">
            <span v-if="row.original.status === 'sent' && row.original.sentAt" class="text-sm">
              {{ formatDateTime(row.original.sentAt) }}
            </span>
            <span v-else-if="row.original.status === 'failed' && row.original.failureReason" class="text-sm text-red-600 dark:text-red-400" :title="row.original.failureReason">
              {{ truncate(row.original.failureReason, 50) }}
            </span>
            <span v-else>-</span>
          </template>
          <template #link-cell="{ row }">
            <a
              v-if="row.original.details?.akcjaUrl"
              :href="row.original.details.akcjaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-primary hover:underline"
              aria-label="Otwórz w Plemionach"
            >
              <UIcon name="i-lucide-external-link" class="w-4 h-4" />
            </a>
            <span v-else>-</span>
          </template>
        </UTable>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTwDatabaseAttacks } from '@/composables/useTwDatabaseAttacks'
import { useOrchestrator } from '@/composables/useOrchestrator'

declare const useToast: () => any

const route = useRoute()
const toast = useToast()
const { triggerTask } = useOrchestrator()
const isTriggering = ref(false)

const { attacks, isLoading, error, loadAttacks } = useTwDatabaseAttacks()

const selectedServerId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : null
})

const statusFilter = ref<string>('all')

const statusOptions = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Oczekujące', value: 'pending' },
  { label: 'Wysłane', value: 'sent' },
  { label: 'Nieudane', value: 'failed' }
]

const columns = [
  { id: 'status', header: 'Status' },
  { id: 'lp', header: 'LP' },
  { id: 'wioskaWysylajaca', header: 'Wioska wysyłająca' },
  { id: 'wioskaDocelowa', header: 'Wioska docelowa' },
  { id: 'etykietaAtaku', header: 'Etykieta ataku' },
  { id: 'czasDoWysylki', header: 'Czas do wysyłki' },
  { id: 'sentOrError', header: 'Data wysłania / Błąd' },
  { id: 'link', header: 'Link' }
]

const tableRows = computed(() => attacks.value)

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
  switch (status) {
    case 'sent':
      return 'success'
    case 'failed':
      return 'error'
    case 'pending':
      return 'warning'
    default:
      return 'neutral'
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'sent':
      return 'Wysłany'
    case 'failed':
      return 'Nieudany'
    case 'pending':
      return 'Oczekujący'
    default:
      return status
  }
}

const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncate = (str: string, len: number): string => {
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

const handleStatusChange = async (value: string) => {
  statusFilter.value = value
  await fetchAttacks()
}

const fetchAttacks = async () => {
  if (!selectedServerId.value) return
  const status = statusFilter.value === 'all' ? undefined : (statusFilter.value as 'pending' | 'sent' | 'failed')
  await loadAttacks(selectedServerId.value, status)
}

const handleRefresh = async () => {
  try {
    await fetchAttacks()
    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Lista ataków została zaktualizowana',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch {
    toast.add({
      title: 'Błąd odświeżania',
      description: 'Nie udało się zaktualizować listy ataków',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const handleTriggerNow = async () => {
  if (!selectedServerId.value) return
  isTriggering.value = true
  try {
    await triggerTask(selectedServerId.value, 'twDatabase')
    await fetchAttacks()
  } finally {
    isTriggering.value = false
  }
}

watch(
  () => [selectedServerId.value, statusFilter.value],
  async ([serverId]) => {
    if (serverId) await fetchAttacks()
  },
  { immediate: true }
)
</script>
