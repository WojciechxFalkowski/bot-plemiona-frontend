<template>
  <div class="attack-strategies-view">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Strategie Ataku</h1>
          <p class="text-gray-600 mt-1">
            Zarządzaj strategiami ataku
          </p>
        </div>

        <div class="flex items-center gap-4">
          <!-- Create Strategy Modal -->
          <UModal title="Stwórz strategię ataku" description="Utwórz nową strategię ataku dla wybranej wioski">
            <UButton
              color="green"
              variant="outline"
              icon="i-heroicons-plus"
              class="cursor-pointer"
              @click="openCreateModal"
            >
              Stwórz strategię
            </UButton>

            <template #body>
              <div class="space-y-6">
                <!-- Village ID -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    Wybierz Wioskę <span class="text-red-500">*</span>
                  </label>
                  <USelect
                    v-model="createForm.villageId"
                    :items="villageOptions"
                    :placeholder="villageOptions.length === 0 ? 'Wszystkie wioski mają już strategie' : 'Wybierz wioskę'"
                    :disabled="villageOptions.length === 0"
                    value-key="value"
                  />
                  <p v-if="villageOptions.length === 0" class="text-sm text-gray-500 mt-1">
                    Wszystkie wioski mają już przypisane strategie ataku. Usuń istniejącą strategię, aby móc utworzyć nową dla tej wioski.
                  </p>
                </div>

                <!-- Units -->
                <div class="space-y-4">
                  <h4 class="text-base font-semibold text-gray-900 mt-8">Jednostki</h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div
                      v-for="unit in UNITS_CONFIG"
                      :key="unit.key"
                      class="space-y-1"
                    >
                      <label class="block text-sm font-medium text-gray-700">
                        {{ unit.name }}
                      </label>
                      <UInput
                        v-model="createForm[unit.key as keyof AttackStrategyFormData]"
                        type="number"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-2 mt-6">
                <UButton
                  color="gray"
                  variant="outline"
                  class="cursor-pointer"
                  @click="closeCreateModal"
                >
                  Anuluj
                </UButton>
                <UButton
                  color="primary"
                  :loading="isCreating"
                  class="cursor-pointer"
                  @click="saveCreate"
                >
                  Stwórz strategię
                </UButton>
              </div>
            </template>
          </UModal>

          <UButton
            variant="outline"
            icon="i-heroicons-arrow-left"
            class="cursor-pointer"
            @click="goBack"
          >
            Wróć do wiosek
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-gray-400 mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie strategii...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="strategies.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-shield-exclamation" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Brak strategii ataku</h3>
      <p class="text-gray-500">Nie znaleziono żadnych strategii ataku w systemie.</p>
    </div>

    <!-- Strategies list -->
    <div v-else class="space-y-4">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Lista strategii ataku</h2>
        <p class="text-sm text-gray-600">Znaleziono {{ strategies.length }} strategii</p>
      </div>

      <div class="grid gap-4">
        <UCard v-for="strategy in strategies" :key="strategy.id" class="hover:shadow-md transition-shadow">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UBadge color="blue" variant="soft">
                  Wioska ID: {{ strategy.villageId }}
                </UBadge>
                <UBadge color="green" variant="soft">
                  Serwer: {{ strategy.server?.serverName || `#${strategy.serverId}` }}
                </UBadge>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Units display -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div v-for="(value, unit) in getUnitsWithValues(strategy)" :key="unit" :class="[
                'flex items-center justify-between p-2 rounded-lg',
                value > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
              ]">
                <span class="text-sm font-medium text-gray-700">{{ getUnitName(unit) }}</span>
                <span :class="[
                  'text-sm font-bold',
                  value > 0 ? 'text-blue-900' : 'text-gray-400'
                ]">
                  {{ value }}
                </span>
              </div>
            </div>

            <!-- Metadata -->
            <div class="flex items-center justify-between text-xs text-gray-500 pt-2 ">
              <span>Utworzono: {{ formatDate(strategy.createdAt) }}</span>
              <span v-if="strategy.updatedAt !== strategy.createdAt">
                Zaktualizowano: {{ formatDate(strategy.updatedAt) }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center justify-end gap-2 pt-4 ">
              <!-- Edit Modal -->
              <UModal title="Edytuj strategię ataku" description="Edytuj strategię ataku dla wybranej wioski">
                <UButton color="blue" variant="outline" size="sm" icon="i-heroicons-pencil" class="cursor-pointer"
                  @click="openEditModal(strategy)">
                  Edytuj
                </UButton>

                <template #body>
                  <div class="space-y-6">
                    <!-- Village ID -->
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Wybierz Wioskę <span class="text-red-500">*</span>
                      </label>
                      <USelect
                        v-model="editForm.villageId"
                        :items="villageOptions"
                        placeholder="Wybierz wioskę"
                        value-key="value"
                      />
                    </div>

                    <!-- Units -->
                    <div class="space-y-4">
                      <h4 class="text-base font-semibold text-gray-900 mt-8">Jednostki</h4>
                      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div v-for="unit in UNITS_CONFIG" :key="unit.key" class="space-y-1">
                          <label class="block text-sm font-medium text-gray-700">
                            {{ unit.name }}
                          </label>
                          <UInput v-model="editForm[unit.key as keyof AttackStrategyFormData]" type="number" min="0"
                            placeholder="0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end gap-2 mt-6">
                    <UButton color="gray" variant="outline" class="cursor-pointer" @click="closeEditModal">
                      Anuluj
                    </UButton>
                    <UButton color="primary" :loading="isUpdating" class="cursor-pointer" @click="saveEdit">
                      Zapisz zmiany
                    </UButton>
                  </div>
                </template>
              </UModal>

              <!-- Delete Modal -->
              <UModal title="Usuń strategię" description="Potwierdź usunięcie strategii ataku">
                <UButton color="red" variant="outline" size="sm" icon="i-heroicons-trash" class="cursor-pointer"
                  @click="openDeleteModal(strategy)">
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
                          Czy na pewno chcesz usunąć strategię dla wioski <strong>{{ selectedStrategy?.villageId
                          }}</strong>?
                        </p>
                        <p class="mt-3 text-sm text-red-600">
                          Ta operacja nie może zostać cofnięta.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end gap-2 mt-6">
                    <UButton color="gray" variant="outline" class="cursor-pointer" @click="closeDeleteModal">
                      Anuluj
                    </UButton>
                    <UButton color="red" :loading="isDeleting" class="cursor-pointer" @click="confirmDelete">
                      Usuń strategię
                    </UButton>
                  </div>
                </template>
              </UModal>
            </div>
          </div>
        </UCard>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAttackStrategies } from '@/composables/useAttackStrategies';
import { useVillages } from '@/composables/useVillages';
import { UNITS_CONFIG } from '@/config/units';
import type { AttackStrategy, AttackStrategyFormData } from '@/types/attack-strategies';

declare const useToast: () => any;

const router = useRouter();
const route = useRoute();

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId;
  return id ? parseInt(id as string) : undefined;
});

// Village options for select (only villages without existing strategies)
const villageOptions = computed(() => {
  // Get village IDs that already have strategies
  const villagesWithStrategies = new Set(strategies.value.map(strategy => strategy.villageId));

  // Filter out villages that already have strategies
  return villages.value
    .filter(village => !villagesWithStrategies.has(village.id))
    .map(village => ({
      label: `${village.name} (${village.coordinates})`,
      value: village.id
    }));
});

// Composables
const { strategies, isLoading, isUpdating, isDeleting, isCreating, fetchStrategies, updateStrategy, deleteStrategy, createStrategy } = useAttackStrategies();
const { villages, fetchVillages } = useVillages();
const toast = useToast();

// Modal states
const selectedStrategy = ref<AttackStrategy | null>(null);

// Edit form
const editForm = ref<AttackStrategyFormData & { villageId: string }>({
  villageId: '',
  spear: '',
  sword: '',
  axe: '',
  archer: '',
  light: '',
  marcher: '',
  heavy: '',
  ram: '',
  catapult: '',
  knight: '',
  snob: '',
  spy: '',
});

// Create form
const createForm = ref<AttackStrategyFormData & { villageId: string }>({
  villageId: '',
  spear: '',
  sword: '',
  axe: '',
  archer: '',
  light: '',
  marcher: '',
  heavy: '',
  ram: '',
  catapult: '',
  knight: '',
  snob: '',
  spy: '',
});

// Methods
const goBack = () => {
  const query = serverId.value ? { serverId: serverId.value.toString() } : {};
  router.push({ name: 'player-villages', query });
};

const getUnitsWithValues = (strategy: AttackStrategy) => {
  const units = ['spear', 'sword', 'axe', 'archer', 'light', 'marcher', 'heavy', 'ram', 'catapult', 'knight', 'snob', 'spy'];
  const unitsWithValues: Record<string, number> = {};

  units.forEach(unit => {
    const value = strategy[unit as keyof AttackStrategy] as number;
    unitsWithValues[unit] = value || 0; // Pokaż wszystkie jednostki, nawet z wartością 0
  });

  return unitsWithValues;
};

const getUnitName = (unit: string) => {
  const unitNames: Record<string, string> = {
    spear: 'Włócznik',
    sword: 'Miecznik',
    axe: 'Topornik',
    archer: 'Łucznik',
    light: 'Lekka kawaleria',
    marcher: 'Łucznik konny',
    heavy: 'Ciężka kawaleria',
    ram: 'Taran',
    catapult: 'Katapulta',
    knight: 'Rycerz',
    snob: 'Szlachcic',
    spy: 'Szpieg'
  };

  return unitNames[unit] || unit;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Modal methods
const openEditModal = (strategy: AttackStrategy) => {
  selectedStrategy.value = strategy;
  editForm.value = {
    villageId: strategy.villageId,
    spear: strategy.spear > 0 ? strategy.spear.toString() : '',
    sword: strategy.sword > 0 ? strategy.sword.toString() : '',
    axe: strategy.axe > 0 ? strategy.axe.toString() : '',
    archer: strategy.archer > 0 ? strategy.archer.toString() : '',
    light: strategy.light > 0 ? strategy.light.toString() : '',
    marcher: strategy.marcher > 0 ? strategy.marcher.toString() : '',
    heavy: strategy.heavy > 0 ? strategy.heavy.toString() : '',
    ram: strategy.ram > 0 ? strategy.ram.toString() : '',
    catapult: strategy.catapult > 0 ? strategy.catapult.toString() : '',
    knight: strategy.knight > 0 ? strategy.knight.toString() : '',
    snob: strategy.snob > 0 ? strategy.snob.toString() : '',
    spy: strategy.spy > 0 ? strategy.spy.toString() : '',
  };
};

const closeEditModal = () => {
  selectedStrategy.value = null;
  editForm.value = {
    villageId: '',
    spear: '',
    sword: '',
    axe: '',
    archer: '',
    light: '',
    marcher: '',
    heavy: '',
    ram: '',
    catapult: '',
    knight: '',
    snob: '',
    spy: '',
  };
};

const openDeleteModal = (strategy: AttackStrategy) => {
  selectedStrategy.value = strategy;
};

const closeDeleteModal = () => {
  selectedStrategy.value = null;
};

// Create modal methods
const openCreateModal = () => {
  createForm.value = {
    villageId: '',
    spear: '',
    sword: '',
    axe: '',
    archer: '',
    light: '',
    marcher: '',
    heavy: '',
    ram: '',
    catapult: '',
    knight: '',
    snob: '',
    spy: '',
  };
};

const closeCreateModal = () => {
  createForm.value = {
    villageId: '',
    spear: '',
    sword: '',
    axe: '',
    archer: '',
    light: '',
    marcher: '',
    heavy: '',
    ram: '',
    catapult: '',
    knight: '',
    snob: '',
    spy: '',
  };
};

const saveCreate = async () => {
  if (!createForm.value.villageId || !serverId.value) {
    return;
  }

  try {
    await createStrategy(createForm.value, serverId.value, createForm.value.villageId);
    closeCreateModal();
    // Refresh strategies
    await fetchStrategies(serverId.value);
  } catch (error) {
    console.error('Error creating strategy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
    toast.add({
      title: 'Błąd',
      description: errorMessage,
      color: 'red'
    });
  }
};

const saveEdit = async () => {
  if (!selectedStrategy.value || !serverId.value) return;

  try {
    await updateStrategy(selectedStrategy.value.id, editForm.value, serverId.value, editForm.value.villageId);
    closeEditModal();
    // Refresh strategies
    await fetchStrategies(serverId.value);
  } catch (error) {
    console.error('Error updating strategy:', error);
  }
};

const confirmDelete = async () => {
  if (!selectedStrategy.value) return;

  try {
    await deleteStrategy(selectedStrategy.value.id);
    closeDeleteModal();
    // Refresh strategies
    if (serverId.value) {
      await fetchStrategies(serverId.value);
    } else {
      await fetchStrategies();
    }
  } catch (error) {
    console.error('Error deleting strategy:', error);
  }
};

// Lifecycle
onMounted(async () => {
  if (serverId.value) {
    await fetchStrategies(serverId.value);
    await fetchVillages(serverId.value);
  } else {
    await fetchStrategies(); // Pobierz wszystkie strategie jeśli brak serverId
  }
});

// Watch for serverId changes
watch(serverId, async (newServerId) => {
  if (newServerId) {
    await fetchStrategies(newServerId);
    await fetchVillages(newServerId);
  } else {
    await fetchStrategies(); // Pobierz wszystkie strategie jeśli brak serverId
  }
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
