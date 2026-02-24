<script lang='ts' setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOrchestrator, type OrchestratorServerTasks } from '@/composables/useOrchestrator'

// Global auto-imported composable
declare const useToast: () => any

const route = useRoute()
const toast = useToast()

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : 217 // Default to 217 if not provided
})

// Composables
const {
  settings,
  status,
  error,
  isLoading,
  hasError,
  loadSettings,
  updateSetting,
  getStatus,
  startMonitoring,
  clearError
} = useOrchestrator()

// Computed property to get current server tasks with next execution times
const currentServerTasks = computed<OrchestratorServerTasks | null>(() => {
  if (!status.value?.servers) return null
  const server = status.value.servers.find(s => s.serverId === serverId.value)
  return server?.tasks ?? null
})

// Formatting helpers
const formatTimeUntil = (targetDateStr: string | null): string | null => {
  if (!targetDateStr) return null
  const target = new Date(targetDateStr)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  
  if (diffMs <= 0) return null
  
  const totalSeconds = Math.floor(diffMs / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  if (hours > 0) {
    return `za ${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `za ${minutes}m ${seconds}s`
  }
  return `za ${seconds}s`
}

const formatDateTime = (dateStr: string | null): string | null => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Handlers
const handleSettingChange = async (settingType: keyof typeof settings.value, value: boolean) => {
  try {
    await updateSetting(serverId.value, settingType, value)
    // Refresh status to get updated next execution times
    await getStatus()
  } catch (err) {
    console.error(`Error updating ${settingType}:`, err)
  }
}

const handleRefresh = async () => {
  try {
    await Promise.all([loadSettings(serverId.value), getStatus()])
    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Ustawienia orkiestratora zostały zaktualizowane',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch (err) {
    toast.add({
      title: 'Błąd odświeżania',
      description: 'Nie udało się zaktualizować ustawień',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const handleStartMonitoring = async () => {
  try {
    await startMonitoring()
  } catch (err) {
    console.error('Error starting monitoring:', err)
  }
}

// Watch for serverId changes and reload data
watch(serverId, async (newServerId) => {
  if (newServerId) {
    await Promise.all([loadSettings(newServerId), getStatus()])
  }
}, { immediate: true })

// Load data on mount (fallback)
onMounted(async () => {
  if (serverId.value) {
    await Promise.all([loadSettings(serverId.value), getStatus()])
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Orkiestrator</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Zarządzaj automatycznymi funkcjami dla serwera {{ serverId }}</p>
      </div>

      <UButton icon="i-lucide-refresh-cw" label="Odśwież" :loading="isLoading" color="secondary" variant="outline"
        class="cursor-pointer dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        @click="handleRefresh" />
    </div>

    <!-- Error Alert -->
    <UAlert v-if="hasError" icon="i-lucide-alert-circle" color="red" title="Błąd" :description="error"
      @close="clearError" />

    <!-- Status Card -->
    <UCard v-if="status">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-activity" />
            <span class="font-semibold text-gray-900 dark:text-white">Status Orkiestratora</span>
          </div>
          <UButton icon="i-lucide-play" label="Uruchom Monitoring" :loading="isLoading" size="sm" color="primary"
            class="cursor-pointer"
            @click="handleStartMonitoring" />
        </div>
      </template>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Status Schedulera:</span>
          <UBadge :color="status.schedulerActive ? 'green' : 'red'"
            :label="status.schedulerActive ? 'Aktywny' : 'Nieaktywny'" />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Aktywne Serwery:</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ status.activeServersCount }}</span>
        </div>
      </div>
    </UCard>

    <!-- Settings Card -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-settings" />
          <span class="font-semibold text-gray-900 dark:text-white">Ustawienia Automatyzacji</span>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Construction Queue -->
        <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.constructionQueue" :loading="isLoading" label="Automatyczna Kolejka Budowy"
              description="Automatycznie zarządza kolejką budowy w wioskach" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('constructionQueue', value)" />
            <p 
              v-if="settings.constructionQueue && currentServerTasks?.constructionQueue?.nextExecution"
              class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1"
            >
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              Następne wykonanie: {{ formatDateTime(currentServerTasks.constructionQueue.nextExecution) }}
              <span v-if="formatTimeUntil(currentServerTasks.constructionQueue.nextExecution)" class="text-gray-400 dark:text-gray-500">
                ({{ formatTimeUntil(currentServerTasks.constructionQueue.nextExecution) }})
              </span>
            </p>
          </div>
        </div>

        <!-- Mini Attacks -->
        <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.miniAttacks" :loading="isLoading" label="Mini Ataki"
              description="Automatycznie wykonuje mini ataki na wioski barbarzyńskie" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('miniAttacks', value)" />
            <p 
              v-if="settings.miniAttacks && currentServerTasks?.miniAttacks?.nextExecution"
              class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1"
            >
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              Następne wykonanie: {{ formatDateTime(currentServerTasks.miniAttacks.nextExecution) }}
              <span v-if="formatTimeUntil(currentServerTasks.miniAttacks.nextExecution)" class="text-gray-400 dark:text-gray-500">
                ({{ formatTimeUntil(currentServerTasks.miniAttacks.nextExecution) }})
              </span>
            </p>
          </div>
        </div>

        <!-- Scavenging -->
        <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.scavenging" :loading="isLoading" label="Automatyczne Zbieranie"
              description="Automatycznie wysyła jednostki na zbieranie zasobów" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('scavenging', value)" />
            <p 
              v-if="settings.scavenging && currentServerTasks?.scavenging?.nextExecution"
              class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1"
            >
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              Następne wykonanie: {{ formatDateTime(currentServerTasks.scavenging.nextExecution) }}
              <span v-if="formatTimeUntil(currentServerTasks.scavenging.nextExecution)" class="text-gray-400 dark:text-gray-500">
                ({{ formatTimeUntil(currentServerTasks.scavenging.nextExecution) }})
              </span>
            </p>
          </div>
        </div>

        <!-- Army Training -->
        <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.armyTraining" :loading="isLoading" label="Automatyczne Szkolenie Armii"
              description="Automatycznie szkoli jednostki lekkie w wioskach" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('armyTraining', value)" />
            <p 
              v-if="settings.armyTraining && currentServerTasks?.armyTraining?.nextExecution"
              class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1"
            >
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              Następne wykonanie: {{ formatDateTime(currentServerTasks.armyTraining.nextExecution) }}
              <span v-if="formatTimeUntil(currentServerTasks.armyTraining.nextExecution)" class="text-gray-400 dark:text-gray-500">
                ({{ formatTimeUntil(currentServerTasks.armyTraining.nextExecution) }})
              </span>
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Info Card -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-info" />
          <span class="font-semibold text-gray-900 dark:text-white">Informacje</span>
        </div>
      </template>

      <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Orkiestrator</strong> to system automatycznego zarządzania funkcjami botów dla serwera {{ serverId }}.
        </p>
        <p>
          Każde ustawienie kontroluje odpowiednią funkcję automatyczną. Zmiany są zapisywane natychmiastowo
          i wpływają na działanie orkiestratora w czasie rzeczywistym.
        </p>
        <p>
          <strong>Status Schedulera</strong> pokazuje czy orkiestrator jest aktywny i przetwarza zadania.
        </p>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
