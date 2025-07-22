<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Kolejka budowania
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Zarządzaj kolejkami budowania we wszystkich wioskach
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <UButton
          icon="i-lucide-plus"
          label="Dodaj do kolejki"
          color="blue"
          variant="soft"
          @click="openAddBuildingModal"
          class="cursor-pointer"
        />
        <UButton
          icon="i-lucide-refresh-cw"
          label="Odśwież"
          :loading="loading"
          color="gray"
          variant="ghost"
          @click="refreshData"
          class="cursor-pointer"
        />
      </div>
    </div>

    <!-- Error Display -->
    <UAlert
      v-if="error"
      icon="i-lucide-alert-circle"
      color="red"
      variant="soft"
      :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
      @close="clearError"
    />

    <!-- Loading State -->
    <div v-if="loading && queues.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie kolejek budowania...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && queues.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-list-x" class="w-12 h-12 text-gray-400 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">Brak aktywnych kolejek</h3>
      <p class="mt-2 text-sm text-gray-600">
        Dodaj pierwszy budynek do kolejki używając przycisku powyżej
      </p>
    </div>

    <div v-else>
      <!-- Stats -->
      <div v-if="queues.length > 0" class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                Aktywne kolejki
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ activeQueuesCount }}
              </p>
            </div>
            <UIcon name="i-lucide-list-ordered" class="w-8 h-8 text-blue-400" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                W budowie
              </p>
              <p class="text-2xl font-bold text-green-600">
                {{ currentlyBuildingCount }}
              </p>
            </div>
            <UIcon name="i-lucide-hammer" class="w-8 h-8 text-green-400" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                Oczekujące
              </p>
              <p class="text-2xl font-bold text-orange-600">
                {{ pendingBuildingsCount }}
              </p>
            </div>
            <UIcon name="i-lucide-clock" class="w-8 h-8 text-orange-400" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ukończone dziś
              </p>
              <p class="text-2xl font-bold text-purple-600">
                {{ completedTodayCount }}
              </p>
            </div>
            <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-purple-400" />
          </div>
        </UCard>
      </div>

      <!-- Village Queues -->
      <div class="space-y-4">
        <div
          v-for="villageQueue in queues"
          :key="villageQueue.villageId"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <!-- Village Header -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-gray-400" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ villageQueue.villageName }}
                </h3>
                <UBadge
                  :color="getVillageStatusColor(villageQueue.status)"
                  variant="subtle"
                >
                  {{ getVillageStatusLabel(villageQueue.status) }}
                </UBadge>
              </div>
              <div class="flex items-center space-x-2">
                <UButton
                  icon="i-lucide-plus"
                  size="xs"
                  variant="outline"
                  @click="addBuildingToVillage(villageQueue.villageId)"
                >
                  Dodaj
                </UButton>
                <UButton
                  icon="i-lucide-pause"
                  size="xs"
                  variant="outline"
                  color="orange"
                  @click="pauseVillageQueue(villageQueue.villageId)"
                  :disabled="villageQueue.status === 'paused'"
                >
                  Pauza
                </UButton>
              </div>
            </div>
          </div>

          <!-- Buildings in Queue -->
          <div class="px-6 py-4">
            <div v-if="villageQueue.buildings.length === 0" class="text-center py-8 text-gray-500">
              <UIcon name="i-lucide-inbox" class="w-8 h-8 mx-auto mb-2" />
              <p>Brak budynków w kolejce</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(building, index) in villageQueue.buildings"
                :key="building.id"
                class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                :class="{
                  'bg-green-50 border-green-200 dark:bg-green-900/20': building.status === 'building',
                  'bg-orange-50 border-orange-200 dark:bg-orange-900/20': building.status === 'queued',
                  'bg-red-50 border-red-200 dark:bg-red-900/20': building.status === 'paused'
                }"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                    {{ index + 1 }}
                  </div>
                  <div class="flex items-center space-x-3">
                    <UIcon :name="getBuildingIcon(building.type)" class="w-6 h-6 text-gray-600" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ building.name }} (Poziom {{ building.targetLevel }})
                      </p>
                      <p class="text-sm text-gray-500">
                        <span v-if="building.status === 'building'">
                          Zakończenie: {{ formatTime(building.completionTime) }}
                        </span>
                        <span v-else-if="building.status === 'queued'">
                          Czas budowy: {{ building.duration }}
                        </span>
                        <span v-else>
                          Wstrzymano
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <UBadge
                    :color="getBuildingStatusColor(building.status)"
                    variant="subtle"
                  >
                    {{ getBuildingStatusLabel(building.status) }}
                  </UBadge>

                  <UDropdown :items="getBuildingActions(building)">
                    <UButton
                      icon="i-lucide-more-horizontal"
                      size="xs"
                      variant="ghost"
                      color="gray"
                    />
                  </UDropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Global auto-imported composable
declare const useToast: () => any

// State
const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

// Mock data - w rzeczywistej aplikacji to będzie z composable/API
const queues = ref([
  {
    villageId: 1,
    villageName: 'Wioska Alpha (502|487)',
    status: 'active',
    buildings: [
      {
        id: 1,
        type: 'barracks',
        name: 'Koszary',
        targetLevel: 15,
        status: 'building',
        completionTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        duration: '2h 45m'
      },
      {
        id: 2,
        type: 'wall',
        name: 'Mur',
        targetLevel: 12,
        status: 'queued',
        completionTime: null,
        duration: '5h 20m'
      }
    ]
  },
  {
    villageId: 2,
    villageName: 'Wioska Beta (503|488)',
    status: 'active',
    buildings: [
      {
        id: 3,
        type: 'timber_camp',
        name: 'Tartak',
        targetLevel: 20,
        status: 'building',
        completionTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
        duration: '1h 15m'
      }
    ]
  },
  {
    villageId: 3,
    villageName: 'Wioska Gamma (504|489)',
    status: 'paused',
    buildings: [
      {
        id: 4,
        type: 'warehouse',
        name: 'Magazyn',
        targetLevel: 18,
        status: 'paused',
        completionTime: null,
        duration: '3h 30m'
      }
    ]
  }
])

// Computed stats
const activeQueuesCount = computed(() =>
  queues.value.filter(q => q.status === 'active').length
)

const currentlyBuildingCount = computed(() =>
  queues.value.reduce((count, q) =>
    count + q.buildings.filter(b => b.status === 'building').length, 0
  )
)

const pendingBuildingsCount = computed(() =>
  queues.value.reduce((count, q) =>
    count + q.buildings.filter(b => b.status === 'queued').length, 0
  )
)

const completedTodayCount = computed(() => 12) // Mock data

// Helper functions
const getBuildingIcon = (buildingType: string): string => {
  const iconMap: Record<string, string> = {
    barracks: 'i-lucide-shield',
    wall: 'i-lucide-castle',
    timber_camp: 'i-lucide-tree-pine',
    clay_pit: 'i-lucide-mountain',
    iron_mine: 'i-lucide-pickaxe',
    warehouse: 'i-lucide-warehouse',
    farm: 'i-lucide-wheat',
    headquarters: 'i-lucide-building'
  }
  return iconMap[buildingType] || 'i-lucide-building'
}

const getVillageStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'green'
    case 'paused': return 'orange'
    case 'error': return 'red'
    default: return 'gray'
  }
}

const getVillageStatusLabel = (status: string): string => {
  switch (status) {
    case 'active': return 'Aktywna'
    case 'paused': return 'Wstrzymana'
    case 'error': return 'Błąd'
    default: return 'Nieznany'
  }
}

const getBuildingStatusColor = (status: string): string => {
  switch (status) {
    case 'building': return 'green'
    case 'queued': return 'blue'
    case 'paused': return 'orange'
    case 'error': return 'red'
    default: return 'gray'
  }
}

const getBuildingStatusLabel = (status: string): string => {
  switch (status) {
    case 'building': return 'W budowie'
    case 'queued': return 'W kolejce'
    case 'paused': return 'Wstrzymano'
    case 'error': return 'Błąd'
    default: return 'Nieznany'
  }
}

const formatTime = (date: Date | null): string => {
  if (!date) return 'Nieznany'

  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff <= 0) return 'Zakończono'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const getBuildingActions = (building: any) => {
  return [
    [{
      label: 'Przenieś w górę',
      icon: 'i-lucide-arrow-up',
      click: () => moveBuildingUp(building.id),
      disabled: building.status === 'building'
    }],
    [{
      label: 'Przenieś w dół',
      icon: 'i-lucide-arrow-down',
      click: () => moveBuildingDown(building.id),
      disabled: building.status === 'building'
    }],
    [{
      label: 'Usuń z kolejki',
      icon: 'i-lucide-trash-2',
      click: () => removeBuilding(building.id),
      disabled: building.status === 'building'
    }]
  ]
}

// Actions
const refreshData = async () => {
  try {
    loading.value = true
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Kolejki budowania zostały zaktualizowane',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch (err) {
    error.value = 'Nie udało się odświeżyć kolejek budowania'
    toast.add({
      title: 'Błąd odświeżania',
      description: 'Nie udało się zaktualizować kolejek',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

const clearError = () => {
  error.value = null
}

const openAddBuildingModal = () => {
  // TODO: Implement add building modal
  console.log('Opening add building modal...')
}

const addBuildingToVillage = (villageId: number) => {
  // TODO: Implement add building to specific village
  console.log('Adding building to village:', villageId)
}

const pauseVillageQueue = (villageId: number) => {
  // TODO: Implement pause village queue
  console.log('Pausing village queue:', villageId)
}

const moveBuildingUp = (buildingId: number) => {
  // TODO: Implement move building up in queue
  console.log('Moving building up:', buildingId)
}

const moveBuildingDown = (buildingId: number) => {
  // TODO: Implement move building down in queue
  console.log('Moving building down:', buildingId)
}

const removeBuilding = (buildingId: number) => {
  // TODO: Implement remove building from queue
  console.log('Removing building:', buildingId)
}

// Initial load
onMounted(async () => {
  await refreshData()
})
</script>
