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

          <UFormField
            label="Maks. pop. / wioska"
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
              <p class="text-xs text-gray-500">Maks. zaangażowanej pop.</p>
            </template>
          </UFormField>
        </div>

        <!-- Units Definition -->
        <div class="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Skład jednej paczki</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <template v-for="unit in availableUnits" :key="unit.id">
              <UFormField :label="unit.name">
                <UInput
                  v-model.number="formData.units[unit.id]"
                  type="number"
                  :min="0"
                  :placeholder="'0'"
                />
              </UFormField>
            </template>
          </div>
          <p class="text-xs text-red-500 mt-2" v-if="noUnitsSelectedError">
            Wybierz przynajmniej jedną jednostkę!
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Koszt zagrody dla jednej paczki: {{ packagePopulationCost }}
          </p>
        </div>



        <!-- Divider -->
        <div class="border-t border-gray-200 dark:border-gray-800 pt-4">
          <!-- Summary Section -->
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Podsumowanie</h4>

          <!-- Available Packages Info -->
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-700 dark:text-gray-300 font-medium">Dostępne paczki:</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ totalAvailablePackages }}</span>
          </div>

          <!-- Requested Packages Info -->
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-700 dark:text-gray-300 font-medium">Żądane paczki:</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ formData.packageCount || 0 }}</span>
          </div>

          <!-- Total Units Info -->
          <div v-if="allocationResult && allocationResult.totalPackagesAllocated > 0" class="space-y-1">
            <div 
              v-for="(count, unit) in activeUnitsInSummary" 
              :key="unit" 
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-700 dark:text-gray-300 font-medium">Łącznie {{ getUnitName(unit) }}:</span>
              <span class="font-bold text-primary-600 dark:text-primary-400">{{ count }}</span>
            </div>
          </div>

          <!-- Validation Result -->
          <UAlert
            v-if="showValidationResult"
            :color="allocationResult?.isValid ? 'success' : 'error'"
            :icon="allocationResult?.isValid ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
            :title="allocationResult?.isValid ? 'Wszystkie paczki można wysłać!' : 'Brak wystarczającej ilości wojska'"
            :description="allocationResult?.isValid
              ? `${allocationResult.totalPackagesAllocated} paczek z ${allocationResult.allocations.length} wiosek`
              : `Brakuje ${allocationResult?.missingPackages} paczek. Zmniejsz liczbę paczek lub obniż koszty jednostek w paczce.`"
          />
        </div>

        <!-- Allocation Preview -->
        <div v-if="allocationResult?.isValid && allocationResult.allocations.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Przydział wojsk:</h4>
          <div class="max-h-48 overflow-y-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-gray-500">Wioska</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-500">Paczki</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-500" v-for="unit in configuredUnitsKeys" :key="unit">
                    {{ getUnitShortName(unit) }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="allocation in allocationResult.allocations" :key="allocation.villageId">
                  <td class="px-3 py-2 text-gray-900">{{ allocation.villageName }}</td>
                  <td class="px-3 py-2 text-right text-gray-600">{{ allocation.packagesFromVillage }}</td>
                  <td class="px-3 py-2 text-right text-green-600" v-for="unit in configuredUnitsKeys" :key="unit">
                    {{ allocation.unitsToSend[unit] || 0 }}
                  </td>
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

// Available units definition
const availableUnits = [
  { id: 'spear', name: 'Pikinier', short: 'Pik.', pop: 1 },
  { id: 'sword', name: 'Miecznik', short: 'Miecz.', pop: 1 },
  { id: 'axe', name: 'Topornik', short: 'Top.', pop: 1 },
  { id: 'archer', name: 'Łucznik', short: 'Łucz.', pop: 1 },
  { id: 'spy', name: 'Zwiadowca', short: 'Zwiad.', pop: 2 },
  { id: 'light', name: 'Lekka Kaw.', short: 'LK', pop: 4 },
  { id: 'marcher', name: 'Łucznik na koniu', short: 'ŁK', pop: 5 },
  { id: 'heavy', name: 'Ciężka Kaw.', short: 'CK', pop: 6 },
  { id: 'ram', name: 'Taran', short: 'Tar.', pop: 5 },
  { id: 'catapult', name: 'Katapulta', short: 'Kat.', pop: 8 },
  { id: 'knight', name: 'Rycerz', short: 'Ryc.', pop: 10 },
  { id: 'snob', name: 'Szlachcic', short: 'Szlach.', pop: 100 }
]

const getUnitName = (id: string | number) => availableUnits.find(u => u.id === id)?.name || id
const getUnitShortName = (id: string) => availableUnits.find(u => u.id === id)?.short || id

// Form data
const formData = ref<SendSupportFormData>({
  targetVillageId: '',
  packageCount: 50,
  maxUnitsPerVillage: 1000,
  units: {
    spear: 50,
    sword: 50
  }
})

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formData.value = {
      targetVillageId: '',
      packageCount: 50,
      maxUnitsPerVillage: 1000,
      units: {
        spear: 50,
        sword: 50
      }
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

const noUnitsSelectedError = computed(() => {
  return !Object.values(formData.value.units).some(count => count > 0)
})

const maxUnitsError = computed(() => {
  if (!formData.value.maxUnitsPerVillage) return 'Wymagane pole'
  if (formData.value.maxUnitsPerVillage < 1) return 'Minimum 1 pop.'
  return undefined
})

const packagePopulationCost = computed(() => {
  let cost = 0;
  for (const [unit, count] of Object.entries(formData.value.units)) {
    const pop = availableUnits.find(u => u.id === unit)?.pop || 1
    cost += (count || 0) * pop
  }
  return cost;
})

// Check if form has basic validation
const isFormValid = computed(() => {
  return !targetVillageIdError.value &&
         !packageCountError.value &&
         !maxUnitsError.value &&
         !noUnitsSelectedError.value &&
         formData.value.targetVillageId !== ''
})

// Calculate total available packages
const totalAvailablePackages = computed(() => {
  if (noUnitsSelectedError.value || !formData.value.maxUnitsPerVillage) return 0
  return calculateTotalAvailablePackages(
    props.villages,
    formData.value.units,
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

const activeUnitsInSummary = computed(() => {
  if (!allocationResult.value?.totalUnits) return {}
  const result: Record<string, number> = {}
  for (const [unit, count] of Object.entries(allocationResult.value.totalUnits)) {
    if (count > 0) result[unit] = count
  }
  return result
})

const configuredUnitsKeys = computed(() => {
  return Object.entries(formData.value.units)
    .filter(([_, count]) => count > 0)
    .map(([unit, _]) => unit)
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

    // Build informative message about queued task
    let successMessage = `Zadanie dodane do kolejki (pozycja ${response.queuePosition})`
    if (response.estimatedWaitTime > 0) {
      successMessage += `. Szacowany czas: ~${response.estimatedWaitTime}s`
    }
    successMessage += '. Odśwież stany wojsk ręcznie po zakończeniu zadania.'

    showToast('success', successMessage)
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

