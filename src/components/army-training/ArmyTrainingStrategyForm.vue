<template>
  <UForm :state="local" @submit="onSubmit">
    <div class="space-y-4">
      <UFormField class="mb-4" label="Wioska" name="villageId" required>
        <USelect v-model="local.villageId" :items="villageOptions" value-key="value" placeholder="Wybierz wioskę" />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UFormField v-for="key in unitKeys" :key="key" :label="labels[key]" :name="key">
          <UInput v-model="(local as any)[key]" type="number" min="0" placeholder="0" />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UFormField label="Max Total Per Unit" name="max_total_per_unit">
          <UInput v-model="local.max_total_per_unit" type="number" min="0" placeholder="Maksymalna liczba jednostek dla każdego typu osobno (puste = brak limitu)" />
        </UFormField>
        <UFormField label="Max in queue" name="max_in_queue_per_unit_overall">
          <UInput v-model="local.max_in_queue_per_unit_overall" type="number" min="0" />
        </UFormField>
      </div>

      <div class="flex items-center gap-3">
        <USwitch v-model="local.is_active" label="Aktywna" />
      </div>

      <div class="flex justify-end gap-2">
        <UButton size="md" type="button" variant="ghost" class="cursor-pointer" @click="$emit('cancel')">Anuluj</UButton>
        <UButton size="md" type="submit" color="primary" class="cursor-pointer" :loading="isLoading">{{ isEditing ? 'Zapisz' : 'Dodaj' }}</UButton>
      </div>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { ArmyTrainingStrategy, ArmyTrainingStrategyFormData } from '@/types/army-training-strategies';
import { EMPTY_ARMY_TRAINING_STRATEGY_FORM } from '@/types/army-training-strategies';

interface Props {
  isEditing?: boolean;
  isLoading?: boolean;
  serverId?: number;
  initialStrategy?: ArmyTrainingStrategy;
  villageOptions?: Array<{ label: string; value: string }>
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  isLoading: false,
});

const emit = defineEmits<{ (e: 'submit', data: any): void; (e: 'cancel'): void }>();

const unitKeys = ['spear','sword','axe','archer','light','marcher','heavy','ram','catapult','knight','snob','spy'] as const;
const labels: Record<string, string> = {
  spear: 'Włócznik', sword: 'Miecznik', axe: 'Topornik', archer: 'Łucznik', light: 'Lekka kawaleria', marcher: 'Łucznik na koniu', heavy: 'Ciężka kawaleria', ram: 'Taran', catapult: 'Katapulta', knight: 'Rycerz', snob: 'Szlachcic', spy: 'Zwiadowca'
};

const local = ref<ArmyTrainingStrategyFormData & { villageId: string }>({ ...EMPTY_ARMY_TRAINING_STRATEGY_FORM, villageId: '' });
const villageOptions = computed(() => props.villageOptions || []);

watch(() => props.initialStrategy, (s) => {
  if (!s) return;
  local.value = {
    villageId: s.villageId,
    is_active: s.is_active,
    max_total_per_unit: s.max_total_per_unit == null ? '' : String(s.max_total_per_unit),
    max_in_queue_per_unit_overall: String(s.max_in_queue_per_unit_overall),
    spear: String(s.spear || ''), sword: String(s.sword || ''), axe: String(s.axe || ''), archer: String(s.archer || ''), light: String(s.light || ''), marcher: String(s.marcher || ''), heavy: String(s.heavy || ''), ram: String(s.ram || ''), catapult: String(s.catapult || ''), knight: String(s.knight || ''), snob: String(s.snob || ''), spy: String(s.spy || ''),
  };
}, { immediate: true });

const onSubmit = () => {
  emit('submit', local.value);
};
</script>


