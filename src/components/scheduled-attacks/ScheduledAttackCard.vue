<template>
  <UCard class="scheduled-attack-card hover:shadow-md transition-shadow">
    <template #header>
      <div class="flex justify-between items-start">
        <div class="w-full">
          <div class="flex space-x-2 justify-between items-center mb-2">
            <div class="flex items-center gap-2">
              <UBadge
                :color="getAttackTypeColor(attack.attackType)"
                variant="solid"
                size="sm"
              >
                {{ getAttackTypeLabel(attack.attackType) }}
              </UBadge>
              <UBadge
                :color="getStatusColor(attack.status)"
                variant="soft"
                size="sm"
              >
                {{ getStatusLabel(attack.status) }}
              </UBadge>
            </div>
          </div>

          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <UIcon name="i-lucide-map-pin" class="text-gray-400 w-4 h-4" />
            <span>
              {{ attack.sourceCoordinates }} → {{ attack.targetCoordinates }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Time Window -->
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-clock" class="text-gray-400 w-4 h-4" />
        <span class="text-sm text-gray-600">
          {{ formatTimeWindow(attack.sendTimeFrom, attack.sendTimeTo) }}
        </span>
      </div>

      <!-- Description -->
      <div v-if="attack.description" class="text-sm text-gray-700">
        {{ attack.description }}
      </div>

      <!-- Error Message -->
      <UAlert
        v-if="(attack.status === 'failed' || attack.status === 'expired') && attack.errorMessage"
        icon="i-lucide-alert-circle"
        :color="attack.status === 'failed' ? 'red' : 'amber'"
        variant="soft"
        :title="attack.errorMessage"
        size="sm"
      />

      <!-- Executed At -->
      <div v-if="attack.executedAt" class="flex items-center space-x-2 text-xs text-gray-500">
        <UIcon name="i-lucide-check-circle" class="w-3 h-3" />
        <span>Wykonano: {{ formatDateTime(attack.executedAt) }}</span>
      </div>

      <!-- Dates -->
      <div class="text-xs text-gray-500 space-y-1">
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-calendar-plus" class="w-3 h-3" />
          <span>Utworzono: {{ formatDateTime(attack.createdAt) }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-calendar-clock" class="w-3 h-3" />
          <span>Zaktualizowano: {{ formatDateTime(attack.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <UButton
          icon="i-lucide-external-link"
          size="sm"
          color="gray"
          variant="ghost"
          class="cursor-pointer"
          :to="attack.attackUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          URL
        </UButton>

        <UButton
          v-if="attack.status === 'pending' || attack.status === 'scheduled' || attack.status === 'failed'"
          icon="i-lucide-play"
          size="sm"
          color="green"
          variant="ghost"
          class="cursor-pointer"
          :loading="executing"
          @click="handleExecuteNow"
        >
          Wykonaj
        </UButton>

        <UButton
          icon="i-lucide-edit"
          size="sm"
          color="blue"
          variant="ghost"
          class="cursor-pointer"
          @click="() => $emit('edit', attack)"
        >
          Edytuj
        </UButton>

        <UButton
          icon="i-lucide-trash-2"
          size="sm"
          color="red"
          variant="ghost"
          class="cursor-pointer"
          @click="() => $emit('delete', attack)"
        >
          Usuń
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ScheduledAttack } from '@/types/scheduled-attacks'

interface Props {
  attack: ScheduledAttack
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

const executing = ref(false)

const handleExecuteNow = async () => {
  executing.value = true
  try {
    emit('execute-now', props.attack)
  } finally {
    executing.value = false
  }
}

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const formatTimeWindow = (from: Date, to: Date): string => {
  const fromStr = new Intl.DateTimeFormat('pl-PL', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(from))

  const toStr = new Intl.DateTimeFormat('pl-PL', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(to))

  if (from.getTime() === to.getTime()) {
    return `Dokładnie: ${fromStr}`
  }

  return `${fromStr} - ${toStr}`
}

const getStatusColor = (status: ScheduledAttack['status']): string => {
  const colors: Record<string, string> = {
    pending: 'yellow',
    scheduled: 'blue',
    executing: 'orange',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
    expired: 'amber',
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status: ScheduledAttack['status']): string => {
  const labels: Record<string, string> = {
    pending: 'Oczekujący',
    scheduled: 'Zaplanowany',
    executing: 'Wykonywany',
    completed: 'Zakończony',
    failed: 'Nieudany',
    cancelled: 'Anulowany',
    expired: 'Wygasły',
  }
  return labels[status] || status
}

const getAttackTypeColor = (type: ScheduledAttack['attackType']): string => {
  const colors: Record<string, string> = {
    off: 'red',
    fake: 'green',
    nobleman: 'blue',
    support: 'purple',
  }
  return colors[type] || 'gray'
}

const getAttackTypeLabel = (type: ScheduledAttack['attackType']): string => {
  const labels: Record<string, string> = {
    off: 'OFF',
    fake: 'FEJK',
    nobleman: 'SZLACHCIC',
    support: 'WSPARCIE',
  }
  return labels[type] || type
}
</script>

<style scoped>
.scheduled-attack-card {
  height: 100%;
}
</style>
