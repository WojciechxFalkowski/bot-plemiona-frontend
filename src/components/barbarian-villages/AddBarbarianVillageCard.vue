<template>
  <UModal v-model:open="isModalOpen" title="Dodaj wioskę barbarzynską" description="Dodaj nową wioskę barbarzynską do listy">
    <!-- Trigger button -->
    <UButton variant="ghost" class="w-full h-auto p-0">
      <div class="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer w-full">
        <div class="text-center">
          <UIcon name="i-lucide-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Dodaj wioskę barbarzynską
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Kliknij aby dodać nową wioskę barbarzynską
          </p>
        </div>
      </div>
    </UButton>

    <!-- Modal content -->
    <template #body>
      <BarbarianVillageModal
        :village="null"
        :loading="loading"
        @submit-manual="handleSubmitManual"
        @submit-url="handleSubmitUrl"
        @submitManualCreate="handleSubmitManual"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  CreateAndUpdateBarbarianVillageDto,
  CreateBarbarianVillageFromUrlDto
} from '@/types/barbarian-villages'
import BarbarianVillageModal from './BarbarianVillageModal.vue'

export interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'submit-manual': [data: CreateAndUpdateBarbarianVillageDto]
  'submit-url': [data: CreateBarbarianVillageFromUrlDto]
}>()

const isModalOpen = ref(false)

const handleSubmitManual = (data: CreateAndUpdateBarbarianVillageDto) => {
  emit('submit-manual', data)
  isModalOpen.value = false
}

const handleSubmitUrl = (data: CreateBarbarianVillageFromUrlDto) => {
  emit('submit-url', data)
  isModalOpen.value = false
}
</script>
