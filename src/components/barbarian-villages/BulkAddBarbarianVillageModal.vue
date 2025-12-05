<template>
  <UModal v-model:open="isModalOpen" title="Dodaj wiele wiosek" description="Wklej URL z gry Plemiona do walidacji" size="xl">
    <template #body>
      <div class="space-y-4">
        <UFormField label="URL Plemiona" required>
          <UTextarea 
            v-model="urlInput" 
            :rows="3"
            placeholder="https://pl223.plemiona.pl/game.php?village=8742&screen=map#619;523"
            class="w-full font-mono text-sm"
          />
          <template #help>
            <p>Wklej URL z gry Plemiona. System sprawdzi czy serwer i wioska są poprawne.</p>
          </template>
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="handleClose">
          Anuluj
        </UButton>
        <UButton 
          color="primary" 
          :loading="isValidating"
          :disabled="!urlInput.trim()"
          @click="handleBulkAdd"
        >
          Dodaj wioski
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBarbarianVillages } from '@/composables/useBarbarianVillages'
import type { Server } from '@/types/servers'

// Global auto-imported composable
declare const useToast: () => any

interface Props {
  isOpen: boolean
  selectedServer: Server | null
  serverId?: number
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isModalOpen = ref(props.isOpen)
const urlInput = ref('')
const isValidating = ref(false)
const { bulkCreateFromUrl } = useBarbarianVillages()
const toast = useToast()

// Sync prop with local state
watch(() => props.isOpen, (newValue) => {
  isModalOpen.value = newValue
})

// Emit close when modal closes
watch(isModalOpen, (newValue) => {
  if (!newValue) {
    emit('close')
  }
})

const handleClose = () => {
  urlInput.value = ''
  isModalOpen.value = false
}

const showError = (message: string) => {
  if (toast && typeof toast.add === 'function') {
    toast.add({
      title: 'Błąd',
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } else {
    console.error('Błąd:', message)
  }
}

const showSuccess = (message: string) => {
  if (toast && typeof toast.add === 'function') {
    toast.add({
      title: 'Sukces',
      description: message,
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  }
}

const parseUrlForVillageId = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('village')
  } catch (error) {
    return null
  }
}

const handleBulkAdd = async () => {
  if (!urlInput.value.trim()) {
    return
  }

  if (!props.serverId) {
    showError('Nie wybrano serwera')
    return
  }

  isValidating.value = true

  try {
    // Parse textarea into array of URLs (split by lines, filter empty)
    const urls = urlInput.value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)

    if (urls.length === 0) {
      showError('Nie podano żadnych URL-i')
      return
    }

    // Extract villageId from first URL (all should have the same)
    const villageId = parseUrlForVillageId(urls[0])
    if (!villageId) {
      showError('Nie można wyciągnąć villageId z URL. URL musi zawierać parametr village=')
      return
    }

    // Call backend endpoint with full DTO
    const result = await bulkCreateFromUrl({
      urls,
      serverId: props.serverId,
      villageId
    }, props.serverId)

    // Show success message
    showSuccess(`Znaleziono ${result.links.length} wiosek barbarzyńskich`)

    // Emit success event (view will handle refresh)
    emit('success')

    // Close modal
    handleClose()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas dodawania wiosek'
    showError(errorMessage)
  } finally {
    isValidating.value = false
  }
}
</script>

