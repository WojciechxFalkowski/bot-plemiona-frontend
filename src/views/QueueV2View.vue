<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="villagesLoading || buildingsLoading" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie danych...</p>
    </div>

    <!-- Form Card -->
    <UCard v-else>
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Kolejka v2
            </h1>
            <p class="mt-1 text-sm text-gray-600">
              Dodaj budynek do kolejki budowy
            </p>
          </div>
          <div class="flex gap-3">
            <VillageRefreshButton @refresh-completed="handleVillageRefresh" />
          </div>
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Village Selection -->
        <UFormField required>
          <template #label>
            <div class="flex items-center gap-2">
              <span>Wioska</span>
              <UTooltip text="Wybierz wioskę, w której chcesz zbudować budynek">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </UTooltip>
            </div>
          </template>
          <USelect v-model="selectedVillage" :items="villageItems" placeholder="Wybierz wioskę" :searchable="true"
            class="w-full" />
        </UFormField>

        <!-- Building Selection -->
        <UFormField required>
          <template #label>
            <div class="flex items-center gap-2">
              <span>Budynek</span>
              <UTooltip text="Wybierz typ budynku do zbudowania">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </UTooltip>
            </div>
          </template>
          <USelect v-model="selectedBuilding" :items="buildingItems" placeholder="Wybierz budynek"
            :disabled="!selectedVillage" :searchable="true" class="w-full" />
        </UFormField>

        <!-- Level Selection -->
        <UFormField required>
          <template #label>
            <div class="flex items-center gap-2">
              <span>Poziom docelowy</span>
              <UTooltip>
                <template #text>
                  <span>
                    Wybierz poziom docelowy budynku
                    <span v-if="selectedBuildingData">
                      (maks. {{ selectedBuildingData.maxLevel }})
                    </span>
                  </span>
                </template>
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </UTooltip>
            </div>
          </template>
          <USelect v-model="selectedLevel" :items="levelItems" placeholder="Wybierz poziom"
            :disabled="!selectedBuilding" :searchable="false" class="w-full" />
        </UFormField>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-3">
          <UButton type="button" color="gray" variant="soft" @click="resetForm" :disabled="submitting">
            Wyczyść
          </UButton>
          <UButton type="submit" color="blue" :loading="submitting" :disabled="!isFormValid || submitting">
            Dodaj do kolejki
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Summary Card -->
    <UCard v-if="isFormValid && !villagesLoading && !buildingsLoading" class="max-w-2xl">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Podsumowanie
        </h3>
      </template>

      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-600">Wioska:</span>
          <span class="font-medium">{{ getVillageLabel(selectedVillage) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Budynek:</span>
          <span class="font-medium">{{ selectedBuildingData?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Poziom docelowy:</span>
          <span class="font-medium">{{ selectedLevel }}</span>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVillages } from '@/composables/useVillages'
import { useBuildings } from '@/composables/useBuildings'
import VillageRefreshButton from '@/components/VillageRefreshButton.vue'
import type { AddBuildingToQueueRequest } from '@/types/buildings'

// Global auto-imported composable
declare const useToast: () => any

// Composables
const { villages, loading: villagesLoading, fetchVillages, refreshVillages } = useVillages()
const { buildings, loading: buildingsLoading, fetchBuildings, addBuildingToQueue } = useBuildings()
const toast = useToast()

// Form state
const selectedVillage = ref<string>('')
const selectedBuilding = ref<string>('')
const selectedLevel = ref<number | null>(null)
const submitting = ref(false)

// Computed options
const villageItems = computed(() =>
  villages.value.map(village => village.name)
)

const getVillageLabel = (villageName: string) => {
  const village = villages.value.find(v => v.name === villageName)
  return village ? `${village.name} (${village.coordinates})` : villageName
}

const buildingItems = computed(() =>
  buildings.value.map(building => building.screen)
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

const isFormValid = computed(() =>
  selectedVillage.value &&
  selectedBuilding.value &&
  selectedLevel.value !== null
)

// Methods
const resetForm = () => {
  selectedVillage.value = ''
  selectedBuilding.value = ''
  selectedLevel.value = null
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.add({
      title: 'Błąd formularza',
      description: 'Wszystkie pola są wymagane',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
    return
  }

  submitting.value = true

  try {
    const request: AddBuildingToQueueRequest = {
      villageName: selectedVillage.value,
      buildingId: selectedBuilding.value,
      targetLevel: selectedLevel.value!
    }

    const result = await addBuildingToQueue(request)

    toast.add({
      title: 'Sukces!',
      description: `Dodano ${selectedBuildingData.value?.name} poziom ${selectedLevel.value} do kolejki w wiosce ${selectedVillage.value}`,
      icon: 'i-lucide-check-circle',
      color: 'green'
    })

    resetForm()

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd'

    toast.add({
      title: 'Błąd',
      description: `Nie udało się dodać budynku do kolejki: ${errorMessage}`,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } finally {
    submitting.value = false
  }
}

const handleVillageRefresh = async () => {
  await refreshVillages()
  toast.add({
    title: 'Lista odświeżona',
    description: 'Lista wiosek została zaktualizowana',
    icon: 'i-lucide-check-circle',
    color: 'green'
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchVillages(),
    fetchBuildings()
  ])
})
</script>
