<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-wrap gap-4 items-center">
      <UFormField label="Filtruj po statusie" name="statusFilter">
        <USelect
          v-model="statusFilter"
          :items="statusFilterOptions"
          value-key="value"
          placeholder="Wybierz status"
          class="w-48"
        />
      </UFormField>

      <UFormField label="Filtruj po typie" name="typeFilter">
        <USelect
          v-model="typeFilter"
          :items="typeFilterOptions"
          value-key="value"
          placeholder="Wybierz typ"
          class="w-48"
        />
      </UFormField>

      <UFormField label="Sortuj" name="sortBy">
        <USelect
          v-model="sortBy"
          :items="sortOptions"
          value-key="value"
          placeholder="Wybierz sortowanie"
          class="w-48"
        />
      </UFormField>
    </div>

    <!-- Loading State -->
    <div v-if="loading && filteredAttacks.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie ataków...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredAttacks.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-calendar-x" class="w-12 h-12 text-gray-400 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">Brak zaplanowanych ataków</h3>
      <p class="mt-2 text-sm text-gray-600">
        {{ attacks.length === 0 ? 'Nie ma jeszcze żadnych zaplanowanych ataków' : 'Brak ataków spełniających wybrane filtry' }}
      </p>
    </div>

    <!-- Attacks Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ScheduledAttackCard
        v-for="attack in sortedAttacks"
        :key="attack.id"
        :attack="attack"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @execute-now="handleExecuteNow"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ScheduledAttack } from '@/types/scheduled-attacks'
import ScheduledAttackCard from './ScheduledAttackCard.vue'

interface Props {
  attacks: ScheduledAttack[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  edit: [attack: ScheduledAttack]
  delete: [attack: ScheduledAttack]
  'execute-now': [attack: ScheduledAttack]
}>()

const statusFilter = ref<string>('all')
const typeFilter = ref<string>('all')
const sortBy = ref<string>('sendTimeFrom-asc')

const statusFilterOptions = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Oczekujące', value: 'pending' },
  { label: 'Zaplanowane', value: 'scheduled' },
  { label: 'Wykonywane', value: 'executing' },
  { label: 'Zakończone', value: 'completed' },
  { label: 'Nieudane', value: 'failed' },
  { label: 'Anulowane', value: 'cancelled' },
]

const typeFilterOptions = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'OFF', value: 'off' },
  { label: 'FEJK', value: 'fake' },
  { label: 'SZLACHCIC', value: 'nobleman' },
  { label: 'WSPARCIE', value: 'support' },
]

const sortOptions = [
  { label: 'Czas wysyłki (rosnąco)', value: 'sendTimeFrom-asc' },
  { label: 'Czas wysyłki (malejąco)', value: 'sendTimeFrom-desc' },
  { label: 'Data utworzenia (rosnąco)', value: 'createdAt-asc' },
  { label: 'Data utworzenia (malejąco)', value: 'createdAt-desc' },
  { label: 'Status', value: 'status-asc' },
]

const filteredAttacks = computed(() => {
  let filtered = [...props.attacks]

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((attack) => attack.status === statusFilter.value)
  }

  // Filter by type
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter((attack) => attack.attackType === typeFilter.value)
  }

  return filtered
})

const sortedAttacks = computed(() => {
  const [field, direction] = sortBy.value.split('-')
  const sorted = [...filteredAttacks.value]

  sorted.sort((a, b) => {
    let aValue: any
    let bValue: any

    if (field === 'sendTimeFrom') {
      aValue = a.sendTimeFrom.getTime()
      bValue = b.sendTimeFrom.getTime()
    } else if (field === 'createdAt') {
      aValue = a.createdAt.getTime()
      bValue = b.createdAt.getTime()
    } else if (field === 'status') {
      aValue = a.status
      bValue = b.status
    } else {
      return 0
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })

  return sorted
})

const handleEdit = (attack: ScheduledAttack) => {
  emit('edit', attack)
}

const handleDelete = (attack: ScheduledAttack) => {
  emit('delete', attack)
}

const handleExecuteNow = (attack: ScheduledAttack) => {
  emit('execute-now', attack)
}
</script>
