<template>
  <div class="space-y-6">
    <!-- Server not selected message -->
    <div v-if="!route.query.serverId" class="no-server-selected">
      <UCard>
        <div class="text-center py-12">
          <UIcon name="i-lucide-server" class="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            Wybierz serwer
          </h3>
          <p class="text-gray-600 mb-6">
            Aby zarządzać kolejką budowy, wybierz serwer z menu po lewej stronie.
          </p>
          <UButton icon="i-lucide-arrow-left" label="Otwórz menu" color="primary" @click="toggleDrawer" />
        </div>
      </UCard>
    </div>

    <!-- Server selected content -->
    <div v-else>
      <!-- Loading State -->
      <div v-if="villagesLoading || buildingsLoading" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Ładowanie danych...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Header with buttons -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Kolejka budowy
            </h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Zarządzaj kolejką budowy budynków w wioskach
            </p>
          </div>
          <div class="flex gap-3">
            <VillageRefreshButton :server-id="serverId" @refresh-completed="handleVillageRefresh" />
            <UModal v-model:open="isAddBuildingModalOpen" title="Dodaj budynek do kolejki"
              description="Wybierz wioskę, budynek i poziom docelowy">
              <UButton icon="i-lucide-list-plus" color="primary" class="cursor-pointer">
                Dodaj do kolejki
              </UButton>
              <template #body>
                <AddBuildingForm v-model:selected-village="selectedVillage"
                  v-model:selected-building="selectedBuilding" v-model:target-level="targetLevel" :submitting="submitting"
                  :village-items="villageItems" :building-items="buildingItems" :level-items="levelItems"
                  :selected-building-data="selectedBuildingData" :is-form-valid="isFormValid" :server-id="serverId"
                  @addBuildingToQueueHandler="handleAddBuildingToQueue" @clear="handleClear" />
              </template>
            </UModal>
          </div>
        </div>

        <!-- Queue List -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-end">
              <UButton icon="i-lucide-refresh-cw" color="secondary" variant="ghost" :loading="queueLoading"
                class="cursor-pointer" @click="handleRefreshQueue">
                Odśwież kolejkę
              </UButton>
            </div>
          </template>

        <QueueList :queue-items="queueItems" :loading="queueLoading" :on-delete="handleRemoveFromQueue" />
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVillages } from '@/composables/useVillages'
import { useBuildings } from '@/composables/useBuildings'
import { useQueue } from '@/composables/useQueue'
import { useSnackbar } from 'vue3-snackbar'
import VillageRefreshButton from '@/components/VillageRefreshButton.vue'
import QueueList from '@/components/queue/QueueList.vue'
import AddBuildingForm from '@/components/queue/AddBuildingForm.vue'
import type { AddBuildingToQueueRequest } from '@/types/buildings'
import { BACKEND_URL } from '@/composables/backendUrl'

const route = useRoute()
const snackbar = useSnackbar()
const { villages, loading: villagesLoading, fetchVillages, refreshVillages } = useVillages()
const { buildings, loading: buildingsLoading, fetchBuildings } = useBuildings()
const {
  queueItems,
  loading: queueLoading,
  error: queueError,
  fetchQueue,
  refreshQueue,
  addBuildingToQueue,
  removeFromQueue
} = useQueue()

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : undefined
})

// Form data
const selectedVillage = ref<string>('')
const selectedBuilding = ref<string>('')
const targetLevel = ref<number>(1)

// Form validation
const isFormValid = computed(() => {
  return Boolean(selectedVillage.value && selectedBuilding.value && targetLevel.value > 0 && serverId.value)
})

const handleAddBuildingToQueue = async (request: AddBuildingToQueueRequest) => {
  submitting.value = true

  try {
    await addBuildingToQueue(request)

    // Refresh queue to show new item
    await refreshQueue(serverId.value)

    // Show success message
    snackbar.add({
      type: 'success',
      text: 'Budynek został dodany do kolejki!'
    })

    // Reset only level, keep village and building selected
    targetLevel.value = 1
  } catch (error) {
    console.error('Błąd podczas dodawania budynku do kolejki:', error)
    snackbar.add({
      type: 'error',
      text: error instanceof Error ? error.message : 'Nieznany błąd podczas dodawania budynku do kolejki.'
    })
  } finally {
    submitting.value = false
  }
}

const handleVillageRefresh = async () => {
  if (serverId.value) {
    await refreshVillages(serverId.value)
  }
}

const handleRemoveFromQueue = async (queueItemId: number) => {
  try {
    await removeFromQueue(queueItemId)
    snackbar.add({
      type: 'success',
      text: 'Element został usunięty z kolejki!'
    })
  } catch (error) {
    console.error('Błąd podczas usuwania z kolejki:', error)
    snackbar.add({
      type: 'error',
      text: error instanceof Error ? error.message : 'Nieznany błąd podczas usuwania z kolejki.'
    })
  }
}

const handleRefreshQueue = async () => {
  try {
    await refreshQueue(serverId.value)
    snackbar.add({
      type: 'success',
      text: 'Kolejka została odświeżona!'
    })
  } catch (error) {
    console.error('Błąd podczas odświeżania kolejki:', error)
    snackbar.add({
      type: 'error',
      text: error instanceof Error ? error.message : 'Nieznany błąd podczas odświeżania kolejki.'
    })
  }
}

const handleClear = () => {
  selectedVillage.value = ''
  selectedBuilding.value = ''
  targetLevel.value = 1
}

const toggleDrawer = () => {
  const hamburgerBtn = document.querySelector('.hamburger-btn') as HTMLElement
  hamburgerBtn?.click()
}

const submitting = ref(false)
const isAddBuildingModalOpen = ref(false)

// Computed options
const villageItems = computed(() =>
  villages.value.map(village => village.name)
)

const getVillageLabel = (villageName: string) => {
  const village = villages.value.find(v => v.name === villageName)
  return village ? `${village.name} (${village.coordinates})` : villageName
}

const buildingItems = computed(() =>
  buildings.value.map(building => ({
    label: building.name,
    value: building.screen
  }))
)

const getBuildingLabel = (buildingScreen: string) => {
  const building = buildings.value.find(b => b.screen === buildingScreen)
  return building ? building.name : buildingScreen
}

const selectedBuildingData = computed(() =>
  buildings.value.find(building => building.screen === selectedBuilding.value)
)

const levelItems = computed(() => {
  if (!selectedBuildingData.value) return []

  const items = []
  for (let i = 1; i <= selectedBuildingData.value.maxLevel; i++) {
    items.push(i)
  }
  return items
})

// Watch for serverId changes
watch(serverId, async (newServerId, oldServerId) => {
  if (newServerId && newServerId !== oldServerId) {
    // Reset form when server changes
    selectedVillage.value = ''
    selectedBuilding.value = ''
    targetLevel.value = 1

    // Fetch new data for the selected server
    await fetchVillages(newServerId)
    await fetchQueue(newServerId)
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await fetchBuildings()
})
</script>
