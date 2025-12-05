<template>
  <div class="space-y-4">
    <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-4">
      <UFormField label="ID serwera" required>
        <UInput
          v-model="formState.id"
          type="number"
          min="1"
          placeholder="np. 216"
          :disabled="isEditing"
          required
        />
        <template #help>
          <p class="text-sm text-gray-500">Unikalny identyfikator serwera (liczba całkowita)</p>
        </template>
      </UFormField>

      <UFormField label="Kod serwera" required>
        <UInput
          v-model="formState.serverCode"
          placeholder="np. pl216"
          maxlength="10"
          required
        />
        <template #help>
          <p class="text-sm text-gray-500">Kod serwera (maksymalnie 10 znaków)</p>
        </template>
      </UFormField>

      <UFormField label="Nazwa serwera" required>
        <UInput
          v-model="formState.serverName"
          placeholder="np. Świat 216"
          maxlength="100"
          required
        />
        <template #help>
          <p class="text-sm text-gray-500">Nazwa serwera (maksymalnie 100 znaków)</p>
        </template>
      </UFormField>

      <UFormField label="Status">
        <UCheckbox
          v-model="formState.isActive"
          label="Serwer jest aktywny"
        />
        <template #help>
          <p class="text-sm text-gray-500">Zaznacz, jeśli serwer ma być aktywny</p>
        </template>
      </UFormField>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { z } from 'zod'
import type { Server, CreateServerDto, UpdateServerDto } from '@/types/servers'

interface Props {
  isOpen: boolean
  server?: Server | null
  isEditing?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: CreateServerDto | UpdateServerDto): void
}

const props = withDefaults(defineProps<Props>(), {
  server: null,
  isEditing: false
})

const emit = defineEmits<Emits>()

const isSubmitting = ref(false)

const submitForm = async () => {
  await handleSubmit()
}

defineExpose({
  submit: submitForm
})

const schema = z.object({
  id: z.number().int().positive('ID serwera musi być liczbą dodatnią'),
  serverCode: z.string().min(1, 'Kod serwera jest wymagany').max(10, 'Kod serwera może mieć maksymalnie 10 znaków'),
  serverName: z.string().min(1, 'Nazwa serwera jest wymagana').max(100, 'Nazwa serwera może mieć maksymalnie 100 znaków'),
  isActive: z.boolean().optional()
})

const formState = ref<CreateServerDto>({
  id: 0,
  serverCode: '',
  serverName: '',
  isActive: true
})

watch([() => props.isOpen, () => props.server], () => {
  if (props.isOpen) {
    if (props.isEditing && props.server) {
      formState.value = {
        id: props.server.id,
        serverCode: props.server.serverCode,
        serverName: props.server.serverName,
        isActive: props.server.isActive
      }
    } else {
      formState.value = {
        id: 0,
        serverCode: '',
        serverName: '',
        isActive: true
      }
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    const validatedData = schema.parse(formState.value)

    if (props.isEditing) {
      const updateData: UpdateServerDto = {
        serverCode: validatedData.serverCode,
        serverName: validatedData.serverName,
        isActive: validatedData.isActive
      }
      emit('save', updateData)
    } else {
      emit('save', validatedData as CreateServerDto)
    }
  } catch (error) {
    console.error('Validation error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped></style>

