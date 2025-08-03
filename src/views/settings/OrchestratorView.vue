<script lang='ts' setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOrchestrator } from '@/composables/useOrchestrator'

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
  clearError
} = useOrchestrator()

// Handlers
const handleSettingChange = async (settingType: keyof typeof settings.value, value: boolean) => {
  try {
    await updateSetting(serverId.value, settingType, value)
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
        <h1 class="text-2xl font-bold text-gray-900">Orkiestrator</h1>
        <p class="text-gray-600 mt-1">Zarządzaj automatycznymi funkcjami dla serwera {{ serverId }}</p>
      </div>

      <UButton icon="i-lucide-refresh-cw" label="Odśwież" :loading="isLoading" color="secondary" variant="ghost"
        @click="handleRefresh" />
    </div>

    <!-- Error Alert -->
    <UAlert v-if="hasError" icon="i-lucide-alert-circle" color="red" title="Błąd" :description="error"
      @close="clearError" />

    <!-- Status Card -->
    <UCard v-if="status">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-activity" />
          <span class="font-semibold">Status Orkiestratora</span>
        </div>
      </template>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Status Schedulera:</span>
          <UBadge :color="status.schedulerActive ? 'green' : 'red'"
            :label="status.schedulerActive ? 'Aktywny' : 'Nieaktywny'" />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Aktywne Serwery:</span>
          <span class="font-medium">{{ status.activeServersCount }}</span>
        </div>
      </div>
    </UCard>

    <!-- Settings Card -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-settings" />
          <span class="font-semibold">Ustawienia Automatyzacji</span>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Construction Queue -->
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.constructionQueue" :loading="isLoading" label="Automatyczna Kolejka Budowy"
              description="Automatycznie zarządza kolejką budowy w wioskach" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('constructionQueue', value)" />
          </div>
        </div>

        <!-- Mini Attacks -->
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.miniAttacks" :loading="isLoading" label="Mini Ataki"
              description="Automatycznie wykonuje mini ataki na wioski barbarzyńskie" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('miniAttacks', value)" />
          </div>
        </div>

        <!-- Scavenging -->
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.scavenging" :loading="isLoading" label="Automatyczne Zbieranie"
              description="Automatycznie wysyła jednostki na zbieranie zasobów" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('scavenging', value)" />
          </div>
        </div>

        <!-- Army Training -->
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="flex-1">
            <USwitch :model-value="settings.armyTraining" :loading="isLoading" label="Automatyczne Szkolenie Armii"
              description="Automatycznie szkoli jednostki lekkie w wioskach" checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="(value: boolean) => handleSettingChange('armyTraining', value)" />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Info Card -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-info" />
          <span class="font-semibold">Informacje</span>
        </div>
      </template>

      <div class="space-y-3 text-sm text-gray-600">
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
