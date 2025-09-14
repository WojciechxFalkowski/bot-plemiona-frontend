<template>
  <UModal :open="isOpen" @close="handleClose" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ isEditing ? 'Edytuj Strategię Ataku' : 'Dodaj Strategię Ataku' }}
        </h3>
      </template>

      <UForm
        :schema="schema"
        :state="formState"
        @submit="handleSubmit"
        class="space-y-4"
      >
        <UFormGroup label="Serwer" required>
          <USelect
            v-model="formState.serverId"
            :options="serverOptions"
            placeholder="Wybierz serwer"
            :disabled="isEditing"
          />
        </UFormGroup>

        <UFormGroup label="ID Wioski" required>
          <UInput
            v-model="formState.villageId"
            placeholder="np. 1234"
            :disabled="isEditing"
          />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Jednostki Piechoty</h4>

            <UFormGroup label="Pikinierzy">
              <UInput
                v-model="formState.spear"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Miecznicy">
              <UInput
                v-model="formState.sword"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Topornicy">
              <UInput
                v-model="formState.axe"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Łucznicy">
              <UInput
                v-model="formState.archer"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Zwiadowcy">
              <UInput
                v-model="formState.spy"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>
          </div>

          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Jednostki Kawalerii</h4>

            <UFormGroup label="Lekka Kawaleria">
              <UInput
                v-model="formState.light"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Łucznicy Konni">
              <UInput
                v-model="formState.marcher"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Ciężka Kawaleria">
              <UInput
                v-model="formState.heavy"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <h4 class="font-medium text-gray-900 mt-6">Maszyny Oblężnicze</h4>

            <UFormGroup label="Taran">
              <UInput
                v-model="formState.ram"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Katapulta">
              <UInput
                v-model="formState.catapult"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <h4 class="font-medium text-gray-900 mt-6">Jednostki Specjalne</h4>

            <UFormGroup label="Rycerz">
              <UInput
                v-model="formState.knight"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>

            <UFormGroup label="Szlachcic">
              <UInput
                v-model="formState.snob"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormGroup>
          </div>
        </div>
      </UForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="handleClose">
            Anuluj
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            {{ isEditing ? 'Zapisz' : 'Dodaj' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type {
  PlayerVillageAttackStrategy,
  CreatePlayerVillageAttackStrategyData,
  UpdatePlayerVillageAttackStrategyData
} from '@/types/player-villages';
import { z } from 'zod';

interface Props {
  isOpen: boolean;
  strategy?: PlayerVillageAttackStrategy | null;
  isEditing?: boolean;
  serverOptions: Array<{ label: string; value: number }>;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: CreatePlayerVillageAttackStrategyData | UpdatePlayerVillageAttackStrategyData): void;
}

const props = withDefaults(defineProps<Props>(), {
  strategy: null,
  isEditing: false
});

const emit = defineEmits<Emits>();

const isSubmitting = ref(false);

const schema = z.object({
  serverId: z.number().min(1, 'Serwer jest wymagany'),
  villageId: z.string().min(1, 'ID wioski jest wymagane'),
  spear: z.number().min(0).optional(),
  sword: z.number().min(0).optional(),
  axe: z.number().min(0).optional(),
  archer: z.number().min(0).optional(),
  spy: z.number().min(0).optional(),
  light: z.number().min(0).optional(),
  marcher: z.number().min(0).optional(),
  heavy: z.number().min(0).optional(),
  ram: z.number().min(0).optional(),
  catapult: z.number().min(0).optional(),
  knight: z.number().min(0).optional(),
  snob: z.number().min(0).optional()
});

const formState = ref({
  serverId: 0,
  villageId: '',
  spear: 0,
  sword: 0,
  axe: 0,
  archer: 0,
  spy: 0,
  light: 0,
  marcher: 0,
  heavy: 0,
  ram: 0,
  catapult: 0,
  knight: 0,
  snob: 0
});

// Reset form when modal opens/closes or strategy changes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.strategy && props.isEditing) {
      formState.value = {
        serverId: props.strategy.serverId,
        villageId: props.strategy.villageId,
        spear: props.strategy.spear,
        sword: props.strategy.sword,
        axe: props.strategy.axe,
        archer: props.strategy.archer,
        spy: props.strategy.spy,
        light: props.strategy.light,
        marcher: props.strategy.marcher,
        heavy: props.strategy.heavy,
        ram: props.strategy.ram,
        catapult: props.strategy.catapult,
        knight: props.strategy.knight,
        snob: props.strategy.snob
      };
    } else {
      // Reset form for new strategy
      formState.value = {
        serverId: 0,
        villageId: '',
        spear: 0,
        sword: 0,
        axe: 0,
        archer: 0,
        spy: 0,
        light: 0,
        marcher: 0,
        heavy: 0,
        ram: 0,
        catapult: 0,
        knight: 0,
        snob: 0
      };
    }
  }
});

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    // Validate form
    const validatedData = schema.parse(formState.value);

    if (props.isEditing) {
      // Remove fields that shouldn't be updated
      const { serverId, villageId, ...updateData } = validatedData;
      emit('save', updateData);
    } else {
      emit('save', validatedData);
    }
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
