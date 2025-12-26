<template>
  <div class="army-overview-list">
    <!-- Search Filter and Options -->
    <div class="mb-4 flex flex-col gap-4">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Szukaj po nazwie wioski..."
        class="w-full"
      />
      <UCheckbox
        v-model="showTraders"
        label="Pokaż kupców"
        class="flex items-center gap-2"
      />
    </div>

    <!-- Village List -->
    <div class="space-y-3">
      <UCard
        v-for="village in filteredVillages"
        :key="village.villageId"
        class="hover:shadow-md transition-shadow"
      >
        <div class="p-3 space-y-2">
          <!-- Village Header -->
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-medium text-gray-900 truncate">
                {{ village.name }}
              </h4>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ village.coordinates }}
              </p>
            </div>
            <!-- Traders Badge (only if showTraders is true) -->
            <div v-if="showTraders" class="flex flex-col items-end gap-1 ml-2">
              <UBadge color="green" variant="soft" size="xs">
                Kupcy: {{ village.traders.current }}/{{ village.traders.max }}
              </UBadge>
            </div>
          </div>

          <!-- Units - Horizontal layout with icons -->
          <div class="pt-2 border-t border-gray-100">
            <div class="flex flex-wrap gap-2">
              <template
                v-for="unitKey in unitKeys"
                :key="unitKey"
              >
                <div
                  v-if="village.units[unitKey] !== undefined && village.units[unitKey] > 0"
                  class="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                  :title="getUnitName(unitKey)"
                >
                  <img
                    :src="getUnitIconUrl(unitKey)"
                    :alt="getUnitName(unitKey)"
                    class="w-[18px] h-[18px] flex-shrink-0"
                  />
                  <span class="text-xs font-medium text-gray-700">
                    {{ village.units[unitKey] || 0 }}
                  </span>
                </div>
              </template>
              <div
                v-if="getActiveUnitsCount(village) === 0"
                class="text-xs text-gray-400 italic"
              >
                Brak jednostek
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div v-if="filteredVillages.length === 0" class="text-center py-12">
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
import type { VillageUnitsData } from '@/types/army-overview'
import { getUnitIconUrl, getUnitName, UNIT_KEYS } from '@/config/units'

interface Props {
	villages: VillageUnitsData[]
}

const props = defineProps<Props>()

const searchQuery = ref('')
const showTraders = ref(false)

const unitKeys = UNIT_KEYS.filter(key => 
	['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'heavy', 'ram', 'catapult', 'knight', 'snob'].includes(key)
)

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

const getActiveUnitsCount = (village: VillageUnitsData): number => {
	return unitKeys.filter(key => {
		const value = village.units[key as keyof typeof village.units]
		return value !== undefined && value > 0
	}).length
}
</script>

<style scoped>
.army-overview-list {
	/* Additional styles if needed */
}
</style>

