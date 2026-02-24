<script setup lang="ts">
import { computed } from 'vue'
import type { BuildingLevels, BuildQueueItem, VillageBuildingStatesResponse } from '@/types/buildings'
import { useBuildings } from '@/composables/useBuildings'

// Import building icons
import mainIcon from '@/assets/building-icons/main3.webp'
import barracksIcon from '@/assets/building-icons/barracks3.webp'
import stableIcon from '@/assets/building-icons/stable3.webp'
import garageIcon from '@/assets/building-icons/garage3.webp'
import smithIcon from '@/assets/building-icons/smith3.webp'
import placeIcon from '@/assets/building-icons/place1.webp'
import statueIcon from '@/assets/building-icons/statue1.webp'
import snobIcon from '@/assets/building-icons/snob1.webp'
import marketIcon from '@/assets/building-icons/market3.webp'
import woodIcon from '@/assets/building-icons/wood3.webp'
import stoneIcon from '@/assets/building-icons/stone3.webp'
import ironIcon from '@/assets/building-icons/iron3.webp'
import farmIcon from '@/assets/building-icons/farm3.webp'
import storageIcon from '@/assets/building-icons/storage3.webp'
import wallIcon from '@/assets/building-icons/wall3.webp'

// Global auto-imported composable
declare const useToast: () => any

interface Props {
  buildingStates: VillageBuildingStatesResponse | null
  serverId?: number
  villageName: string
  onAddBuilding: (buildingId: string, targetLevel: number) => Promise<void>
  onRemoveBuilding: (queueItemId: number) => Promise<void>
}

const props = defineProps<Props>()
const { buildings } = useBuildings()
const toast = useToast()

const buildingIdToNameMap: Record<string, string> = {
  main: 'Ratusz',
  barracks: 'Koszary',
  stable: 'Stajnia',
  garage: 'Warsztat',
  church: 'Kościół',
  snob: 'Pałac',
  smith: 'Kuźnia',
  place: 'Plac',
  statue: 'Piedestał',
  market: 'Rynek',
  wood: 'Tartak',
  stone: 'Cegielnia',
  iron: 'Huta Żelaza',
  farm: 'Zagroda',
  storage: 'Spichlerz',
  hide: 'Schowek',
  wall: 'Mur'
}

const buildingStatesList = computed(() => {
  if (!props.buildingStates) return []

  const { buildingLevels, buildQueue, databaseQueue, maxLevels } = props.buildingStates
  const buildings: Array<{
    buildingId: string
    buildingName: string
    currentLevel: number
    maxLevel: number
    gameQueueItems: Array<{ level: number; timeRemaining: string }>
    databaseQueueItems: Array<{ id: number; targetLevel: number; status: string }>
    nextAllowedLevel: number
  }> = []

  for (const [buildingId, level] of Object.entries(buildingLevels)) {
    const buildingName = buildingIdToNameMap[buildingId] || buildingId
    const maxLevel = maxLevels[buildingId] || 30

    // Znajdź wszystkie pozycje w kolejce gry dla tego budynku
    const gameQueueItems = buildQueue.filter(item => {
      const queueBuildingName = item.building.toLowerCase()
      return queueBuildingName === buildingName.toLowerCase()
    }).map(item => ({
      level: item.level,
      timeRemaining: item.timeRemaining
    }))

    // Znajdź wszystkie pozycje w kolejce bazy dla tego budynku
    const databaseQueueItems = (databaseQueue || []).filter(item =>
      item.buildingId === buildingId
    ).map(item => ({
      id: item.id,
      targetLevel: item.targetLevel,
      status: item.status
    }))

    // Oblicz następny dozwolony poziom
    const gameQueueLevel = gameQueueItems.length > 0
      ? Math.max(...gameQueueItems.map(item => item.level))
      : 0
    const databaseLevel = databaseQueueItems.length > 0
      ? Math.max(...databaseQueueItems.map(item => item.targetLevel))
      : 0
    const maxCurrentLevel = Math.max(level, gameQueueLevel, databaseLevel)
    const nextAllowedLevel = maxCurrentLevel + 1

    buildings.push({
      buildingId,
      buildingName,
      currentLevel: level,
      maxLevel,
      gameQueueItems,
      databaseQueueItems,
      nextAllowedLevel
    })
  }

  return buildings.sort((a, b) => a.buildingName.localeCompare(b.buildingName))
})

const handleIncrement = async (buildingId: string, nextLevel: number, maxLevel: number) => {
  if (nextLevel > maxLevel) {
    toast.add({
      title: 'Osiągnięto maksymalny poziom',
      description: `Budynek ${buildingIdToNameMap[buildingId]} jest już na maksymalnym poziomie ${maxLevel}`,
      color: 'amber'
    })
    return
  }

  try {
    await props.onAddBuilding(buildingId, nextLevel)
    toast.add({
      title: 'Dodano do kolejki',
      description: `${buildingIdToNameMap[buildingId]} poziom ${nextLevel} został dodany do kolejki`,
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Błąd',
      description: error instanceof Error ? error.message : 'Nie udało się dodać budynku do kolejki',
      color: 'red'
    })
  }
}

const handleDecrement = async (buildingId: string, databaseQueueItems: Array<{ id: number; targetLevel: number; status: string }>) => {
  if (databaseQueueItems.length === 0) {
    toast.add({
      title: 'Brak budynków w kolejce',
      description: `Nie ma budynków w kolejce bazy danych dla ${buildingIdToNameMap[buildingId]}`,
      color: 'amber'
    })
    return
  }

  const highestQueueItem = databaseQueueItems.reduce((max, item) =>
    item.targetLevel > max.targetLevel ? item : max
  )

  try {
    await props.onRemoveBuilding(highestQueueItem.id)
    toast.add({
      title: 'Usunięto z kolejki',
      description: `${buildingIdToNameMap[buildingId]} poziom ${highestQueueItem.targetLevel} został usunięty z kolejki`,
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Błąd',
      description: error instanceof Error ? error.message : 'Nie udało się usunąć budynku z kolejki',
      color: 'red'
    })
  }
}

const isMaxLevel = (currentLevel: number, maxLevel: number) => {
  return currentLevel >= maxLevel
}

const getBuildingIcon = (buildingId: string): string => {
  const iconMap: Record<string, string> = {
    main: mainIcon,
    barracks: barracksIcon,
    stable: stableIcon,
    garage: garageIcon,
    smith: smithIcon,
    place: placeIcon,
    statue: statueIcon,
    snob: snobIcon,
    market: marketIcon,
    wood: woodIcon,
    stone: stoneIcon,
    iron: ironIcon,
    farm: farmIcon,
    storage: storageIcon,
    wall: wallIcon
  }

  return iconMap[buildingId] || mainIcon
}
</script>

<template>
  <div class="space-y-1.5 max-h-[calc(100vh-300px)] overflow-y-auto">
    <div v-for="building in buildingStatesList" :key="building.buildingId">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
        <div class="grid grid-cols-2 sm:grid-cols-[auto_1fr_auto] gap-2 sm:gap-3 items-center p-2 sm:p-2.5">
          <!-- Left Section: Icon + Name -->
          <div class="flex items-center gap-2 flex-shrink-0 sm:justify-start justify-self-start sm:justify-self-auto min-w-[125px]">
            <div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-0.5">
              <img
                :src="getBuildingIcon(building.buildingId)"
                :alt="building.buildingName"
                class="w-full h-full object-contain"
              />
            </div>
            <div class="min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {{ building.buildingName }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                Max: {{ building.maxLevel }}
              </p>
            </div>
          </div>

          <!-- Middle Section: Statistics -->
          <div class="flex flex-row flex-wrap col-span-2 lg:col-span-1 items-center gap-x-3 gap-y-1 min-w-0 sm:justify-start justify-self-start sm:justify-self-auto order-1 lg:order-none">
            <!-- Poziom -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">Poziom:</span>
              <UBadge color="gray" variant="soft" size="xs">
                {{ building.currentLevel }}
              </UBadge>
            </div>

            <!-- W grze -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">W grze:</span>
              <UPopover v-if="building.gameQueueItems.length > 0">
                <UBadge color="blue" variant="soft" size="xs" class="cursor-pointer">
                  {{ building.gameQueueItems.length }}
                </UBadge>
                <template #panel>
                  <div class="p-2 text-sm min-w-[200px]">
                    <div class="font-semibold mb-2 text-gray-900 dark:text-white">Kolejka w grze:</div>
                    <div class="space-y-1.5">
                      <div v-for="item in building.gameQueueItems" :key="item.level" class="text-gray-700 dark:text-gray-300 flex justify-between">
                        <span>Poziom {{ item.level }}</span>
                        <span class="text-gray-500 dark:text-gray-400 text-xs">{{ item.timeRemaining }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </UPopover>
              <UBadge v-else color="gray" variant="outline" size="xs">
                0
              </UBadge>
            </div>

            <!-- W bazie -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">W bazie:</span>
              <UPopover v-if="building.databaseQueueItems.length > 0">
                <UBadge color="green" variant="soft" size="xs" class="cursor-pointer">
                  {{ building.databaseQueueItems.length }}
                </UBadge>
                <template #panel>
                  <div class="p-2 text-sm min-w-[200px]">
                    <div class="font-semibold mb-2 text-gray-900 dark:text-white">Kolejka w bazie:</div>
                    <div class="space-y-1.5">
                      <div v-for="item in building.databaseQueueItems" :key="item.id" class="text-gray-700 dark:text-gray-300 flex justify-between">
                        <span>Poziom {{ item.targetLevel }}</span>
                        <span class="text-gray-500 dark:text-gray-400 text-xs capitalize">{{ item.status }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </UPopover>
              <UBadge v-else color="gray" variant="outline" size="xs">
                0
              </UBadge>
            </div>

            <!-- Następny -->
            <div v-if="building.nextAllowedLevel <= building.maxLevel" class="flex items-center gap-1.5">
              <span class="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">Następny:</span>
              <UBadge color="amber" variant="soft" size="xs">
                {{ building.nextAllowedLevel }}
              </UBadge>
            </div>
          </div>

          <!-- Right Section: Controls -->
           <!-- justify-self: end; -->
          <div class="flex items-center gap-1.5 flex-shrink-0 justify-self-end">
            <UButton
              icon="i-lucide-minus"
              color="gray"
              variant="outline"
              size="sm"
              :disabled="building.databaseQueueItems.length === 0"
              @click="handleDecrement(building.buildingId, building.databaseQueueItems)"
              class="cursor-pointer"
            />
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="outline"
              size="sm"
              :disabled="isMaxLevel(building.currentLevel, building.maxLevel) || building.nextAllowedLevel > building.maxLevel"
              @click="handleIncrement(building.buildingId, building.nextAllowedLevel, building.maxLevel)"
              class="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


