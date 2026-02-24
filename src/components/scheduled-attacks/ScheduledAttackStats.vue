<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg">
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 p-4">
      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'all' ? 'bg-gray-100 dark:bg-gray-800' : ''"
        @click="handleSelectFilter('all')"
        aria-label="Pokaż wszystkie ataki"
      >
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Łącznie</div>
      </button>

      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'pending' ? 'bg-yellow-50' : ''"
        @click="handleSelectFilter('pending')"
        aria-label="Pokaż oczekujące ataki"
      >
        <div class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Oczekujące</div>
      </button>

      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'scheduled' ? 'bg-blue-50' : ''"
        @click="handleSelectFilter('scheduled')"
        aria-label="Pokaż zaplanowane ataki"
      >
        <div class="text-2xl font-bold text-blue-600">{{ scheduledCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Zaplanowane</div>
      </button>

      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'executing' ? 'bg-orange-50' : ''"
        @click="handleSelectFilter('executing')"
        aria-label="Pokaż wykonywane ataki"
      >
        <div class="text-2xl font-bold text-orange-600">{{ executingCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Wykonywane</div>
      </button>

      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'completed' ? 'bg-green-50' : ''"
        @click="handleSelectFilter('completed')"
        aria-label="Pokaż zakończone ataki"
      >
        <div class="text-2xl font-bold text-green-600">{{ completedCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Zakończone</div>
      </button>

      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'failed' ? 'bg-red-50' : ''"
        @click="handleSelectFilter('failed')"
        aria-label="Pokaż nieudane ataki"
      >
        <div class="text-2xl font-bold text-red-600">{{ failedCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Nieudane</div>
      </button>

      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'cancelled' ? 'bg-gray-50' : ''"
        @click="handleSelectFilter('cancelled')"
        aria-label="Pokaż anulowane ataki"
      >
        <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ cancelledCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Anulowane</div>
      </button>

      <button
        type="button"
        class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        :class="selectedFilter === 'expired' ? 'bg-amber-50' : ''"
        @click="handleSelectFilter('expired')"
        aria-label="Pokaż wygasłe ataki"
      >
        <div class="text-2xl font-bold text-amber-600">{{ expiredCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Wygasłe</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduledAttack } from '@/types/scheduled-attacks'

interface Props {
  attacks: ScheduledAttack[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'filter-change': [filter: string]
}>()

const selectedFilter = computed(() => {
  // This will be controlled by parent component
  return 'all'
})

const totalCount = computed(() => props.attacks.length)
const pendingCount = computed(() => props.attacks.filter((a) => a.status === 'pending').length)
const scheduledCount = computed(() => props.attacks.filter((a) => a.status === 'scheduled').length)
const executingCount = computed(() => props.attacks.filter((a) => a.status === 'executing').length)
const completedCount = computed(() => props.attacks.filter((a) => a.status === 'completed').length)
const failedCount = computed(() => props.attacks.filter((a) => a.status === 'failed').length)
const cancelledCount = computed(() => props.attacks.filter((a) => a.status === 'cancelled').length)
const expiredCount = computed(() => props.attacks.filter((a) => a.status === 'expired').length)

const handleSelectFilter = (filter: string) => {
  emit('filter-change', filter)
}
</script>
