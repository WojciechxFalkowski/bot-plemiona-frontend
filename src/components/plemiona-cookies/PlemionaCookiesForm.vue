<template>
  <div class="space-y-4 w-full">
    <div v-if="hasCookie" class="border border-gray-200 rounded-lg p-4 space-y-3 w-full">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium text-gray-700">
          Cookie Plemiona
        </h4>
        <UButton
          icon="i-lucide-trash-2"
          color="red"
          variant="ghost"
          size="sm"
          class="cursor-pointer"
          aria-label="Usuń cookie"
          @click="handleRemoveCookie"
        />
      </div>

      <UFormField
        label="Nazwa cookie"
        name="cookie.name"
        required
      >
        <UInput
          v-model="formState.cookie.name"
          placeholder="np. pl_auth"
          maxlength="255"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Nazwa cookie (maksymalnie 255 znaków)</p>
        </template>
      </UFormField>

      <UFormField
        label="Ścieżka cookie"
        name="cookie.path"
        required
      >
        <UInput
          v-model="formState.cookie.path"
          placeholder="np. /"
          maxlength="255"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Ścieżka cookie (maksymalnie 255 znaków)</p>
        </template>
      </UFormField>

      <UFormField
        label="Wartość cookie"
        name="cookie.value"
        required
      >
        <UInput
          v-model="formState.cookie.value"
          placeholder="np. 69a13f7d6688:631d5f23baec92d2dc8d1a4d724250f862e640b21670255261db23da7a4b19af"
          type="text"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Wartość cookie</p>
        </template>
      </UFormField>

      <UFormField
        label="Domena cookie"
        name="cookie.domain"
        required
      >
        <UInput
          v-model="formState.cookie.domain"
          placeholder="np. .plemiona.pl"
          maxlength="255"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Domena cookie (maksymalnie 255 znaków)</p>
        </template>
      </UFormField>
    </div>

    <div v-else class="border border-gray-200 rounded-lg p-4 space-y-3 w-full">
      <div class="mb-2">
        <h4 class="text-sm font-medium text-gray-700">
          Dodaj cookie Plemiona
        </h4>
        <p class="text-sm text-gray-500 mt-1">Brak zapisanego cookie. Wypełnij formularz, aby dodać cookie.</p>
      </div>

      <UFormField
        label="Nazwa cookie"
        name="cookie.name"
        required
      >
        <UInput
          v-model="formState.cookie.name"
          placeholder="np. pl_auth"
          maxlength="255"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Nazwa cookie (maksymalnie 255 znaków)</p>
        </template>
      </UFormField>

      <UFormField
        label="Ścieżka cookie"
        name="cookie.path"
        required
      >
        <UInput
          v-model="formState.cookie.path"
          placeholder="np. /"
          maxlength="255"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Ścieżka cookie (maksymalnie 255 znaków)</p>
        </template>
      </UFormField>

      <UFormField
        label="Wartość cookie"
        name="cookie.value"
        required
      >
        <UInput
          v-model="formState.cookie.value"
          placeholder="np. 69a13f7d6688:631d5f23baec92d2dc8d1a4d724250f862e640b21670255261db23da7a4b19af"
          type="text"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Wartość cookie</p>
        </template>
      </UFormField>

      <UFormField
        label="Domena cookie"
        name="cookie.domain"
        required
      >
        <UInput
          v-model="formState.cookie.domain"
          placeholder="np. .plemiona.pl"
          maxlength="255"
          required
          class="w-full"
        />
        <template #help>
          <p class="text-sm text-gray-500">Domena cookie (maksymalnie 255 znaków)</p>
        </template>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import type { PlemionaCookie, PlemionaCookieResponse } from '@/types/plemiona-cookies'

interface Props {
  isOpen: boolean
  cookies?: PlemionaCookieResponse[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', cookies: PlemionaCookie[]): void
  (e: 'delete'): void
}

const props = withDefaults(defineProps<Props>(), {
  cookies: () => []
})

const emit = defineEmits<Emits>()

const isSubmitting = ref(false)

const cookieSchema = z.object({
  name: z.string().min(1, 'Nazwa cookie jest wymagana').max(255, 'Nazwa cookie może mieć maksymalnie 255 znaków'),
  path: z.string().min(1, 'Ścieżka cookie jest wymagana').max(255, 'Ścieżka cookie może mieć maksymalnie 255 znaków'),
  value: z.string().min(1, 'Wartość cookie jest wymagana'),
  domain: z.string().min(1, 'Domena cookie jest wymagana').max(255, 'Domena cookie może mieć maksymalnie 255 znaków')
})

const schema = z.object({
  cookie: cookieSchema
})

const formState = ref<{ cookie: PlemionaCookie }>({
  cookie: {
    name: '',
    path: '/',
    value: '',
    domain: '.plemiona.pl'
  }
})

const hasCookie = computed(() => {
  return props.cookies && props.cookies.length > 0
})

const submitForm = async () => {
  await handleSubmit()
}

defineExpose({
  submit: submitForm
})

watch([() => props.isOpen, () => props.cookies], () => {
  if (props.isOpen) {
    if (props.cookies && props.cookies.length > 0) {
      const firstCookie = props.cookies[0]
      formState.value = {
        cookie: {
          name: firstCookie.name,
          path: firstCookie.path,
          value: firstCookie.value,
          domain: firstCookie.domain
        }
      }
    } else {
      formState.value = {
        cookie: {
          name: '',
          path: '/',
          value: '',
          domain: '.plemiona.pl'
        }
      }
    }
  }
}, { immediate: true })

const handleRemoveCookie = () => {
  formState.value = {
    cookie: {
      name: '',
      path: '/',
      value: '',
      domain: '.plemiona.pl'
    }
  }
  emit('delete')
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    if (formState.value.cookie.name && formState.value.cookie.value && formState.value.cookie.domain && formState.value.cookie.path) {
      const validatedData = schema.parse(formState.value)
      emit('save', [validatedData.cookie])
    } else {
      emit('save', [])
    }
  } catch (error) {
    console.error('Validation error:', error)
    throw error
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped></style>
