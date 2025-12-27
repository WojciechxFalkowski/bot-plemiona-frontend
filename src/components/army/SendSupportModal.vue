<template>
  <UModal
    :open="isOpen"
    @update:open="(value: boolean) => !value && emit('close')"
    title="Wyślij wsparcie"
    description="Wyślij pikinierów i mieczników do wybranej wioski"
  >
    <template #body>
      <div class="space-y-4">
        <!-- Form Fields Grid - 2 columns -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Target Village ID Input -->
          <UFormField
            label="ID wioski celu"
            required
            :error="targetVillageIdError"
          >
            <UInput
              v-model="formData.targetVillageId"
              placeholder="30707"
              icon="i-lucide-target"
              :color="targetVillageIdError ? 'error' : undefined"
            />
            <template #help>
              <p class="text-xs text-gray-500">Z URL: target=ID</p>
            </template>
          </UFormField>

          <!-- Package Count Input -->
          <UFormField
            label="Liczba paczek"
            required
            :error="packageCountError"
          >
            <UInput
              v-model.number="formData.packageCount"
              type="number"
              :min="1"
              placeholder="50"
              icon="i-lucide-package"
              :color="packageCountError ? 'error' : undefined"
            />
            <template #help>
              <p class="text-xs text-gray-500">Paczek do wysłania</p>
            </template>
          </UFormField>

          <!-- Package Size Input -->
          <UFormField
            label="Rozmiar paczki"
            required
            :error="packageSizeError"
          >
            <UInput
              v-model.number="formData.packageSize"
              type="number"
              :min="1"
              placeholder="100"
              icon="i-lucide-users"
              :color="packageSizeError ? 'error' : undefined"
            />
            <template #help>
              <p class="text-xs text-gray-500">Jednostek/paczka</p>
            </template>
          </UFormField>

          <!-- Max Units Per Village Input -->
          <UFormField
            label="Max z wioski"
            required
            :error="maxUnitsError"
          >
            <UInput
              v-model.number="formData.maxUnitsPerVillage"
              type="number"
              :min="1"
              placeholder="1000"
              icon="i-lucide-home"
              :color="maxUnitsError ? 'error' : undefined"
            />
            <template #help>
              <p class="text-xs text-gray-500">Max jedn./wioska</p>
            </template>
          </UFormField>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 pt-4">
          <!-- Summary Section -->
          <h4 class="text-sm font-medium text-gray-900 mb-3">Podsumowanie</h4>

          <!-- Available Packages Info -->
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600">Dostępne paczki:</span>
            <span class="font-medium">{{ totalAvailablePackages }}</span>
          </div>

          <!-- Requested Packages Info -->
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600">Żądane paczki:</span>
            <span class="font-medium">{{ formData.packageCount || 0 }}</span>
          </div>

          <!-- Total Units Info -->
          <div v-if="allocationResult && allocationResult.totalPackagesAllocated > 0" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Łącznie pikinierów:</span>
              <span class="font-medium text-green-600">{{ allocationResult.totalSpear }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Łącznie mieczników:</span>
              <span class="font-medium text-green-600">{{ allocationResult.totalSword }}</span>
            </div>
          </div>
        </div>

        <!-- Validation Result -->
        <UAlert
          v-if="showValidationResult"
          :color="allocationResult?.isValid ? 'success' : 'error'"
          :icon="allocationResult?.isValid ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
        >
          <template v-if="allocationResult?.isValid">
            <p class="font-medium">Wszystkie paczki można wysłać!</p>
            <p class="text-sm mt-1">
              {{ allocationResult.totalPackagesAllocated }} paczek z {{ allocationResult.allocations.length }} wiosek
            </p>
          </template>
          <template v-else>
            <p class="font-medium">Brak wystarczającej ilości wojska</p>
            <p class="text-sm mt-1">
              Brakuje {{ allocationResult?.missingPackages }} paczek.
              Zmniejsz liczbę paczek lub rozmiar paczki.
            </p>
          </template>
        </UAlert>

        <!-- Allocation Preview -->
        <div v-if="allocationResult?.isValid && allocationResult.allocations.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Przydział wojsk:</h4>
          <div class="max-h-48 overflow-y-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-gray-500">Wioska</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-500">Paczki</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-500">Pik.</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-500">Miecz.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="allocation in allocationResult.allocations" :key="allocation.villageId">
                  <td class="px-3 py-2 text-gray-900">{{ allocation.villageName }}</td>
                  <td class="px-3 py-2 text-right text-gray-600">{{ allocation.packagesFromVillage }}</td>
                  <td class="px-3 py-2 text-right text-green-600">{{ allocation.spearToSend }}</td>
                  <td class="px-3 py-2 text-right text-blue-600">{{ allocation.swordToSend }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Villages Warning -->
        <UAlert
          v-if="villages.length === 0"
          color="warning"
          icon="i-lucide-alert-triangle"
        >
          <p>Brak danych o wioskach. Najpierw pobierz stany wojsk.</p>
        </UAlert>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" @click="handleCancel">
          Anuluj
        </UButton>
        <UButton
          color="primary"
          :disabled="!canSubmit"
          :loading="isSending"
          @click="handleSubmit"
        >
          Wyślij wsparcie
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { VillageUnitsData } from '@/types/army-overview'
import type { SendSupportFormData, AllocationResult } from '@/types/send-support'
import { useSendSupport } from '@/composables/useSendSupport'

// Global auto-imported composable
declare const useToast: () => any

interface Props {
  isOpen: boolean
  villages: VillageUnitsData[]
  serverId: number | undefined
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()
const {
  isValidVillageId,
  calculatePackageAllocation,
  calculateTotalAvailablePackages,
  sendSupport,
  loading: isSending
} = useSendSupport()

// Form data
const formData = ref<SendSupportFormData>({
  targetVillageId: '',
  packageCount: 50,
  packageSize: 100,
  maxUnitsPerVillage: 1000
})

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formData.value = {
      targetVillageId: '',
      packageCount: 50,
      packageSize: 50,
      maxUnitsPerVillage: 1000
    }
  }
})

// Validation errors
const targetVillageIdError = computed(() => {
  if (!formData.value.targetVillageId) return undefined
  return !isValidVillageId(formData.value.targetVillageId) ? 'Nieprawidłowe ID wioski' : undefined
})

const packageCountError = computed(() => {
  if (!formData.value.packageCount) return 'Wymagane pole'
  if (formData.value.packageCount < 1) return 'Minimum 1 paczka'
  return undefined
})

const packageSizeError = computed(() => {
  if (!formData.value.packageSize) return 'Wymagane pole'
  if (formData.value.packageSize < 1) return 'Minimum 1 jednostka'
  return undefined
})

const maxUnitsError = computed(() => {
  if (!formData.value.maxUnitsPerVillage) return 'Wymagane pole'
  if (formData.value.maxUnitsPerVillage < 1) return 'Minimum 1 jednostka'
  return undefined
})

// Check if form has basic validation
const isFormValid = computed(() => {
  return !targetVillageIdError.value &&
         !packageCountError.value &&
         !packageSizeError.value &&
         !maxUnitsError.value &&
         formData.value.targetVillageId !== ''
})

// Calculate total available packages
const totalAvailablePackages = computed(() => {
  if (!formData.value.packageSize || !formData.value.maxUnitsPerVillage) return 0
  return calculateTotalAvailablePackages(
    props.villages,
    formData.value.packageSize,
    formData.value.maxUnitsPerVillage
  )
})

// Calculate allocation result
const allocationResult = computed((): AllocationResult | null => {
  if (!isFormValid.value || props.villages.length === 0) return null
  return calculatePackageAllocation(props.villages, formData.value)
})

// Show validation result only when form is filled
const showValidationResult = computed(() => {
  return isFormValid.value && props.villages.length > 0
})

// Can submit only when allocation is valid
const canSubmit = computed(() => {
  return isFormValid.value &&
         allocationResult.value?.isValid &&
         props.serverId !== undefined &&
         props.villages.length > 0
})

const showToast = (type: 'success' | 'error', message: string) => {
  if (toast && typeof toast.add === 'function') {
    toast.add({
      title: type === 'success' ? 'Sukces' : 'Błąd',
      description: message,
      icon: type === 'success' ? 'i-lucide-check-circle' : 'i-lucide-alert-circle',
      color: type === 'success' ? 'green' : 'red'
    })
  } else {
    console.log(`[${type}] ${message}`)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || !props.serverId || !allocationResult.value) return

  try {
    const response = await sendSupport(props.serverId, formData.value, allocationResult.value)

    showToast('success', response.message || 'Wsparcie zostało wysłane!')
    emit('success')
    emit('close')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    showToast('error', `Nie udało się wysłać wsparcia: ${errorMessage}`)
  }
}

const handleCancel = () => {
  emit('close')
}
</script>

