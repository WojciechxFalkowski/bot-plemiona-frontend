<template>
  <div class="flex flex-col gap-4">
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
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="village in villages" :key="village.id"
        class="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 relative border border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="text-lg font-semibold text-gray-900">{{ village.name }}</span>
            <div class="text-xs text-gray-400 mt-1">ID: {{ village.id }}</div>
          </div>
          <button @click="handleDeleteVillage(village.id)"
            class="text-red-500 hover:text-red-700 cursor-pointer text-sm p-1 rounded-full transition-colors"
            title="Usuń"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg></button>
        </div>
        <div class="flex flex-col items-center justify-center mb-2">
          <span class="font-mono text-lg bg-gray-50 rounded px-2 py-1 text-gray-700 tracking-wider">
            {{ village.coordinates }}
          </span>
        </div>
        <div class="flex gap-2 mt-auto pt-2 border-t border-gray-100">
          <button @click="handleToggleBuilding(village.name)" :disabled="loading" :class="[
            'flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded transition-all duration-200 border',
            'hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            village.isAutoBuildEnabled
              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
              : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
          ]" :title="`Kliknij aby ${village.isAutoBuildEnabled ? 'wyłączyć' : 'włączyć'} auto-building`">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h4l3 8 4-16 3 8h4" />
            </svg>
            {{ village.isAutoBuildEnabled ? 'Auto Build: ON' : 'Auto Build: OFF' }}
          </button>
          <button @click="handleToggleScavenging(village.name)" :disabled="loading" :class="[
            'flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded transition-all duration-200 border',
            'hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            village.isAutoScavengingEnabled
              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
              : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
          ]" :title="`Kliknij aby ${village.isAutoScavengingEnabled ? 'wyłączyć' : 'włączyć'} auto-scavenging`">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ village.isAutoScavengingEnabled ? 'Scavenging: ON' : 'Scavenging: OFF' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Village } from '@/types/villages'

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

<style></style>
