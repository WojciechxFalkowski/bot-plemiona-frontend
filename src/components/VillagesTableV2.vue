<template>
  <div class="flex flex-col gap-4">
    <!-- Add Village Form -->
    <div class="flex gap-2 mt-4 mb-4 flex-wrap">
      <UInput
        v-model="newVillage.id"
        placeholder="ID"
        variant="outline"
        class="flex-1 min-w-0"
      />

      <UInput
        v-model="newVillage.name"
        placeholder="Nazwa"
        variant="outline"
        class="flex-1 min-w-0"
      />

      <UInput
        v-model="newVillage.coordinates"
        placeholder="Współrzędne"
        variant="outline"
        class="flex-1 min-w-0"
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

    <!-- Villages Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
/* Smooth transitions for grid items */
.grid > * {
  transition: all 0.2s ease-in-out;
}

/* Hover effect for grid items */
.grid > *:hover {
  transform: translateY(-2px);
}
</style>
