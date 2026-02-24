<template>
  <div class="flex flex-col gap-4">
    <!-- Add Village Form + View Toggle -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex gap-2 flex-wrap flex-1 min-w-0">
        <UInput
          v-model="newVillage.id"
          placeholder="ID"
          variant="outline"
          class="flex-1 min-w-[80px]"
        />
        <UInput
          v-model="newVillage.name"
          placeholder="Nazwa"
          variant="outline"
          class="flex-1 min-w-[80px]"
        />
        <UInput
          v-model="newVillage.coordinates"
          placeholder="Współrzędne"
          variant="outline"
          class="flex-1 min-w-[80px]"
        />
        <UButton
          @click="handleAddVillage"
          :disabled="loading"
          color="success"
          class="cursor-pointer flex-shrink-0"
        >
          Dodaj wioskę
        </UButton>
      </div>
      <div class="flex gap-1 shrink-0" role="group" aria-label="Tryb wyświetlania">
        <UButton
          :color="viewMode === 'cards' ? 'primary' : 'neutral'"
          :variant="viewMode === 'cards' ? 'solid' : 'soft'"
          size="sm"
          icon="i-lucide-layout-grid"
          class="cursor-pointer"
          title="Widok kart"
          aria-label="Widok kart"
          @click="viewMode = 'cards'"
        />
        <UButton
          :color="viewMode === 'compact' ? 'primary' : 'neutral'"
          :variant="viewMode === 'compact' ? 'solid' : 'soft'"
          size="sm"
          icon="i-lucide-grip-horizontal"
          class="cursor-pointer"
          title="Widok kompaktowy"
          aria-label="Widok kompaktowy"
          @click="viewMode = 'compact'"
        />
        <UButton
          :color="viewMode === 'table' ? 'primary' : 'neutral'"
          :variant="viewMode === 'table' ? 'solid' : 'soft'"
          size="sm"
          icon="i-lucide-list"
          class="cursor-pointer"
          title="Widok tabeli"
          aria-label="Widok tabeli"
          @click="viewMode = 'table'"
        />
      </div>
    </div>

    <!-- Cards View -->
    <div
      v-if="viewMode === 'cards' && villages.length > 0"
      class="grid grid-cols-1 gap-4"
    >
      <VillagesCard
        v-for="village in villages"
        :key="village.id"
        :village="village"
        :loading="loading"
        @delete="handleDeleteVillage"
        @toggle-auto-scavenging="handleToggleScavenging"
        @toggle-auto-building="handleToggleBuilding"
      />
    </div>

    <!-- Compact View -->
    <div
      v-if="viewMode === 'compact' && villages.length > 0"
      class="grid grid-cols-1 gap-2"
    >
      <VillagesCardCompact
        v-for="village in villages"
        :key="village.id"
        :village="village"
        :loading="loading"
        @delete="handleDeleteVillage"
        @toggle-auto-scavenging="handleToggleScavenging"
        @toggle-auto-building="handleToggleBuilding"
      />
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table' && villages.length > 0" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <tr>
            <th scope="col" class="px-4 py-3 font-medium">ID</th>
            <th scope="col" class="px-4 py-3 font-medium">Nazwa</th>
            <th scope="col" class="px-4 py-3 font-medium">Współrzędne</th>
            <th scope="col" class="px-4 py-3 font-medium text-center" title="Auto Build">Build</th>
            <th scope="col" class="px-4 py-3 font-medium text-center" title="Scavenging">Scav</th>
            <th scope="col" class="px-4 py-3 font-medium text-right">Akcje</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="village in villages"
            :key="village.id"
            class="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <td class="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">{{ village.id }}</td>
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ village.name }}</td>
            <td class="px-4 py-2 font-mono text-gray-700 dark:text-gray-300">{{ village.coordinates }}</td>
            <td class="px-4 py-2 text-center">
              <button
                type="button"
                :disabled="loading"
                class="p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex"
                :class="village.isAutoBuildEnabled ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'"
                :title="`Auto Build: ${village.isAutoBuildEnabled ? 'ON' : 'OFF'}`"
                @click="handleToggleBuilding(village.name)"
              >
                <UIcon name="i-lucide-hammer" class="w-4 h-4" />
              </button>
            </td>
            <td class="px-4 py-2 text-center">
              <button
                type="button"
                :disabled="loading"
                class="p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex"
                :class="village.isAutoScavengingEnabled ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'"
                :title="`Scavenging: ${village.isAutoScavengingEnabled ? 'ON' : 'OFF'}`"
                @click="handleToggleScavenging(village.name)"
              >
                <UIcon name="i-lucide-package-search" class="w-4 h-4" />
              </button>
            </td>
            <td class="px-4 py-2 text-right">
              <UButton
                @click="handleDeleteVillage(village.id)"
                color="red"
                variant="soft"
                size="xs"
                icon="i-lucide-trash-2"
                class="cursor-pointer"
                title="Usuń wioskę"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="villages.length === 0" class="text-center py-12">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
        <UIcon name="i-lucide-home" class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Brak wiosek</h3>
        <p class="text-gray-600 dark:text-gray-400">Nie znaleziono żadnych wiosek w systemie.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Village } from '@/types/villages'
import VillagesCard from './VillagesCard.vue'
import VillagesCardCompact from './VillagesCardCompact.vue'

type ViewMode = 'cards' | 'compact' | 'table'

interface Props {
  villages: Village[]
  loading: boolean
  serverId?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addVillage: [village: { id: string; name: string; coordinates: string }]
  deleteVillage: [id: string]
  toggleAutoScavenging: [villageName: string]
  toggleAutoBuilding: [villageName: string]
}>()

const viewMode = ref<ViewMode>('cards')
const newVillage = ref({ id: '', name: '', coordinates: '' })

const handleAddVillage = async () => {
  if (!newVillage.value.id || !newVillage.value.name || !newVillage.value.coordinates) return
  emit('addVillage', { ...newVillage.value })
  newVillage.value = { id: '', name: '', coordinates: '' }
}

const handleDeleteVillage = async (id: string) => {
  emit('deleteVillage', id)
}

const handleToggleScavenging = async (villageName: string) => {
  emit('toggleAutoScavenging', villageName)
}

const handleToggleBuilding = async (villageName: string) => {
  emit('toggleAutoBuilding', villageName)
}
</script>

<style scoped>
.grid > * {
  transition: all 0.2s ease-in-out;
}

.grid > *:hover {
  transform: translateY(-2px);
}
</style>
