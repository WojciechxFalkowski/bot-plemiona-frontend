<template>
  <UForm :state="formData" :schema="schema" @submit="handleSubmit">
    <div class="space-y-6">
      <!-- Units by category -->
      <div v-for="(categoryUnits, category) in unitsByCategory" :key="category" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 capitalize">{{ category }}</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UFormGroup
            v-for="unit in categoryUnits"
            :key="unit.key"
            :label="unit.name"
            :name="unit.key"
            :error="errors[unit.key]"
          >
            <UInput
              v-model="formData[unit.key as keyof AttackStrategyFormData]"
              type="number"
              :min="0"
              :placeholder="'0'"
              :disabled="isLoading"
            />
          </UFormGroup>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-6 border-t">
        <UButton
          type="button"
          variant="ghost"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Anuluj
        </UButton>

        <UButton
          type="submit"
          color="primary"
          :loading="isLoading"
          :disabled="!isFormValid"
        >
          {{ isEditing ? 'Zaktualizuj' : 'Utwórz' }} strategię
        </UButton>
      </div>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, readonly } from 'vue';
import { z } from 'zod';
import type { AttackStrategyFormData } from '@/types/attack-strategies';
import { EMPTY_ATTACK_STRATEGY_FORM } from '@/types/attack-strategies';
import { UNITS_BY_CATEGORY, UNIT_KEYS } from '@/config/units';

// Props
interface Props {
  initialData?: AttackStrategyFormData;
  playerVillageId?: number;
  isLoading?: boolean;
  isEditing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => EMPTY_ATTACK_STRATEGY_FORM,
  playerVillageId: undefined,
  isLoading: false,
  isEditing: false,
});

// Emits
const emit = defineEmits<{
  submit: [data: AttackStrategyFormData];
  cancel: [];
}>();

// State
const formData = ref<AttackStrategyFormData>({ ...props.initialData });
const errors = ref<Record<string, string>>({});

// Computed
const unitsByCategory = computed(() => UNITS_BY_CATEGORY);

const isFormValid = computed(() => {
  return Object.values(formData.value).some(value => value && parseInt(value) > 0);
});

// Schema for validation
const schema = z.object(
  Object.fromEntries(
    UNIT_KEYS.map(key => [
      key,
      z.string().optional().refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        { message: 'Musi być liczbą większą lub równą 0' }
      )
    ])
  )
);

// Methods
const handleSubmit = () => {
  // Convert empty strings to undefined for validation
  const cleanedData = Object.fromEntries(
    Object.entries(formData.value).map(([key, value]) => [
      key,
      value === '' ? undefined : value
    ])
  ) as unknown as AttackStrategyFormData;

  // Validate
  try {
    schema.parse(cleanedData);
    errors.value = {};
    emit('submit', cleanedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      errors.value = newErrors;
    }
  }
};

const handleCancel = () => {
  emit('cancel');
};

const resetForm = () => {
  formData.value = { ...EMPTY_ATTACK_STRATEGY_FORM };
  errors.value = {};
};

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData };
  }
}, { deep: true });

// Lifecycle
onMounted(() => {
  if (props.initialData) {
    formData.value = { ...props.initialData };
  }
});

// Expose methods for parent component
defineExpose({
  resetForm,
  formData: readonly(formData),
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
