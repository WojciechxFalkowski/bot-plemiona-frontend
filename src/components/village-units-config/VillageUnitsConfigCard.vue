<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
    :class="isUpdating ? 'opacity-50' : ''"
  >
    <!-- Village Info -->
    <div class="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3 text-sm">
        <span class="text-gray-500 dark:text-gray-400">ID: {{ config.villageId }}</span>
        <span class="font-semibold text-gray-900 dark:text-white">{{ config.villageName }}</span>
      </div>
    </div>

    <!-- Units Configuration - Horizontal layout -->
    <div class="flex flex-wrap gap-1.5 sm:gap-2">
      <div
        v-for="unit in unitList"
        :key="unit.key"
        class="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all cursor-pointer"
        :class="[
          localUnits[unit.key]
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50'
            : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600',
          isUpdating ? 'cursor-wait' : ''
        ]"
        @click="handleToggle(unit.key)"
      >
        <UIcon
          :name="unit.icon"
          class="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"
          :class="localUnits[unit.key] ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'"
        />
        <span
          class="text-xs sm:text-sm font-medium whitespace-nowrap"
          :class="localUnits[unit.key] ? 'text-green-900 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'"
        >
          {{ unit.label }}
        </span>
      </div>
    </div>

    <UAlert v-if="!hasAnyEnabled" color="red" icon="i-heroicons-exclamation-triangle" size="sm" class="mt-3">
      Przynajmniej jedna jednostka musi być włączona
    </UAlert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { VillageUnitsConfig, ScavengingUnit, ScavengingUnitsConfig } from '@/types/village-units-config';

interface Props {
  config: VillageUnitsConfig;
  isUpdating?: boolean;
}

interface Emits {
  (e: 'update', villageId: string, units: ScavengingUnitsConfig): void;
}

const props = withDefaults(defineProps<Props>(), {
  isUpdating: false
});

const emit = defineEmits<Emits>();

const localUnits = ref<ScavengingUnitsConfig>({ ...props.config.units });

// Sync local units when config changes
watch(() => props.config, (newConfig) => {
  localUnits.value = { ...newConfig.units };
}, { deep: true });

const unitList = computed(() => [
  { key: 'spear' as ScavengingUnit, label: 'Pikinierzy', icon: 'i-lucide-sword' },
  { key: 'sword' as ScavengingUnit, label: 'Miecznicy', icon: 'i-lucide-sword' },
  { key: 'axe' as ScavengingUnit, label: 'Topornicy', icon: 'i-lucide-axe' },
  { key: 'archer' as ScavengingUnit, label: 'Łucznicy', icon: 'i-lucide-target' },
  { key: 'light' as ScavengingUnit, label: 'Lekka kawaleria', icon: 'i-lucide-move' },
  { key: 'marcher' as ScavengingUnit, label: 'Konni łucznicy', icon: 'i-lucide-bow-arrow' },
  { key: 'heavy' as ScavengingUnit, label: 'Ciężka kawaleria', icon: 'i-lucide-shield' },
]);

const hasAnyEnabled = computed(() => {
  return Object.values(localUnits.value).some(enabled => enabled === true);
});

const handleToggle = (unitKey: ScavengingUnit) => {
  if (props.isUpdating) return; // Prevent clicks during update

  const newValue = !localUnits.value[unitKey];

  // Don't allow disabling if it's the last enabled unit
  if (!newValue && hasAnyEnabled.value && Object.values(localUnits.value).filter(v => v).length === 1) {
    return; // Prevent disabling the last enabled unit
  }

  localUnits.value[unitKey] = newValue;
  emit('update', props.config.villageId, { ...localUnits.value });
};
</script>

