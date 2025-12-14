<template>
  <div class="plemiona-cookies-view">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Ustawienia cookies Plemiona
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Zarządzaj cookies używanymi do autentykacji w grze Plemiona
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <UButton
          icon="i-lucide-refresh-cw"
          label="Odśwież"
          :loading="loading"
          color="gray"
          variant="ghost"
          class="cursor-pointer"
          @click="handleRefresh"
        />
        <UButton
          icon="i-lucide-save"
          label="Zapisz"
          :loading="loading"
          color="primary"
          class="cursor-pointer"
          @click="handleSaveCookies"
        />
      </div>
    </div>

    <!-- Error Display -->
    <UAlert
      v-if="error"
      icon="i-lucide-alert-circle"
      color="red"
      variant="soft"
      :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
      @close="clearError"
      class="mb-6"
    />

    <!-- Loading State -->
    <div v-if="loading && cookies.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie cookies...</p>
    </div>

    <!-- Form -->
    <div v-else>
      <PlemionaCookiesForm
        ref="cookiesFormRef"
        :is-open="true"
        :cookies="cookies"
        @save="handleSaveCookiesFromForm"
        @delete="handleDeleteCookies"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlemionaCookies } from '@/composables/usePlemionaCookies'
import type { PlemionaCookie } from '@/types/plemiona-cookies'
import PlemionaCookiesForm from '@/components/plemiona-cookies/PlemionaCookiesForm.vue'

declare const useToast: () => any

const toast = useToast()
const router = useRouter()

const {
  cookies,
  loading,
  error,
  getCookies,
  updateCookies,
  deleteCookies,
  clearError
} = usePlemionaCookies()

const cookiesFormRef = ref<InstanceType<typeof PlemionaCookiesForm> | null>(null)

const handleRefresh = async () => {
  try {
    await getCookies()
    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Lista cookies została zaktualizowana',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd odświeżania',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const handleSaveCookies = async () => {
  if (cookiesFormRef.value && typeof cookiesFormRef.value.submit === 'function') {
    await cookiesFormRef.value.submit()
  }
}

const handleSaveCookiesFromForm = async (cookiesData: PlemionaCookie[]) => {
  try {
    if (cookiesData.length === 0) {
      await deleteCookies()
      toast.add({
        title: 'Cookie usunięte',
        description: 'Cookie Plemiona zostało usunięte pomyślnie',
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    } else {
      await updateCookies(cookiesData)
      toast.add({
        title: 'Cookie zaktualizowane',
        description: 'Cookie Plemiona zostało zaktualizowane pomyślnie',
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    }
    await getCookies()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd aktualizacji cookies',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const handleDeleteCookies = async () => {
  try {
    await deleteCookies()
    toast.add({
      title: 'Cookie usunięte',
      description: 'Cookie Plemiona zostało usunięte pomyślnie',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
    await getCookies()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd usuwania cookies',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

onMounted(async () => {
  await getCookies()
})
</script>

<style scoped>
.plemiona-cookies-view {
  width: 100%;
}
</style>
