<template>
  <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
    <!-- Header with ID and Delete -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          ID: {{ village.id }}
        </span>
      </div>
      <UButton
        @click="handleDelete"
        color="red"
        variant="soft"
        size="xs"
        icon="i-lucide-trash-2"
        class="cursor-pointer"
        title="Usuń wioskę"
      />
    </div>

    <!-- Village Name -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
      {{ village.name }}
    </h3>

    <!-- Coordinates -->
    <div class="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 mb-3 text-center">
      {{ village.coordinates }}
    </div>

    <!-- Toggle Buttons -->
    <div class="flex gap-2">
      <UButton
        @click="handleToggleBuilding"
        :disabled="loading"
        :color="village.isAutoBuildEnabled ? 'success' : 'error'"
        :variant="village.isAutoBuildEnabled ? 'solid' : 'soft'"
        size="sm"
        class="cursor-pointer flex-1"
        :title="`Kliknij aby ${village.isAutoBuildEnabled ? 'wyłączyć' : 'włączyć'} auto-building`"
      >
        <UIcon name="i-lucide-hammer" class="w-4 h-4 mr-1" />
        <span class="hidden sm:inline">Auto Build</span>
        <span class="sm:hidden">Build</span>
        <span class="ml-1 font-medium">{{ village.isAutoBuildEnabled ? 'ON' : 'OFF' }}</span>
      </UButton>

      <UButton
        @click="handleToggleScavenging"
        :disabled="loading"
        :color="village.isAutoScavengingEnabled ? 'success' : 'error'"
        :variant="village.isAutoScavengingEnabled ? 'solid' : 'soft'"
        size="sm"
        class="cursor-pointer flex-1"
        :title="`Kliknij aby ${village.isAutoScavengingEnabled ? 'wyłączyć' : 'włączyć'} auto-scavenging`"
      >
        <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-1" />
        <span class="hidden sm:inline">Scavenging</span>
        <span class="sm:hidden">Scav</span>
        <span class="ml-1 font-medium">{{ village.isAutoScavengingEnabled ? 'ON' : 'OFF' }}</span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Village } from '@/types/villages'

interface Props {
  village: Village
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [id: string]
  toggleAutoScavenging: [villageName: string]
  toggleAutoBuilding: [villageName: string]
}>()

const handleDelete = () => {
  emit('delete', props.village.id)
}

const handleToggleScavenging = () => {
  emit('toggleAutoScavenging', props.village.name)
}

const handleToggleBuilding = () => {
  emit('toggleAutoBuilding', props.village.name)
}
</script>

<style scoped>
/* Custom hover effect */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dark .hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}
</style>
