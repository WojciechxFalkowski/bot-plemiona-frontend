<template>
  <div class="queue-list">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie kolejki...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="queueItems.length === 0" class="text-center py-8">
      <UIcon name="i-lucide-list" class="w-6 h-6 text-gray-400 mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Kolejka jest pusta</p>
    </div>

    <!-- Queue Items -->
    <div v-else class="space-y-3">
      <div v-for="item in queueItems" :key="item.id" class="queue-item">
        <UCard class="hover:shadow-md transition-shadow">
          <!-- Desktop Layout - All in one line -->
          <div class="hidden md:flex items-center justify-between">
            <!-- Left side: Village + Building -->
            <div class="flex items-center space-x-6">
              <!-- Village Info -->
              <div class="min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">
                  {{ item.village?.name || item.villageId }}
                </h4>
                <p class="text-xs text-gray-500">
                  {{ getVillageCoordinates(item) }}
                </p>
              </div>

              <!-- Building Info -->
              <div class="text-left min-w-0">
                <p class="text-sm font-medium text-gray-900">
                  {{ item.buildingName }}
                </p>
                <p class="text-xs text-gray-500">
                  Poziom {{ item.targetLevel }}
                </p>
              </div>
            </div>

            <!-- Right side: Date + Delete Button -->
            <div class="flex items-center space-x-4">
              <!-- Date -->
              <div class="text-right min-w-0">
                <p class="text-xs text-gray-500">
                  {{ formatDate(item.createdAt) }}
                </p>
              </div>

              <!-- Delete Button -->
              <div class="flex-shrink-0">
                <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="sm"
                  :loading="deletingItemId === item.id" @click="handleDelete(item.id)"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50" />
              </div>
            </div>
          </div>

          <!-- Mobile Layout - Date on second line -->
          <div class="md:hidden">
            <div class="flex items-start justify-between">
              <!-- Left side: Village + Building -->
              <div class="flex items-start space-x-4">
                <!-- Village Info -->
                <div class="min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ item.village?.name || item.villageId }}
                  </h4>
                  <p class="text-xs text-gray-500">
                    {{ getVillageCoordinates(item) }}
                  </p>

                  <!-- Date on second line for mobile -->
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatDate(item.createdAt) }}
                  </p>
                </div>

                <!-- Building Info -->
                <div class="text-left min-w-0">
                  <p class="text-sm font-medium text-gray-900">
                    {{ item.buildingName }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Poziom {{ item.targetLevel }}
                  </p>
                </div>
              </div>

              <!-- Delete Button -->
              <div class="flex-shrink-0">
                <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="sm"
                  :loading="deletingItemId === item.id" @click="handleDelete(item.id)"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { QueueItem } from '@/composables/useQueue'

interface Props {
  queueItems: QueueItem[]
  loading?: boolean
  onDelete?: (itemId: number) => Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const deletingItemId = ref<number | null>(null)

const handleDelete = async (itemId: number) => {
  if (!props.onDelete) return

  deletingItemId.value = itemId
  try {
    await props.onDelete(itemId)
  } finally {
    deletingItemId.value = null
  }
}

const getVillageCoordinates = (item: QueueItem): string => {
  if (item.village?.coordinates) {
    return item.village.coordinates
  }

  // Fallback: try to extract coordinates from villageId if it contains them
  if (item.villageId && item.villageId.includes('|')) {
    return item.villageId
  }

  return 'Brak koordynatów'
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>

<style scoped>
.queue-list {
  @apply w-full;
}

.queue-item {
  @apply transition-all duration-200;
}

</style>
