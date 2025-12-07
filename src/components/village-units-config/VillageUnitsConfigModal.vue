<template>
  <UModal 
    :open="isOpen" 
    @update:open="(value) => !value && emit('close')"
    :title="`Konfiguracja jednostek - ${config.villageName}`"
    description="Wybierz jednostki, które mają brać udział w zbieractwie dla tej wioski"
  >
    <template #body>
      <div class="space-y-4">
        <div
          v-for="unit in unitList"
          :key="unit.key"
          class="flex items-center justify-between p-4 rounded-lg border"
          :class="localUnits[unit.key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <UIcon :name="unit.icon" class="w-5 h-5" :class="localUnits[unit.key] ? 'text-green-600' : 'text-gray-400'" />
              <label class="text-sm font-medium" :class="localUnits[unit.key] ? 'text-green-900' : 'text-gray-700'">
                {{ unit.label }}
              </label>
            </div>
            <p class="text-xs text-gray-500">{{ unit.description }}</p>
          </div>
          <USwitch
            v-model="localUnits[unit.key]"
          />
        </div>

        <UAlert v-if="!hasAnyEnabled" color="red" icon="i-heroicons-exclamation-triangle">
          Przynajmniej jedna jednostka musi być włączona
        </UAlert>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" @click="handleCancel">
          Anuluj
        </UButton>
        <UButton color="primary" :disabled="!hasAnyEnabled" :loading="isUpdating" @click="handleSave">
          Zapisz
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { VillageUnitsConfig, ScavengingUnit, ScavengingUnitsConfig } from '@/types/village-units-config';

interface Props {
  isOpen: boolean;
  config: VillageUnitsConfig;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', units: ScavengingUnitsConfig): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isUpdating = ref(false);

const localUnits = ref<ScavengingUnitsConfig>({ ...props.config.units });

// Reset local units when modal opens or config changes
watch([() => props.isOpen, () => props.config], () => {
  if (props.isOpen) {
    localUnits.value = { ...props.config.units };
  }
}, { immediate: true });

const unitList = [
  { key: 'spear' as ScavengingUnit, label: 'Pikinierzy', icon: 'i-lucide-sword', description: 'Podstawowa jednostka piechoty' },
  { key: 'sword' as ScavengingUnit, label: 'Miecznicy', icon: 'i-lucide-sword', description: 'Piechota z mieczami' },
  { key: 'axe' as ScavengingUnit, label: 'Topornicy', icon: 'i-lucide-axe', description: 'Piechota z toporami' },
  { key: 'archer' as ScavengingUnit, label: 'Łucznicy', icon: 'i-lucide-target', description: 'Jednostka strzelecka' },
  { key: 'light' as ScavengingUnit, label: 'Lekka kawaleria', icon: 'i-lucide-move', description: 'Szybka jednostka konna' },
  { key: 'marcher' as ScavengingUnit, label: 'Konni łucznicy', icon: 'i-lucide-bow-arrow', description: 'Kawaleria strzelecka' },
  { key: 'heavy' as ScavengingUnit, label: 'Ciężka kawaleria', icon: 'i-lucide-shield', description: 'Silna jednostka konna' },
];

const hasAnyEnabled = computed(() => {
  return Object.values(localUnits.value).some(enabled => enabled === true);
});

const handleSave = async () => {
  if (!hasAnyEnabled.value) {
    return;
  }
  
  isUpdating.value = true;
  try {
    emit('save', { ...localUnits.value });
  } finally {
    isUpdating.value = false;
  }
};

const handleCancel = () => {
  localUnits.value = { ...props.config.units };
  emit('close');
};
</script>

