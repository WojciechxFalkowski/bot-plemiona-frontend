<template>
  <div class="army-overview-table">
    <!-- Search Filter and Options -->
    <div class="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Szukaj po nazwie wioski..."
        class="w-full sm:w-64"
      />
      <UCheckbox
        v-model="showTraders"
        label="Pokaż kupców"
        class="flex items-center gap-2"
      />
    </div>

    <!-- Table Container with horizontal scroll for small screens -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table class="w-full min-w-[800px] divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              @click="handleSort('name')"
            >
              <div class="flex items-center gap-2">
                <span>Wioska</span>
                <span v-if="sortConfig.column === 'name'" class="text-primary-600">
                  <UIcon :name="sortConfig.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="w-3 h-3" />
                </span>
                <span v-else class="text-gray-400">
                  <UIcon name="i-lucide-arrow-up-down" class="w-3 h-3" />
                </span>
              </div>
            </th>
            <!-- Unit columns -->
            <th
              v-for="unitKey in unitKeys"
              :key="unitKey"
              class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              @click="handleSort(unitKey as SortColumn)"
            >
              <div class="flex flex-col items-center gap-1">
                <img
                  :src="getUnitIconUrl(unitKey)"
                  :alt="getUnitName(unitKey)"
                  class="w-[18px] h-[18px]"
                  :title="getUnitName(unitKey)"
                />
                <span v-if="sortConfig.column === unitKey" class="text-primary-600">
                  <UIcon :name="sortConfig.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="w-3 h-3" />
                </span>
                <span v-else class="text-gray-400">
                  <UIcon name="i-lucide-arrow-up-down" class="w-3 h-3" />
                </span>
              </div>
            </th>
            <th
              v-if="showTraders"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              @click="handleSort('traders')"
            >
              <div class="flex items-center gap-2">
                <span>Kupcy</span>
                <span v-if="sortConfig.column === 'traders'" class="text-primary-600">
                  <UIcon :name="sortConfig.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="w-3 h-3" />
                </span>
                <span v-else class="text-gray-400">
                  <UIcon name="i-lucide-arrow-up-down" class="w-3 h-3" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="village in sortedAndFilteredVillages"
            :key="village.villageId"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ village.name }}</div>
              <div class="text-xs text-gray-500">{{ village.coordinates }}</div>
            </td>
            <!-- Unit cells -->
            <td
              v-for="unitKey in unitKeys"
              :key="unitKey"
              class="px-3 py-3 whitespace-nowrap text-center"
            >
              <div class="flex items-center justify-center gap-1">
                <img
                  :src="getUnitIconUrl(unitKey)"
                  :alt="getUnitName(unitKey)"
                  class="w-[18px] h-[18px]"
                  :title="getUnitName(unitKey)"
                />
                <span class="text-sm text-gray-900">{{ village.units[unitKey] || 0 }}</span>
              </div>
            </td>
            <td v-if="showTraders" class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ village.traders.current }} / {{ village.traders.max }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="sortedAndFilteredVillages.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">Brak danych</h3>
      <p class="mt-2 text-sm text-gray-600">
        {{ searchQuery ? 'Brak wiosek spełniających kryteria wyszukiwania' : 'Brak danych o jednostkach' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VillageUnitsData, SortColumn, SortConfig, UnitKey } from '@/types/army-overview'
import { getUnitIconUrl, getUnitName } from '@/config/units'

interface Props {
	villages: VillageUnitsData[]
}

const props = defineProps<Props>()

const searchQuery = ref('')
const showTraders = ref(false)
const sortConfig = ref<SortConfig>({
	column: 'name',
	direction: 'asc'
})

const unitKeys: UnitKey[] = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'heavy', 'ram', 'catapult', 'knight', 'snob']

const filteredVillages = computed(() => {
	if (!searchQuery.value.trim()) {
		return props.villages
	}

	const query = searchQuery.value.toLowerCase().trim()
	return props.villages.filter(village =>
		village.name.toLowerCase().includes(query) ||
		village.coordinates.toLowerCase().includes(query)
	)
})

const sortedAndFilteredVillages = computed(() => {
	const villages = [...filteredVillages.value]

	// Sort by configured column (default is 'name')
	const sortColumn = sortConfig.value.column
	const sortDirection = sortConfig.value.direction

	villages.sort((a, b) => {
		let aValue: any
		let bValue: any

		if (sortColumn === 'name') {
			aValue = a.name.toLowerCase()
			bValue = b.name.toLowerCase()
		} else if (sortColumn === 'coordinates') {
			aValue = a.coordinates
			bValue = b.coordinates
		} else if (sortColumn === 'traders') {
			aValue = a.traders.current
			bValue = b.traders.current
		} else if (unitKeys.includes(sortColumn as string)) {
			aValue = a.units[sortColumn as keyof typeof a.units] || 0
			bValue = b.units[sortColumn as keyof typeof b.units] || 0
		} else {
			return 0
		}

		if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
		if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
		return 0
	})

	return villages
})

const handleSort = (column: SortColumn) => {
	if (sortConfig.value.column === column) {
		// Toggle direction if same column
		sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
	} else {
		// Set new column with ascending direction
		sortConfig.value.column = column
		sortConfig.value.direction = 'asc'
	}
}
</script>


<style scoped>
.army-overview-table {
	/* Additional styles if needed */
}
</style>

