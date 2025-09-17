<template>
  <div class="space-y-4">
    <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-4">
      <UFormField label="URL Plemiona" required>
        <UTextarea v-model="formState.url" class="w-full"
          placeholder="https://pl219.plemiona.pl/game.php?village=12208&screen=info_village&id=13184#382;509" required />
        <template #help>
          <p class="mb-2">Wklej URL z gry Plemiona zawierający informacje o wiosce barbarzynskiej</p>
        </template>
      </UFormField>
    </UForm>

    <div class="flex justify-end gap-2">
      <UButton variant="ghost" @click="handleClose">
        Anuluj
      </UButton>

      <UButton type="submit" color="primary" :loading="isSubmitting" @click="handleSubmit">
        {{ isEditing ? 'Zapisz' : 'Dodaj' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { PlayerVillage, CreatePlayerVillageData, UpdatePlayerVillageData } from '@/types/player-villages';
import { z } from 'zod';

interface Props {
  isOpen: boolean;
  village?: PlayerVillage | null;
  isEditing?: boolean;
  serverOptions: Array<{ label: string; value: number }>;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: { url: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  village: null,
  isEditing: false
});

const emit = defineEmits<Emits>();

const isSubmitting = ref(false);

const schema = z.object({
  url: z.string().min(1, 'Właściciel jest wymagany'),
});

const formState = ref({
  url: 'https://pl219.plemiona.pl/game.php?village=12208&screen=info_village&id=13184#382;509'
});

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    // Validate form
    const validatedData = schema.parse(formState.value);

    emit('save', validatedData);
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
