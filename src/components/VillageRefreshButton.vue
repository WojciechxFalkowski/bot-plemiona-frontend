<template>
  <UButton icon="i-lucide-refresh-cw" label="Odśwież wioski" :loading="loading" color="secondary" variant="ghost"
    @click="handleRefresh" class="cursor-pointer" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BACKEND_URL } from '@/composables/backendUrl'

// Global auto-imported composable
declare const useToast: () => any

// Props
interface Props {
  serverId?: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  refreshCompleted: []
}>()

// Composables
const toast = useToast()

// State
const loading = ref(false)

// Methods
const handleRefresh = async () => {
  if (!props.serverId) {
    toast.add({
      title: 'Błąd',
      description: 'ServerId jest wymagany do odświeżania danych',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
    return
  }

  loading.value = true

  try {
    const response = await fetch(`${BACKEND_URL}/api/villages/${props.serverId}/refresh`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    toast.add({
      title: 'Sukces!',
      description: 'Rozpoczęto ręczne odświeżanie danych wiosek',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })

    // Emit event to parent to refresh data
    emit('refreshCompleted')

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'

    toast.add({
      title: 'Błąd odświeżania',
      description: `Błąd podczas ręcznego odświeżania: ${errorMessage}`,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>
