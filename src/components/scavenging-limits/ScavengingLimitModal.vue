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

      <UFormField label="Maksymalna ilość pikinierów" required>
        <UInput v-model="formState.maxSpearUnits" type="number" min="0" placeholder="np. 1000" required />
        <template #help>
          <p class="text-sm text-gray-500">Maksymalna ilość pikinierów do użycia w zbieractwie</p>
        </template>
      </UFormField>
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

const schema = z.object({
  villageId: z.string().min(1, 'Wioska jest wymagana'),
  maxSpearUnits: z.union([z.string(), z.number()]).refine(
    (val) => {
      const num = typeof val === 'string' ? parseInt(val) : val;
      return !isNaN(num) && num >= 0;
    },
    'Maksymalna ilość pikinierów musi być liczbą większą lub równą 0'
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
        maxSpearUnits: props.limit.maxSpearUnits.toString()
      };
    } else {
      formState.value = {
        serverId: props.serverId.toString(),
        villageId: '',
        maxSpearUnits: ''
      };
    }
  }
}, { immediate: true });


const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    // Validate form
    const validatedData = schema.parse(formState.value);

    // Add serverId from props to the form data and ensure maxSpearUnits is string
    const formDataWithServerId = {
      ...validatedData,
      serverId: props.serverId.toString(),
      maxSpearUnits: validatedData.maxSpearUnits.toString()
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
