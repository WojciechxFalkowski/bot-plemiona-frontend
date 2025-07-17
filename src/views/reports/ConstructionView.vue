<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Construction Management
            </h2>
            <div class="flex space-x-2">
              <UButton
                icon="i-lucide-plus"
                variant="outline"
                size="sm"
                @click="openAddBuildingModal"
              >
                Add to Queue
              </UButton>
              <UButton
                icon="i-lucide-refresh-cw"
                variant="outline"
                size="sm"
                @click="refreshData"
              >
                Refresh
              </UButton>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <UCard v-for="stat in constructionStats" :key="stat.type">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {{ stat.label }}
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ stat.value }}
                </p>
              </div>
              <UIcon
                :name="stat.icon"
                class="w-8 h-8 text-gray-400"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ stat.description }}
            </p>
          </UCard>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Active Construction Queues
          </h3>
        </template>
        <div class="space-y-4">
          <div v-for="village in villagesWithQueue" :key="village.id" class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ village.name }}
              </h4>
              <UBadge :color="village.status === 'active' ? 'green' : 'gray'" variant="subtle">
                {{ village.status }}
              </UBadge>
            </div>
            <div class="space-y-2">
              <div v-for="building in village.queue" :key="building.id" class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <UIcon :name="getBuildingIcon(building.type)" class="w-4 h-4" />
                  <span class="text-sm">{{ building.name }} (Level {{ building.level }})</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">{{ building.timeRemaining }}</span>
                  <UButton
                    icon="i-lucide-x"
                    size="2xs"
                    color="red"
                    variant="ghost"
                    @click="removeFromQueue(village.id, building.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Construction Settings
          </h3>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-build priority order:
            </label>
            <div class="space-y-2">
              <div v-for="(priority, index) in buildPriorities" :key="priority.id"
                   class="flex items-center justify-between p-2 border rounded">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium">{{ index + 1 }}.</span>
                  <UIcon :name="getBuildingIcon(priority.type)" class="w-4 h-4" />
                  <span class="text-sm">{{ priority.name }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <UButton
                    icon="i-lucide-arrow-up"
                    size="2xs"
                    variant="ghost"
                    :disabled="index === 0"
                    @click="movePriority(index, -1)"
                  />
                  <UButton
                    icon="i-lucide-arrow-down"
                    size="2xs"
                    variant="ghost"
                    :disabled="index === buildPriorities.length - 1"
                    @click="movePriority(index, 1)"
                  />
                </div>
              </div>
            </div>
          </div>

          <UDivider />

          <div class="space-y-3">
            <UCheckbox
              v-model="settings.enableAutoBuild"
              label="Enable automatic building construction"
            />
            <UCheckbox
              v-model="settings.prioritizeDefense"
              label="Prioritize defensive buildings"
            />
            <UCheckbox
              v-model="settings.balancedGrowth"
              label="Maintain balanced village growth"
            />
            <UCheckbox
              v-model="settings.pauseOnAttack"
              label="Pause construction during attacks"
            />
          </div>

          <UButton
            block
            color="primary"
            @click="saveSettings"
          >
            Save Settings
          </UButton>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Construction History
        </h3>
      </template>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date/Time
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Village
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Building
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Level
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="construction in constructionHistory" :key="construction.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(construction.completedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ construction.village }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div class="flex items-center space-x-2">
                  <UIcon :name="getBuildingIcon(construction.buildingType)" class="w-4 h-4" />
                  <span>{{ construction.buildingName }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ construction.fromLevel }} → {{ construction.toLevel }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ construction.duration }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getStatusColor(construction.status)"
                  variant="subtle"
                >
                  {{ construction.status }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const settings = reactive({
  enableAutoBuild: false,
  prioritizeDefense: false,
  balancedGrowth: true,
  pauseOnAttack: true
})

const constructionStats = ref([
  {
    type: 'active',
    label: 'Active Queues',
    value: 5,
    description: 'Villages with active construction',
    icon: 'i-lucide-hammer'
  },
  {
    type: 'completed',
    label: 'Completed Today',
    value: 12,
    description: 'Buildings completed today',
    icon: 'i-lucide-check-circle'
  },
  {
    type: 'pending',
    label: 'Pending',
    value: 8,
    description: 'Buildings in queue',
    icon: 'i-lucide-clock'
  },
  {
    type: 'efficiency',
    label: 'Efficiency',
    value: '94%',
    description: 'Construction efficiency',
    icon: 'i-lucide-trending-up'
  }
])

const villagesWithQueue = ref([
  {
    id: 1,
    name: 'Village Alpha (502|487)',
    status: 'active',
    queue: [
      { id: 1, type: 'barracks', name: 'Barracks', level: 15, timeRemaining: '2h 45m' },
      { id: 2, type: 'wall', name: 'Wall', level: 12, timeRemaining: '5h 20m' }
    ]
  },
  {
    id: 2,
    name: 'Village Beta (503|488)',
    status: 'active',
    queue: [
      { id: 3, type: 'timber_camp', name: 'Timber Camp', level: 20, timeRemaining: '1h 15m' }
    ]
  },
  {
    id: 3,
    name: 'Village Gamma (504|489)',
    status: 'paused',
    queue: [
      { id: 4, type: 'warehouse', name: 'Warehouse', level: 18, timeRemaining: '3h 30m' },
      { id: 5, type: 'farm', name: 'Farm', level: 25, timeRemaining: '8h 45m' }
    ]
  }
])

const buildPriorities = ref([
  { id: 1, type: 'timber_camp', name: 'Timber Camp' },
  { id: 2, type: 'clay_pit', name: 'Clay Pit' },
  { id: 3, type: 'iron_mine', name: 'Iron Mine' },
  { id: 4, type: 'warehouse', name: 'Warehouse' },
  { id: 5, type: 'farm', name: 'Farm' },
  { id: 6, type: 'barracks', name: 'Barracks' },
  { id: 7, type: 'wall', name: 'Wall' }
])

const constructionHistory = ref([
  {
    id: 1,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    village: 'Village Alpha (502|487)',
    buildingType: 'barracks',
    buildingName: 'Barracks',
    fromLevel: 13,
    toLevel: 14,
    duration: '3h 45m',
    status: 'completed'
  },
  {
    id: 2,
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    village: 'Village Beta (503|488)',
    buildingType: 'timber_camp',
    buildingName: 'Timber Camp',
    fromLevel: 18,
    toLevel: 19,
    duration: '2h 20m',
    status: 'completed'
  },
  {
    id: 3,
    completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    village: 'Village Gamma (504|489)',
    buildingType: 'wall',
    buildingName: 'Wall',
    fromLevel: 10,
    toLevel: 11,
    duration: '4h 15m',
    status: 'failed'
  }
])

const getBuildingIcon = (buildingType: string): string => {
  const iconMap: Record<string, string> = {
    barracks: 'i-lucide-shield',
    wall: 'i-lucide-castle',
    timber_camp: 'i-lucide-tree-pine',
    clay_pit: 'i-lucide-mountain',
    iron_mine: 'i-lucide-pickaxe',
    warehouse: 'i-lucide-warehouse',
    farm: 'i-lucide-wheat'
  }
  return iconMap[buildingType] || 'i-lucide-building'
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString()
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'green'
    case 'active':
    case 'pending':
      return 'blue'
    case 'failed':
    case 'cancelled':
      return 'red'
    case 'paused':
      return 'orange'
    default:
      return 'gray'
  }
}

const refreshData = () => {
  // TODO: Implement data refresh
  console.log('Refreshing construction data...')
}

const openAddBuildingModal = () => {
  // TODO: Implement add building modal
  console.log('Opening add building modal...')
}

const removeFromQueue = (villageId: number, buildingId: number) => {
  // TODO: Implement remove from queue
  console.log('Removing building from queue:', { villageId, buildingId })
}

const movePriority = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < buildPriorities.value.length) {
    const temp = buildPriorities.value[index]
    buildPriorities.value[index] = buildPriorities.value[newIndex]
    buildPriorities.value[newIndex] = temp
  }
}

const saveSettings = () => {
  // TODO: Implement settings save
  console.log('Saving construction settings...', settings)
}
</script>
