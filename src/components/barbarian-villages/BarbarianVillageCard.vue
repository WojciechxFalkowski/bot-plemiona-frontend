<template>
  <UCard class="barbarian-village-card hover:shadow-md transition-shadow">
    <template #header>
      <div class="flex justify-between items-start">
        <div class="w-full">
          <div class="flex space-x-2 justify-between items-center">
            <a :href="villageProfileUrl" target="_blank" rel="noopener noreferrer"
              class="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate cursor-pointer">
              {{ village.name }}
            </a>

            <UBadge :icon="village.canAttack ? 'uiw:smile-o' : 'uiw:frown-o'" size="xs" class="py-1"
              :color="village.canAttack ? 'success' : 'error'" variant="solid">
              {{ village.canAttack ? 'ON' : 'OFF' }}
            </UBadge>
          </div>

          <p class="text-sm text-gray-500">
            Target: {{ village.target }}
          </p>
        </div>
        <!-- <UBadge :color="village.canAttack ? 'green' : 'red'" variant="soft" size="sm">
          {{ village.canAttack ? 'Można atakować' : 'Nie można atakować' }}
        </UBadge> -->

        <!-- <UChip  :color="village.canAttack ? 'success' : 'error'" size="md"> -->
        <!-- <p :color="village.canAttack ? 'green' : 'red'" variant="soft" size="sm">
            {{ village.canAttack ? 'ON' : 'OFF' }}
          </p> -->
        <!-- </UChip> -->
      </div>
    </template>

    <div class="space-y-3">
      <!-- Coordinates -->
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-map-pin" class="text-gray-400 w-4 h-4" />
        <span class="text-sm text-gray-600">
          Koordynaty: {{ village.coordinateX }}|{{ village.coordinateY }}
        </span>
      </div>

      <!-- Dates -->
      <div class="text-xs text-gray-500 space-y-1">
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-calendar-plus" class="w-3 h-3" />
          <span>Utworzono: {{ formatDate(village.createdAt) }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-calendar-clock" class="w-3 h-3" />
          <span>Zaktualizowano: {{ formatDate(village.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <UModal title="Edytuj wioskę barbarzynską" description="Edytuj wioskę barbarzynską">
          <UButton icon="i-lucide-edit" size="sm" color="blue" variant="ghost" class="cursor-pointer"
            @click="() => selectVillage(village)">
            Edytuj
          </UButton>

          <template #body>
            <BarbarianVillageModal :village="village" :loading="loading" @submit-manual="handleEdit"
              @submitManualCreate="submitManualCreate" />
          </template>
        </UModal>

        <DeleteConfirmationModal :village="village" :loading="loading" @confirm="handleDelete"
          @selectVillage="selectVillage" />
      </div>
    </template>
  </UCard>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BarbarianVillage, CreateAndUpdateBarbarianVillageDto } from '@/types/barbarian-villages'
import { useServer } from '@/composables/useServer'
import BarbarianVillageModal from './BarbarianVillageModal.vue'
import DeleteConfirmationModal from './DeleteConfirmationModal.vue'

export interface Props {
  village: BarbarianVillage
  selectedServerCode: string | null | undefined
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [village: BarbarianVillage]
  edit: [data: CreateAndUpdateBarbarianVillageDto]
  delete: [village: BarbarianVillage]
  submitManualCreate: [data: CreateAndUpdateBarbarianVillageDto]
}>()

const villageProfileUrl = computed(() => {
  const serverCode = props.selectedServerCode
  if (!serverCode) {
    return '#'
  }
  return `https://${serverCode}.plemiona.pl/game.php?village=970&screen=info_village&id=${props.village.coordinateX}#${props.village.coordinateX};${props.village.coordinateY}`
})

const isDeleteModalOpen = ref(false)
const loading = ref(false)

const selectVillage = (village: BarbarianVillage) => {
  emit('select', props.village)
}

const handleEdit = (data: CreateAndUpdateBarbarianVillageDto) => {
  emit('edit', data)
}
const handleDelete = () => {
  isDeleteModalOpen.value = false
  emit('delete', props.village)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const submitManualCreate = (data: CreateAndUpdateBarbarianVillageDto) => {
  emit('submitManualCreate', data)
}
</script>

<style></style>
