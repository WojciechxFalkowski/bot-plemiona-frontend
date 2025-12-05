<template>
  <UModal v-model:open="isOpenModel" title="Usuń serwer" :ui="{ width: 'sm:max-w-md' }">
    <template #body>
      <div class="space-y-4">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-600" />
          <div>
            <p class="text-sm text-gray-600 mb-2">
              Czy na pewno chcesz usunąć serwer:
            </p>
            <p class="font-semibold text-gray-900">
              {{ server?.serverName }} ({{ server?.serverCode }})
            </p>
          </div>
        </div>

        <UAlert
          icon="i-lucide-alert-circle"
          color="red"
          variant="soft"
          title="Uwaga!"
          description="Ta operacja jest nieodwracalna. Usunięcie serwera może wpłynąć na powiązane dane, takie jak wioski, wioski barbarzynskie i inne konfiguracje."
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          class="cursor-pointer"
          @click="handleClose"
        >
          Anuluj
        </UButton>
        <UButton
          color="red"
          :loading="isDeleting"
          class="cursor-pointer"
          @click="handleConfirm"
        >
          Usuń
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Server } from '@/types/servers'

interface Props {
  isOpen: boolean
  server: Server | null
  isDeleting?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'update:isOpen', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false
})

const emit = defineEmits<Emits>()

const isOpenModel = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    emit('update:isOpen', value)
    if (!value) {
      emit('close')
    }
  }
})

const handleClose = () => {
  isOpenModel.value = false
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped></style>

