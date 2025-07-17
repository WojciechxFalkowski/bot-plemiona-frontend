<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Wioski barbarzynskie
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Zarządzaj wioskami barbarzynskimi do ataków
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <!-- <UButton icon="i-lucide-plus" label="Dodaj z URL" color="blue" variant="soft" @click="openCreateModal('url')"
          class="cursor-pointer" /> -->
        <UModal title="Edytuj wioskę barbarzynską" description="Edytuj wioskę barbarzynską">
          <UButton icon="i-lucide-plus" label="Dodaj" color="blue" variant="soft" class=" cursor-pointer" />

          <template #body>
            <BarbarianVillageModal :village="null" :loading="loading" @submit-manual="handleEdit"
              @submitManualCreate="handleCreateManual" />
          </template>
        </UModal>

        <UButton icon="i-lucide-refresh-cw" label="Refresh" :loading="loading" color="gray" variant="ghost" @click="refreshData"
          class="cursor-pointer" />
      </div>
    </div>

    <!-- Error Display -->
    <UAlert v-if="error" icon="i-lucide-alert-circle" color="red" variant="soft" :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }" @close="clearError" />

    <!-- Loading State -->
    <div v-if="loading && villages.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie wiosek barbarzynskich...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && villages.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-map-pin-off" class="w-12 h-12 text-gray-400 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">Brak wiosek barbarzynskich</h3>
      <p class="mt-2 text-sm text-gray-600">
        Dodaj pierwszą wioskę barbarzynską używając przycisków powyżej
      </p>
    </div>

    <div v-else>
      <!-- Stats -->
      <div v-if="villages.length > 0" class="border border-gray-200 rounded-lg py-2 my-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ totalCount }}</div>
            <div class="text-sm text-gray-600">Łącznie wiosek</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ attackableCount }}</div>
            <div class="text-sm text-gray-600">Do ataku</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ nonAttackableCount }}</div>
            <div class="text-sm text-gray-600">Niedostępne</div>
          </div>
        </div>
      </div>

      <!-- Villages Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <BarbarianVillageCard v-for="village in villages" :key="village.target" :village="village" @edit="handleEdit"
          @select="selectVillage" @delete="handleDelete" @submitManualCreate="handleCreateManual" />
      </div>
    </div>

    <!-- Modals -->
    <BarbarianVillageModal v-if="isCreateModalOpen" v-model="isCreateModalOpen" :loading="loading"
      @submit-manual="handleCreateManual" @submit-url="handleCreateFromUrl" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBarbarianVillages } from '@/composables/useBarbarianVillages'
import type {
  BarbarianVillage,
  CreateAndUpdateBarbarianVillageDto,
  CreateBarbarianVillageFromUrlDto,
  CreateBarbarianVillageMethod
} from '@/types/barbarian-villages'
import BarbarianVillageCard from '@/components/barbarian-villages/BarbarianVillageCard.vue'
import BarbarianVillageModal from '@/components/barbarian-villages/BarbarianVillageModal.vue'

// Composable
const {
  villages,
  loading,
  error,
  totalCount,
  fetchVillages,
  createVillage,
  createVillageFromUrl,
  updateVillage,
  deleteVillage,
  refreshVillages,
  clearError
} = useBarbarianVillages()

// Modal states
const isCreateModalOpen = ref(false)

// Computed stats
const attackableCount = computed(() =>
  villages.value.filter(v => v.canAttack).length
)

const nonAttackableCount = computed(() =>
  villages.value.filter(v => !v.canAttack).length
)

const refreshData = async () => {
  await refreshVillages()
}

const selectedVillage = ref<BarbarianVillage | null>(null)

const selectVillage = (village: BarbarianVillage) => {
  selectedVillage.value = village
}

// Create handlers
const handleCreateManual = async (data: CreateAndUpdateBarbarianVillageDto) => {
  try {
    await createVillage(data)
    isCreateModalOpen.value = false
  } catch (err) {
    console.error('Error creating village:', err)
  }
}

const handleCreateFromUrl = async (data: CreateBarbarianVillageFromUrlDto) => {
  try {
    await createVillageFromUrl(data)
    isCreateModalOpen.value = false
  } catch (err) {
    console.error('Error creating village from URL:', err)
  }
}

// Edit handler
const handleEdit = async (data: CreateAndUpdateBarbarianVillageDto) => {
  try {
    await updateVillage(data.target, data)
  } catch (err) {
    console.error('Error updating village:', err)
  }
}

// Delete handler
const handleDelete = async (village: BarbarianVillage) => {
  try {
    await deleteVillage(village.target)
  } catch (err) {
    console.error('Error deleting village:', err)
  }
}

// Initial load
onMounted(async () => {
  await fetchVillages()
})
</script>
