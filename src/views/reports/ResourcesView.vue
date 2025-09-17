<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Resource Management
            </h2>
            <UButton
              icon="i-lucide-refresh-cw"
              variant="outline"
              size="sm"
              @click="refreshData"
            >
              Refresh
            </UButton>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <UCard v-for="resource in resources" :key="resource.type">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {{ resource.name }}
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ formatNumber(resource.amount) }}
                </p>
              </div>
              <UIcon
                :name="resource.icon"
                class="w-8 h-8 text-gray-400"
              />
            </div>
            <div class="mt-2">
              <div class="flex justify-between text-xs text-gray-500">
                <span>Production/h:</span>
                <span>+{{ formatNumber(resource.production) }}</span>
              </div>
              <UProgress
                :value="(resource.amount / resource.capacity) * 100"
                :color="getCapacityColor(resource.amount, resource.capacity)"
                class="mt-1"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>Capacity:</span>
                <span>{{ formatNumber(resource.capacity) }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Resource History
          </h3>
        </template>
        <div class="h-64 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <UIcon name="i-lucide-trending-up" class="w-12 h-12 mx-auto mb-2" />
            <p>Resource charts would be displayed here</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Resource Settings
          </h3>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-send resources when capacity reaches:
            </label>
            <URange
              v-model="autoSendThreshold"
              :min="50"
              :max="95"
              :step="5"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span class="font-medium">{{ autoSendThreshold }}%</span>
              <span>95%</span>
            </div>
          </div>

          <UDivider />

          <div class="space-y-3">
            <UCheckbox
              v-model="settings.enableAutoSend"
              label="Enable automatic resource sending"
            />
            <UCheckbox
              v-model="settings.prioritizeWood"
              label="Prioritize wood production"
            />
            <UCheckbox
              v-model="settings.prioritizeStone"
              label="Prioritize stone production"
            />
            <UCheckbox
              v-model="settings.prioritizeIron"
              label="Prioritize iron production"
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

    <UCard class="mt-6">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Resource Transfers
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
                From Village
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                To Village
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Resources
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="transfer in recentTransfers" :key="transfer.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(transfer.timestamp) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ transfer.fromVillage }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ transfer.toVillage }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div class="flex space-x-2">
                  <span v-if="transfer.wood">🪵 {{ formatNumber(transfer.wood) }}</span>
                  <span v-if="transfer.stone">🧱 {{ formatNumber(transfer.stone) }}</span>
                  <span v-if="transfer.iron">⚔️ {{ formatNumber(transfer.iron) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getStatusColor(transfer.status)"
                  variant="subtle"
                >
                  {{ transfer.status }}
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

const autoSendThreshold = ref(80)

const settings = reactive({
  enableAutoSend: false,
  prioritizeWood: false,
  prioritizeStone: false,
  prioritizeIron: false
})

const resources = ref([
  {
    type: 'wood',
    name: 'Wood',
    amount: 24750,
    capacity: 30000,
    production: 156,
    icon: 'i-lucide-tree-pine'
  },
  {
    type: 'stone',
    name: 'Stone',
    amount: 18320,
    capacity: 30000,
    production: 142,
    icon: 'i-lucide-gem'
  },
  {
    type: 'iron',
    name: 'Iron',
    amount: 12580,
    capacity: 30000,
    production: 98,
    icon: 'i-lucide-pickaxe'
  },
])

const recentTransfers = ref([
  {
    id: 1,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    fromVillage: 'Village Alpha (502|487)',
    toVillage: 'Village Beta (503|488)',
    wood: 5000,
    stone: 3000,
    iron: 2000,
    status: 'completed'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    fromVillage: 'Village Beta (503|488)',
    toVillage: 'Village Gamma (504|489)',
    wood: 0,
    stone: 7500,
    iron: 0,
    status: 'in-transit'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    fromVillage: 'Village Gamma (504|489)',
    toVillage: 'Village Alpha (502|487)',
    wood: 2500,
    stone: 2500,
    iron: 5000,
    status: 'failed'
  }
])

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString()
}

const getCapacityColor = (amount: number, capacity: number): string => {
  const percentage = (amount / capacity) * 100
  if (percentage >= 90) return 'red'
  if (percentage >= 70) return 'orange'
  return 'green'
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'green'
    case 'in-transit':
      return 'blue'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

const refreshData = () => {
  // TODO: Implement data refresh
  console.log('Refreshing resource data...')
}

const saveSettings = () => {
  // TODO: Implement settings save
  console.log('Saving resource settings...', { autoSendThreshold: autoSendThreshold.value, ...settings })
}
</script>
