<script setup lang="ts">
import { computed } from 'vue'
import type { AddBuildingToQueueRequest } from '@/types/buildings'

interface Props {
  // Form data
  selectedVillage: string
  selectedBuilding: string
  targetLevel: number
  submitting: boolean

  // Data for dropdowns
  villageItems: string[]
  buildingItems: { label: string; value: string }[]
  levelItems: number[]
  selectedBuildingData: any

  // Validation
  isFormValid: boolean

  // Server ID
  serverId?: number
}

interface Emits {
  'update:selectedVillage': [value: string]
  'update:selectedBuilding': [value: string]
  'update:targetLevel': [value: number]
  'addBuildingToQueueHandler': [request: AddBuildingToQueueRequest]
  'clear': []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSubmit = () => {
  if (!props.isFormValid || !props.serverId) return

  const request: AddBuildingToQueueRequest = {
    villageName: props.selectedVillage,
    buildingId: props.selectedBuilding,
    targetLevel: props.targetLevel,
    serverId: props.serverId
  }

  emit('addBuildingToQueueHandler', request)
}

const handleClear = () => {
  emit('clear')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Form Fields Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Village Selection -->
        <UFormField required>
          <template #label>
            <div class="flex items-center gap-2">
              <span>Wioska</span>
              <UTooltip text="Wybierz wioskę, w której chcesz zbudować budynek">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </UTooltip>
            </div>
          </template>
          <USelect :model-value="selectedVillage"
            @update:model-value="(value: string) => emit('update:selectedVillage', value)" :items="villageItems"
            placeholder="Wybierz wioskę" :searchable="true" class="w-full" />
        </UFormField>

        <!-- Building Selection -->
        <UFormField required>
          <template #label>
            <div class="flex items-center gap-2">
              <span>Budynek</span>
              <UTooltip text="Wybierz typ budynku do zbudowania">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </UTooltip>
            </div>
          </template>

          <USelectMenu :model-value="buildingItems.find(item => item.value === selectedBuilding)"
            @update:model-value="(value: any) => emit('update:selectedBuilding', typeof value === 'string' ? value : value.value)"
            :items="buildingItems" option-label="label" option-value="value" placeholder="Wybierz budynek"
            :disabled="!selectedVillage" :searchable="true" class="w-full min-h-[32px]" />
        </UFormField>

        <!-- Level Selection -->
        <UFormField required>
          <template #label>
            <div class="flex items-center gap-2">
              <span>Poziom</span>
              <UTooltip>
                <template #text>
                  <span>
                    Wybierz poziom docelowy budynku
                    <span v-if="selectedBuildingData">
                      (maks. {{ selectedBuildingData.maxLevel }})
                    </span>
                  </span>
                </template>
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </UTooltip>
            </div>
          </template>
          <USelect :model-value="targetLevel" @update:model-value="(value: number) => emit('update:targetLevel', value)"
            :items="levelItems" placeholder="Wybierz poziom" :disabled="!selectedBuilding" :searchable="false"
            class="w-full" />
        </UFormField>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-3 pt-2">
        <UButton type="button" color="error" variant="soft" @click="handleClear" :disabled="submitting"
          class="cursor-pointer">
          Wyczyść
        </UButton>

        <UButton type="submit" color="primary" :loading="submitting" :disabled="!isFormValid || submitting"
          class="cursor-pointer">
          Dodaj do kolejki
        </UButton>
      </div>
    </form>
</template>

<style></style>
