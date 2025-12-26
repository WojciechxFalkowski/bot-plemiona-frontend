<template>
  <div class="space-y-6">
    <!-- Server not selected message -->
    <div v-if="!serverId" class="no-server-selected">
      <UCard>
        <div class="text-center py-12">
          <UIcon name="i-lucide-server" class="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            Wybierz serwer
          </h3>
          <p class="text-gray-600 mb-6">
            Aby zarządzać stanami budynków, wybierz serwer z menu po lewej stronie.
          </p>
          <UButton icon="i-lucide-arrow-left" label="Otwórz menu" color="primary" @click="toggleDrawer" />
        </div>
      </UCard>
    </div>

    <!-- Server selected content -->
    <div v-else>
      <!-- Village Selection -->
      <UCard>
        <div class="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div class="flex items-end gap-3 w-full md:w-auto md:flex-shrink-0">
            <div class="flex-1 w-full md:w-auto md:min-w-[250px]">
              <UFormField label="Wybierz wioskę" required>
                <USelect v-model="selectedVillage" :items="villageItems" placeholder="Wybierz wioskę" :searchable="true"
                  :disabled="villagesLoading" class="w-full" />
              </UFormField>
            </div>

            <UButton icon="i-lucide-download" color="primary" :loading="buildingStatesLoading"
              :disabled="!selectedVillage || villagesLoading" @click="handleFetchBuildingStates"
              class="cursor-pointer md:flex-none">
              <span class="hidden sm:inline">Pobierz stany budynków</span>
              <span class="sm:hidden">Pobierz</span>
            </UButton>
            <UButton 
              icon="i-lucide-refresh-cw" 
              variant="outline" 
              :loading="buildingStatesLoading"
              :disabled="!selectedVillage || villagesLoading" 
              @click="handleRefreshBuildingStates"
              class="cursor-pointer md:flex-none">
              <span class="hidden sm:inline">Odśwież i pobierz</span>
              <span class="sm:hidden">Odśwież</span>
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Error State -->
      <UAlert v-if="buildingStatesError && !buildingStatesLoading" color="error" variant="soft"
        title="Błąd pobierania stanów budynków" :description="buildingStatesError" class="mb-4">
        <template #actions>
          <UButton color="error" variant="ghost" size="xs" @click="handleFetchBuildingStates" class="cursor-pointer">
            Spróbuj ponownie
          </UButton>
        </template>
      </UAlert>

      <!-- Building States Display -->
      <div v-if="buildingStates && !buildingStatesLoading">
        <!-- Cache Validity Info -->
        <div
          v-if="buildingStates.isValid"
          class="flex items-center gap-2 px-3 py-1.5 my-2 rounded-lg bg-success/10 text-success text-xs"
        >
          <UIcon name="i-lucide-check-circle" class="w-4 h-4 flex-shrink-0" />
          <span class="hidden sm:inline whitespace-nowrap">
            Dane aktualne przez najbliższe 5 minut. Pobrano: {{ formatDate(buildingStates.cachedAt) }}
          </span>
          <span class="sm:hidden whitespace-nowrap">
            Dane aktualne. Pobrano: {{ formatDate(buildingStates.cachedAt) }}
          </span>
        </div>

        <!-- Building States List -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                Budynki w wiosce {{ buildingStates.villageInfo.name }}
              </h3>
              <UBadge color="blue" variant="soft" size="sm">
                {{ buildingStatesList }} budynków
              </UBadge>
            </div>
          </div>

          <!-- Content -->
          <div class="p-1">
            <BuildingStatesList :building-states="buildingStates" :server-id="serverId" :village-name="selectedVillage"
              :on-add-building="handleAddBuilding" :on-remove-building="handleRemoveBuilding" />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="buildingStatesLoading" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
        <p class="mt-2 text-sm text-gray-600">Ładowanie stanów budynków...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!buildingStates && !buildingStatesLoading && !buildingStatesError" class="text-center py-12">
        <UIcon name="i-lucide-building" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Wybierz wioskę i pobierz stany budynków</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVillages } from '@/composables/useVillages'
import { useBuildingStates } from '@/composables/useBuildingStates'
import { useBuildings } from '@/composables/useBuildings'
import { useQueue } from '@/composables/useQueue'
import BuildingStatesList from '@/components/queue/BuildingStatesList.vue'
import type { AddBuildingToQueueRequest } from '@/types/buildings'

// Global auto-imported composable
declare const useToast: () => any

const route = useRoute()
const toast = useToast()
const { villages, loading: villagesLoading, fetchVillages } = useVillages()
const { buildingStates, loading: buildingStatesLoading, error: buildingStatesError, fetchBuildingStates, refreshBuildingStates, addBuildingToQueueFromCache, clearError, clearStates } = useBuildingStates()
const { buildings, fetchBuildings } = useBuildings()
const { removeFromQueue } = useQueue()

const serverId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : undefined
})

const selectedVillage = ref<string>('')

const villageItems = computed(() =>
  villages.value.map(village => village.name)
)

const buildingStatesList = computed(() => {
  if (!buildingStates.value) return []
  // Zwróć liczbę budynków z buildingLevels
  return Object.keys(buildingStates.value.buildingLevels).length
})

const handleFetchBuildingStates = async () => {
  if (!serverId.value || !selectedVillage.value) return

  clearError()
  try {
    await fetchBuildingStates(serverId.value, selectedVillage.value)
  } catch (error) {
    console.error('Error fetching building states:', error)
  }
}

const handleRefreshBuildingStates = async () => {
  if (!serverId.value || !selectedVillage.value) return

  clearError()
  try {
    await refreshBuildingStates(serverId.value, selectedVillage.value)
  } catch (error) {
    console.error('Error refreshing building states:', error)
  }
}

const handleAddBuilding = async (buildingId: string, targetLevel: number) => {
  if (!serverId.value || !selectedVillage.value) return

  const request: AddBuildingToQueueRequest = {
    villageName: selectedVillage.value,
    buildingId,
    targetLevel,
    serverId: serverId.value
  }

  try {
    await addBuildingToQueueFromCache(request)
    // buildingStates zostanie automatycznie zaktualizowany w useBuildingStates
    // Odśwież stany budynków aby mieć najnowsze dane
    await fetchBuildingStates(serverId.value, selectedVillage.value)
  } catch (error) {
    console.error('Error adding building to queue:', error)
    throw error
  }
}

const handleRemoveBuilding = async (queueItemId: number) => {
  if (!serverId.value || !selectedVillage.value) return

  try {
    await removeFromQueue(queueItemId)
    // Odśwież stany budynków aby mieć najnowsze dane
    await fetchBuildingStates(serverId.value, selectedVillage.value)
  } catch (error) {
    console.error('Error removing building from queue:', error)
    throw error
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleDrawer = () => {
  const hamburgerBtn = document.querySelector('.hamburger-btn') as HTMLElement
  hamburgerBtn?.click()
}

watch(serverId, async (newServerId) => {
  clearStates()
  selectedVillage.value = ''
  if (newServerId) {
    await fetchVillages(newServerId)
  }
}, { immediate: true })

watch(villages, (newVillages) => {
  if (newVillages.length > 0 && !selectedVillage.value) {
    selectedVillage.value = newVillages[0].name
  }
})

onMounted(async () => {
  await fetchBuildings()
  if (serverId.value) {
    await fetchVillages(serverId.value)
  }
})
</script>

<style scoped>
.no-server-selected {
  min-height: 400px;
}
</style>
