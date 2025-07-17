<template>
  <UModal title="Potwierdź usunięcie" description=" " >
    <UButton icon="i-lucide-trash-2" size="sm" color="red" variant="ghost" class="cursor-pointer"
      @click="selectVillage">
      Usuń
    </UButton>

    <template #body>
      <div class="flex items-center justify-between">

      </div>

      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600">
              Czy na pewno chcesz usunąć wioskę barbarzynską?
            </p>
            <div v-if="village" class="mt-3 p-3 bg-gray-50 rounded-md">
              <div class="text-sm">
                <div class="font-medium text-gray-900">{{ village.name }}</div>
                <div class="text-gray-500">Target: {{ village.target }}</div>
                <div class="text-gray-500">
                  Koordynaty: {{ village.coordinateX }}|{{ village.coordinateY }}
                </div>
              </div>
            </div>
            <p class="mt-3 text-sm text-gray-500">
              Ta akcja jest nieodwracalna.
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <UButton label="Usuń" color="error" :loading="loading" @click="handleConfirm" class="cursor-pointer" />
      </div>
    </template>

  </UModal>
</template>

<script setup lang="ts">
import type { BarbarianVillage } from '@/types/barbarian-villages'

export interface Props {
  village?: BarbarianVillage | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  village: null,
  loading: false
})

const emit = defineEmits<{
  'confirm': [village: BarbarianVillage]
  'selectVillage': [village: BarbarianVillage]
}>()

const handleConfirm = () => {
  if (props.village) {
    emit('confirm', props.village)
  }
}

const selectVillage = () => {
  if (props.village) {
    emit('selectVillage', props.village)
  }
}
</script>
