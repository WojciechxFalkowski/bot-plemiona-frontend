<template>
  <div
    class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-sm transition-shadow"
  >
    <span class="text-xs font-mono text-gray-600 dark:text-gray-400 shrink-0" :title="`ID: ${village.id}`">{{ village.id }}</span>
    <span class="text-xs font-mono text-gray-700 dark:text-gray-300 shrink-0">{{ village.coordinates }}</span>
    <div class="flex items-center gap-1 shrink-0">
      <button
        type="button"
        :disabled="loading"
        class="p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        :class="village.isAutoBuildEnabled ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'"
        :title="`Auto Build: ${village.isAutoBuildEnabled ? 'ON' : 'OFF'}. Kliknij aby ${village.isAutoBuildEnabled ? 'wyłączyć' : 'włączyć'}`"
        @click="handleToggleBuilding"
      >
        <UIcon name="i-lucide-hammer" class="w-4 h-4" />
      </button>
      <button
        type="button"
        :disabled="loading"
        class="p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        :class="village.isAutoScavengingEnabled ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'"
        :title="`Scavenging: ${village.isAutoScavengingEnabled ? 'ON' : 'OFF'}. Kliknij aby ${village.isAutoScavengingEnabled ? 'wyłączyć' : 'włączyć'}`"
        @click="handleToggleScavenging"
      >
        <UIcon name="i-lucide-package-search" class="w-4 h-4" />
      </button>
    </div>
    <UDropdown :items="dropdownItems" class="ml-auto shrink-0">
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-more-vertical"
        class="cursor-pointer"
        aria-label="Menu akcji"
      />
    </UDropdown>
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

const dropdownItems = [
  [
    {
      label: 'Usuń wioskę',
      icon: 'i-lucide-trash-2',
      click: () => emit('delete', props.village.id),
      class: 'text-red-600 dark:text-red-400'
    }
  ]
]

const handleToggleScavenging = () => {
  emit('toggleAutoScavenging', props.village.name)
}

const handleToggleBuilding = () => {
  emit('toggleAutoBuilding', props.village.name)
}
</script>
