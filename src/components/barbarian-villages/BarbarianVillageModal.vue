<template>
  <div class="space-y-4">
    <!-- Mode Selection (only for create) -->
    <div v-if="!isEditMode">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Sposób dodawania
      </label>

      <UTabs :items="modeOptions" v-model="selectedMode" class="w-full" />
    </div>

    <!-- Error Display -->
    <UAlert v-if="error" icon="i-lucide-alert-circle" color="red" variant="soft" :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }" @close="error = null" />

    <!-- URL Form -->
    <form v-if="selectedMode === 'url' && !isEditMode" @submit.prevent="handleSubmitFromUrl" class="space-y-4">
      <UFormField label="URL Plemiona" required>
        <UTextarea v-model="urlForm.url" class="w-full"
          placeholder="https://pl216.plemiona.pl/game.php?village=2197&screen=info_village&id=3137#553;486" required />
        <template #help>
          <p class="mb-2">Wklej URL z gry Plemiona zawierający informacje o wiosce barbarzynskiej</p>
        </template>
      </UFormField>
    </form>

    <!-- Manual Form -->
    <form v-if="(selectedMode === 'manual')" @submit.prevent="handleSubmitManual" class="space-y-4">
      <UFormField label="Target ID" required>
        <UInput v-model="manualForm.target" :disabled="isEditMode" required />
        <template #help>
          Unikalny identyfikator wioski
        </template>
      </UFormField>

      <UFormField label="Nazwa wioski" required>
        <UInput v-model="manualForm.name" required />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Koordynata X" required>
          <UInput v-model.number="manualForm.coordinateX" type="number" min="0" max="1000" placeholder="542" required />
        </UFormField>

        <UFormField label="Koordynata Y" required>
          <UInput v-model.number="manualForm.coordinateY" type="number" min="0" max="1000" placeholder="489" required />
        </UFormField>
      </div>

      <UFormField label="Możliwość ataku">
        <UCheckbox v-model="manualForm.canAttack" label="Można atakować tę wioskę" />
      </UFormField>
    </form>
  </div>

  <div class="flex justify-end space-x-3">
    <UButton :label="isEditMode ? 'Zaktualizuj' : 'Dodaj'" :loading="loading"
      @click="selectedMode === 'manual' || isEditMode ? handleSubmitManual() : handleSubmitFromUrl()"
      class="cursor-pointer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type {
  BarbarianVillage,
  CreateAndUpdateBarbarianVillageDto,
  CreateBarbarianVillageFromUrlDto,
  CreateBarbarianVillageMethod
} from '@/types/barbarian-villages'

export interface Props {
  village?: BarbarianVillage | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  village: null,
  loading: false
})

const emit = defineEmits<{
  'submit-manual': [data: CreateAndUpdateBarbarianVillageDto]
  'submit-url': [data: CreateBarbarianVillageFromUrlDto]
  submitManualCreate: [data: CreateAndUpdateBarbarianVillageDto]
}>()

const selectedMode = ref<CreateBarbarianVillageMethod>('manual')
const error = ref<string | null>(null)

const modeOptions = [
  {
    key: 'manual',
    label: 'Formularz manualny',
    icon: 'i-lucide-edit',
    value: 'manual'
  },
  {
    key: 'url',
    label: 'Z URL Plemiona',
    icon: 'i-lucide-link',
    value: 'url'
  }
]

const isEditMode = computed(() => !!props.village)

// Forms
const urlForm = ref<CreateBarbarianVillageFromUrlDto>({
  url: ''
})

const manualForm = ref<CreateAndUpdateBarbarianVillageDto>({
  target: 'aasdas',
  name: '',
  coordinateX: 0,
  coordinateY: 0,
  canAttack: true
})

onMounted(() => {
  if (props.village) {
    // Edit mode - populate form
    manualForm.value = {
      target: props.village.target,
      name: props.village.name,
      coordinateX: props.village.coordinateX,
      coordinateY: props.village.coordinateY,
      canAttack: props.village.canAttack
    }
  } else {
    // Create mode - reset forms
    resetForms()
  }
})

const resetForms = () => {
  urlForm.value = { url: '' }
  manualForm.value = {
    target: '',
    name: '',
    coordinateX: 0,
    coordinateY: 0,
    canAttack: true
  }
  selectedMode.value = 'manual'
}

const validateManualForm = (): boolean => {
  if (!manualForm.value.target.trim()) {
    error.value = 'Target ID jest wymagany'
    return false
  }
  if (!manualForm.value.name.trim()) {
    error.value = 'Nazwa wioski jest wymagana'
    return false
  }
  if (manualForm.value.coordinateX < 0 || manualForm.value.coordinateX > 1000) {
    error.value = 'Koordynata X musi być między 0 a 1000'
    return false
  }
  if (manualForm.value.coordinateY < 0 || manualForm.value.coordinateY > 1000) {
    error.value = 'Koordynata Y musi być między 0 a 1000'
    return false
  }
  return true
}

const validateUrlForm = (): boolean => {
  if (!urlForm.value.url.trim()) {
    error.value = 'URL jest wymagany'
    return false
  }
  if (!urlForm.value.url.includes('plemiona.pl')) {
    error.value = 'URL musi być z domeny plemiona.pl'
    return false
  }
  return true
}

const handleSubmitManual = () => {
  error.value = null

  if (!validateManualForm()) {
    return
  }

  if (isEditMode.value) {
    // Edit mode - emit update data (without target)
    const updateData: CreateAndUpdateBarbarianVillageDto = {
      target: manualForm.value.target,
      name: manualForm.value.name,
      coordinateX: manualForm.value.coordinateX,
      coordinateY: manualForm.value.coordinateY,
      canAttack: manualForm.value.canAttack
    }
    emit('submit-manual', updateData)
  } else {
    console.log("submitManualCreate", manualForm.value);
    // Create mode - emit full data
    emit('submitManualCreate', { ...manualForm.value })
  }
}

const handleSubmitFromUrl = () => {
  error.value = null

  if (!validateUrlForm()) {
    return
  }

  emit('submit-url', { ...urlForm.value })
}
</script>
