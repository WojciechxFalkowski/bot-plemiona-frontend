<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Attack Management
            </h2>
            <div class="flex space-x-2">
              <UButton
                icon="i-lucide-plus"
                variant="outline"
                size="sm"
                @click="openCreateAttackModal"
              >
                New Attack
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
          <UCard v-for="stat in attackStats" :key="stat.type">
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Active Attacks
            </h3>
            <USelectMenu
              v-model="attackFilter"
              :options="filterOptions"
              placeholder="Filter attacks"
            />
          </div>
        </template>
        <div class="space-y-4">
          <div v-for="attack in filteredAttacks" :key="attack.id"
               class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <UIcon :name="getAttackTypeIcon(attack.type)" class="w-5 h-5" />
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ attack.targetVillage }}
                  </h4>
                  <p class="text-sm text-gray-500">
                    From: {{ attack.sourceVillage }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UBadge :color="getAttackStatusColor(attack.status)" variant="subtle">
                  {{ attack.status }}
                </UBadge>
                <UDropdown :items="getAttackActions(attack)">
                  <UButton icon="i-lucide-more-vertical" size="2xs" variant="ghost" />
                </UDropdown>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Arrival:</span>
                <p class="font-medium">{{ formatDateTime(attack.arrivalTime) }}</p>
              </div>
              <div>
                <span class="text-gray-500">Distance:</span>
                <p class="font-medium">{{ attack.distance }} fields</p>
              </div>
              <div>
                <span class="text-gray-500">Duration:</span>
                <p class="font-medium">{{ attack.duration }}</p>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <div class="flex space-x-4 text-xs text-gray-500">
                <span>🗡️ {{ attack.troops.spear || 0 }}</span>
                <span>⚔️ {{ attack.troops.sword || 0 }}</span>
                <span>🪓 {{ attack.troops.axe || 0 }}</span>
                <span>🏹 {{ attack.troops.archer || 0 }}</span>
                <span>🛡️ {{ attack.troops.light || 0 }}</span>
                <span>⚡ {{ attack.troops.heavy || 0 }}</span>
              </div>
              <UProgress
                :value="(Date.now() / attack.arrivalTime.getTime()) * 100"
                :color="attack.status === 'returning' ? 'green' : 'blue'"
                class="w-24"
                size="xs"
              />
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Attack Settings
          </h3>
        </template>
        <div class="space-y-4">
          <div class="space-y-3">
            <UCheckbox
              v-model="settings.enableAutoAttack"
              label="Enable automatic attacking"
            />
            <UCheckbox
              v-model="settings.targetBarbarianVillages"
              label="Target barbarian villages"
            />
            <UCheckbox
              v-model="settings.avoidStrongPlayers"
              label="Avoid strong players"
            />
            <UCheckbox
              v-model="settings.sendReinforcements"
              label="Auto-send reinforcements"
            />
          </div>

          <UDivider />

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attack frequency (per hour):
            </label>
            <URange
              v-model="attackFrequency"
              :min="1"
              :max="10"
              :step="1"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>1/h</span>
              <span class="font-medium">{{ attackFrequency }}/h</span>
              <span>10/h</span>
            </div>
          </div>

          <UDivider />

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target selection criteria:
            </label>
            <div class="space-y-2">
              <UCheckbox
                v-model="settings.preferCloseTargets"
                label="Prefer close targets"
              />
              <UCheckbox
                v-model="settings.preferWeakTargets"
                label="Prefer weak targets"
              />
              <UCheckbox
                v-model="settings.preferHighResources"
                label="Prefer high resources"
              />
            </div>
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
          Attack History
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
                Target
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Troops
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Result
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Loot
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="attack in attackHistory" :key="attack.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(attack.completedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ attack.target }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div class="flex items-center space-x-1">
                  <UIcon :name="getAttackTypeIcon(attack.type)" class="w-4 h-4" />
                  <span>{{ attack.type }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ attack.troopsSent }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getResultColor(attack.result)"
                  variant="subtle"
                >
                  {{ attack.result }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div class="flex space-x-1">
                  <span v-if="attack.loot.wood">🪵{{ formatNumber(attack.loot.wood) }}</span>
                  <span v-if="attack.loot.stone">🧱{{ formatNumber(attack.loot.stone) }}</span>
                  <span v-if="attack.loot.iron">⚔️{{ formatNumber(attack.loot.iron) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const attackFilter = ref('all')
const attackFrequency = ref(5)

const settings = reactive({
  enableAutoAttack: false,
  targetBarbarianVillages: true,
  avoidStrongPlayers: true,
  sendReinforcements: false,
  preferCloseTargets: true,
  preferWeakTargets: true,
  preferHighResources: false
})

const filterOptions = [
  { label: 'All Attacks', value: 'all' },
  { label: 'Outgoing', value: 'outgoing' },
  { label: 'Returning', value: 'returning' },
  { label: 'Completed', value: 'completed' }
]

const attackStats = ref([
  {
    type: 'active',
    label: 'Active Attacks',
    value: 8,
    description: 'Currently ongoing attacks',
    icon: 'i-lucide-sword'
  },
  {
    type: 'completed',
    label: 'Completed Today',
    value: 23,
    description: 'Attacks completed today',
    icon: 'i-lucide-check-circle'
  },
  {
    type: 'success_rate',
    label: 'Success Rate',
    value: '87%',
    description: 'Attack success percentage',
    icon: 'i-lucide-target'
  },
  {
    type: 'total_loot',
    label: 'Total Loot',
    value: '156K',
    description: 'Resources looted today',
    icon: 'i-lucide-treasure-chest'
  }
])

const activeAttacks = ref([
  {
    id: 1,
    type: 'attack',
    sourceVillage: 'Village Alpha (502|487)',
    targetVillage: 'Barbarian Village (505|490)',
    arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    distance: 5.4,
    duration: '2h 15m',
    status: 'outgoing',
    troops: { spear: 100, sword: 50, axe: 25, archer: 0, light: 10, heavy: 0 }
  },
  {
    id: 2,
    type: 'support',
    sourceVillage: 'Village Beta (503|488)',
    targetVillage: 'Village Alpha (502|487)',
    arrivalTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
    distance: 1.4,
    duration: '45m',
    status: 'outgoing',
    troops: { spear: 200, sword: 0, axe: 0, archer: 100, light: 50, heavy: 20 }
  },
  {
    id: 3,
    type: 'attack',
    sourceVillage: 'Village Gamma (504|489)',
    targetVillage: 'Player Village (510|495)',
    arrivalTime: new Date(Date.now() - 30 * 60 * 1000),
    distance: 8.2,
    duration: '3h 20m',
    status: 'returning',
    troops: { spear: 150, sword: 75, axe: 50, archer: 25, light: 15, heavy: 5 }
  }
])

const attackHistory = ref([
  {
    id: 1,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    target: 'Barbarian Village (508|492)',
    type: 'attack',
    troopsSent: '185 units',
    result: 'victory',
    loot: { wood: 2450, stone: 1800, iron: 1200 }
  },
  {
    id: 2,
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    target: 'Player Village (512|498)',
    type: 'attack',
    troopsSent: '220 units',
    result: 'defeat',
    loot: { wood: 0, stone: 0, iron: 0 }
  },
  {
    id: 3,
    completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    target: 'Barbarian Village (506|486)',
    type: 'attack',
    troopsSent: '165 units',
    result: 'victory',
    loot: { wood: 3200, stone: 2100, iron: 1850 }
  }
])

const filteredAttacks = computed(() => {
  if (attackFilter.value === 'all') return activeAttacks.value
  return activeAttacks.value.filter(attack => attack.status === attackFilter.value)
})

const getAttackTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    attack: 'i-lucide-sword',
    support: 'i-lucide-shield',
    scout: 'i-lucide-eye'
  }
  return iconMap[type] || 'i-lucide-sword'
}

const getAttackStatusColor = (status: string): string => {
  switch (status) {
    case 'outgoing':
      return 'blue'
    case 'returning':
      return 'green'
    case 'completed':
      return 'gray'
    default:
      return 'gray'
  }
}

const getResultColor = (result: string): string => {
  switch (result) {
    case 'victory':
      return 'green'
    case 'defeat':
      return 'red'
    case 'partial':
      return 'orange'
    default:
      return 'gray'
  }
}

const getAttackActions = (attack: any) => {
  return [
    [{
      label: 'View Details',
      icon: 'i-lucide-eye',
      click: () => viewAttackDetails(attack.id)
    }],
    [{
      label: 'Cancel Attack',
      icon: 'i-lucide-x',
      click: () => cancelAttack(attack.id),
      disabled: attack.status !== 'outgoing'
    }]
  ]
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString()
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const refreshData = () => {
  // TODO: Implement data refresh
  console.log('Refreshing attack data...')
}

const openCreateAttackModal = () => {
  // TODO: Implement create attack modal
  console.log('Opening create attack modal...')
}

const viewAttackDetails = (attackId: number) => {
  // TODO: Implement view attack details
  console.log('Viewing attack details:', attackId)
}

const cancelAttack = (attackId: number) => {
  // TODO: Implement cancel attack
  console.log('Cancelling attack:', attackId)
}

const saveSettings = () => {
  // TODO: Implement settings save
  console.log('Saving attack settings...', { attackFrequency: attackFrequency.value, ...settings })
}
</script>
