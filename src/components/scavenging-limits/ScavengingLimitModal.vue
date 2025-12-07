<template>
  <div class="space-y-4">
    <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-4">
      <UFormField label="Wioska" required>
        <USelect v-model="formState.villageId" :items="props.villageOptions" value-key="value"
          placeholder="Wybierz wioskę" :disabled="isEditing" required />
        <template #help>
          <p class="text-sm text-gray-500">Wybierz wioskę z listy dostępnych wiosek</p>
        </template>
      </UFormField>

      <div class="space-y-4">
        <UFormField label="Maksymalna ilość pikinierów">
          <UInput v-model="formState.maxSpearUnits" type="number" min="0" placeholder="np. 1000" />
          <template #help>
            <p class="text-sm text-gray-500">Maksymalna ilość pikinierów do użycia w zbieractwie (opcjonalne)</p>
          </template>
        </UFormField>

        <UFormField label="Maksymalna ilość mieczników">
          <UInput v-model="formState.maxSwordUnits" type="number" min="0" placeholder="np. 500" />
          <template #help>
            <p class="text-sm text-gray-500">Maksymalna ilość mieczników do użycia w zbieractwie (opcjonalne)</p>
          </template>
        </UFormField>

        <UFormField label="Maksymalna ilość toporników">
          <UInput v-model="formState.maxAxeUnits" type="number" min="0" placeholder="np. 500" />
          <template #help>
            <p class="text-sm text-gray-500">Maksymalna ilość toporników do użycia w zbieractwie (opcjonalne)</p>
          </template>
        </UFormField>

        <UFormField label="Maksymalna ilość łuczników">
          <UInput v-model="formState.maxArcherUnits" type="number" min="0" placeholder="np. 300" />
          <template #help>
            <p class="text-sm text-gray-500">Maksymalna ilość łuczników do użycia w zbieractwie (opcjonalne)</p>
          </template>
        </UFormField>

        <UFormField label="Maksymalna ilość lekkiej kawalerii">
          <UInput v-model="formState.maxLightUnits" type="number" min="0" placeholder="np. 200" />
          <template #help>
            <p class="text-sm text-gray-500">Maksymalna ilość lekkiej kawalerii do użycia w zbieractwie (opcjonalne)</p>
          </template>
        </UFormField>

        <UFormField label="Maksymalna ilość konnych łuczników">
          <UInput v-model="formState.maxMarcherUnits" type="number" min="0" placeholder="np. 150" />
          <template #help>
            <p class="text-sm text-gray-500">Maksymalna ilość konnych łuczników do użycia w zbieractwie (opcjonalne)</p>
          </template>
        </UFormField>

        <UFormField label="Maksymalna ilość ciężkiej kawalerii">
          <UInput v-model="formState.maxHeavyUnits" type="number" min="0" placeholder="np. 100" />
          <template #help>
            <p class="text-sm text-gray-500">Maksymalna ilość ciężkiej kawalerii do użycia w zbieractwie (opcjonalne)</p>
          </template>
        </UFormField>
      </div>
    </UForm>

    <div class="flex justify-end gap-2">
      <UButton variant="ghost" class="cursor-pointer" @click="handleClose">
        Anuluj
      </UButton>

      <UButton type="submit" color="primary" :loading="isSubmitting" class="cursor-pointer" @click="handleSubmit">
        {{ isEditing ? 'Zapisz' : 'Dodaj' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { ScavengingLimit, ScavengingLimitFormData } from '@/types/scavenging-limits';
import { z } from 'zod';
import { EMPTY_SCAVENGING_LIMIT_FORM } from '@/types/scavenging-limits';

interface Props {
  isOpen: boolean;
  limit?: ScavengingLimit | null;
  isEditing?: boolean;
  serverId: number;
  villageOptions: Array<{ label: string; value: string }>;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: ScavengingLimitFormData): void;
}

const props = withDefaults(defineProps<Props>(), {
  limit: null,
  isEditing: false
});

const emit = defineEmits<Emits>();

const isSubmitting = ref(false);

// Village options are now passed as props from parent component

const validateOptionalNumber = (val: string | number | undefined): boolean => {
  if (val === undefined || val === '' || val === null) return true;
  const num = typeof val === 'string' ? parseInt(val) : val;
  return !isNaN(num) && num >= 0;
};

const schema = z.object({
  villageId: z.string().min(1, 'Wioska jest wymagana'),
  maxSpearUnits: z.union([z.string(), z.number()]).optional().refine(
    validateOptionalNumber,
    'Maksymalna ilość pikinierów musi być liczbą większą lub równą 0'
  ),
  maxSwordUnits: z.union([z.string(), z.number()]).optional().refine(
    validateOptionalNumber,
    'Maksymalna ilość mieczników musi być liczbą większą lub równą 0'
  ),
  maxAxeUnits: z.union([z.string(), z.number()]).optional().refine(
    validateOptionalNumber,
    'Maksymalna ilość toporników musi być liczbą większą lub równą 0'
  ),
  maxArcherUnits: z.union([z.string(), z.number()]).optional().refine(
    validateOptionalNumber,
    'Maksymalna ilość łuczników musi być liczbą większą lub równą 0'
  ),
  maxLightUnits: z.union([z.string(), z.number()]).optional().refine(
    validateOptionalNumber,
    'Maksymalna ilość lekkiej kawalerii musi być liczbą większą lub równą 0'
  ),
  maxMarcherUnits: z.union([z.string(), z.number()]).optional().refine(
    validateOptionalNumber,
    'Maksymalna ilość konnych łuczników musi być liczbą większą lub równą 0'
  ),
  maxHeavyUnits: z.union([z.string(), z.number()]).optional().refine(
    validateOptionalNumber,
    'Maksymalna ilość ciężkiej kawalerii musi być liczbą większą lub równą 0'
  ),
});

const formState = ref<ScavengingLimitFormData>({ ...EMPTY_SCAVENGING_LIMIT_FORM });

// Reset form when modal opens/closes or limit changes
watch([() => props.isOpen, () => props.limit], () => {
  if (props.isOpen) {
    if (props.isEditing && props.limit) {
      formState.value = {
        serverId: props.limit.serverId.toString(),
        villageId: props.limit.villageId,
        maxSpearUnits: props.limit.maxSpearUnits?.toString() || '',
        maxSwordUnits: props.limit.maxSwordUnits?.toString() || '',
        maxAxeUnits: props.limit.maxAxeUnits?.toString() || '',
        maxArcherUnits: props.limit.maxArcherUnits?.toString() || '',
        maxLightUnits: props.limit.maxLightUnits?.toString() || '',
        maxMarcherUnits: props.limit.maxMarcherUnits?.toString() || '',
        maxHeavyUnits: props.limit.maxHeavyUnits?.toString() || '',
      };
    } else {
      formState.value = {
        serverId: props.serverId.toString(),
        villageId: '',
        maxSpearUnits: '',
        maxSwordUnits: '',
        maxAxeUnits: '',
        maxArcherUnits: '',
        maxLightUnits: '',
        maxMarcherUnits: '',
        maxHeavyUnits: '',
      };
    }
  }
}, { immediate: true });


const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    // Validate form
    const validatedData = schema.parse(formState.value);

    // Add serverId from props to the form data
    const formDataWithServerId: ScavengingLimitFormData = {
      ...validatedData,
      serverId: props.serverId.toString(),
      maxSpearUnits: validatedData.maxSpearUnits?.toString() || '',
      maxSwordUnits: validatedData.maxSwordUnits?.toString() || '',
      maxAxeUnits: validatedData.maxAxeUnits?.toString() || '',
      maxArcherUnits: validatedData.maxArcherUnits?.toString() || '',
      maxLightUnits: validatedData.maxLightUnits?.toString() || '',
      maxMarcherUnits: validatedData.maxMarcherUnits?.toString() || '',
      maxHeavyUnits: validatedData.maxHeavyUnits?.toString() || '',
    };

    emit('save', formDataWithServerId);
  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  emit('close');
};
</script>
