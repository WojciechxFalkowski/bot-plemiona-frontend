<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Empty state -->
    <div v-else-if="strategies.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-shield-exclamation" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Brak strategii ataku</h3>
      <p class="text-gray-500 mb-4">Dodaj pierwszą strategię ataku dla tej wioski</p>
      <UButton color="primary" @click="$emit('add')">
        Dodaj strategię
      </UButton>
    </div>

    <!-- Strategies list -->
    <div v-else class="space-y-4">
      <UCard
        v-for="strategy in strategies"
        :key="strategy.id"
        class="hover:shadow-md transition-shadow"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Strategia #{{ strategy.id }}
            </h3>
            <div class="flex items-center gap-2">
              <UButton
                size="sm"
                variant="ghost"
                icon="i-heroicons-pencil"
                @click="$emit('edit', strategy)"
              >
                Edytuj
              </UButton>
              <UModal title="Potwierdź usunięcie" description="Czy na pewno chcesz usunąć tę strategię ataku?">
                <UButton
                  size="sm"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  :loading="deletingStrategyId === strategy.id"
                >
                  Usuń
                </UButton>

                <template #body>
                  <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600" />
                      </div>
                      <div class="flex-1">
                        <p class="text-sm text-gray-600">
                          Czy na pewno chcesz usunąć strategię ataku #{{ strategy.id }}?
                        </p>
                        <p class="mt-2 text-sm text-gray-500">
                          Ta akcja jest nieodwracalna.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end space-x-3 mt-6">
                    <UButton
                      label="Usuń"
                      color="red"
                      :loading="deletingStrategyId === strategy.id"
                      @click="$emit('delete', strategy)"
                    />
                  </div>
                </template>
              </UModal>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Units display -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div
              v-for="unit in unitsWithValues(strategy)"
              :key="unit.key"
              class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span class="text-sm font-medium text-gray-700">{{ unit.name }}</span>
              <span class="text-sm font-bold text-gray-900">{{ unit.value }}</span>
            </div>
          </div>

          <!-- Metadata -->
          <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Utworzono: {{ formatDate(strategy.createdAt) }}</span>
            <span v-if="strategy.updatedAt !== strategy.createdAt">
              Zaktualizowano: {{ formatDate(strategy.updatedAt) }}
            </span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AttackStrategy } from '@/types/attack-strategies';
import { UNITS_CONFIG } from '@/config/units';

// Props
interface Props {
  strategies: AttackStrategy[];
  loading?: boolean;
  deletingStrategyId?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  deletingStrategyId: null,
});

// Emits
const emit = defineEmits<{
  add: [];
  edit: [strategy: AttackStrategy];
  delete: [strategy: AttackStrategy];
}>();

// Computed
const unitsWithValues = (strategy: AttackStrategy) => {
  return UNITS_CONFIG
    .map(unit => ({
      ...unit,
      value: strategy[unit.key as keyof AttackStrategy] as number
    }))
    .filter(unit => unit.value > 0);
};

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
