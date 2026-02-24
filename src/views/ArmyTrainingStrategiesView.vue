<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex-1 min-w-0">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Rekrutacja wojska Wojska</h1>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Zarządzaj strategiami rekrutacji (globalne limity i jednostki)</p>
      </div>

      <div class="flex-shrink-0">
        <UModal v-model:open="isCreateOpen" title="Nowa strategia" description="Utwórz strategię treningu">
          <UButton color="primary" icon="i-heroicons-plus" class="cursor-pointer" @click="openCreate">Dodaj Strategię</UButton>
          <template #body>
            <ArmyTrainingStrategyForm :is-editing="false" :is-loading="isCreating" :server-id="serverId" :village-options="villageOptions"
              @cancel="closeCreate" @submit="handleCreate" />
          </template>
        </UModal>
      </div>
    </div>

    <div v-if="strategies.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      <p>Brak strategii rekrutacji. Dodaj pierwszą strategię, aby rozpocząć.</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="group in groupedStrategiesArray" :key="group.villageId" class="space-y-3">
        <!-- Nagłówek grupy -->
        <div class="border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ group.villageName }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ group.coordinates }} • {{ group.strategies.length }} {{ group.strategies.length === 1 ? 'strategia' : 'strategii' }}</p>
        </div>

        <!-- Lista strategii -->
        <div class="space-y-2">
          <div v-for="strategy in group.strategies" :key="strategy.id" class="flex flex-col gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
            <!-- Główne dane -->
            <div class="flex flex-col gap-3">
              <!-- Max Total, Max in queue i Akcje w jednej linii -->
              <div class="flex items-center justify-between gap-3">
                <!-- Max Total i Max in queue -->
                <div class="flex gap-4 text-sm items-center">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Max Total Per Unit</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ strategy.max_total_per_unit ?? '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Max in queue</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ strategy.max_in_queue_per_unit_overall }}</p>
                  </div>
                  <!-- Jednostki w tej samej linii (tylko na desktop) -->
                  <div v-if="getActiveUnits(strategy).length > 0" class="hidden sm:flex flex-wrap gap-1.5 items-center">
                    <span
                      v-for="unit in getActiveUnits(strategy)"
                      :key="unit.key"
                      class="font-medium inline-flex items-center text-[10px]/3 px-1.5 py-1 gap-1 rounded-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    >
                      {{ unit.label }}: {{ unit.value }}
                    </span>
                  </div>
                </div>

                <!-- Switch i Akcje -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <USwitch class="cursor-pointer" :model-value="strategy.is_active" label="" @update:modelValue="(val: boolean) => toggleActive(strategy, val)" />
                  <UModal :open="getRowEditOpen(strategy.id)" @update:open="(val: boolean) => setRowEditOpen(strategy.id, val)" :title="`Edytuj strategię ${group.villageName}`" description="Edytuj ustawienia strategii rekrutacji">
                    <UButton size="sm" variant="ghost" icon="i-heroicons-pencil" class="cursor-pointer" @click="openEdit(strategy.id)">Edytuj</UButton>
                    <template #body>
                      <ArmyTrainingStrategyForm :is-editing="true" :is-loading="isUpdating" :server-id="serverId" :village-options="villageOptions" :initial-strategy="strategy" @cancel="() => closeEdit(strategy.id)" @submit="(data: any) => handleUpdate(strategy.id, data)" />
                    </template>
                  </UModal>

                  <UModal :open="getRowDeleteOpen(strategy.id)" @update:open="(val: boolean) => setRowDeleteOpen(strategy.id, val)" title="Potwierdź usunięcie" description="Operacja jest nieodwracalna">
                    <UButton size="sm" color="error" variant="outline" icon="i-heroicons-trash" class="cursor-pointer" @click="() => openDelete(strategy.id)">Usuń</UButton>
                    <template #body>
                      <div class="space-y-4">
                        <p class="text-gray-900 dark:text-white">Czy na pewno chcesz usunąć tę strategię?</p>
                        <div class="flex justify-end gap-2">
                          <UButton variant="ghost" class="cursor-pointer" @click="() => closeDelete(strategy.id)">Anuluj</UButton>
                          <UButton color="error" class="cursor-pointer" :loading="getRowDeleting(strategy.id)" @click="() => handleDelete(strategy.id)">Usuń</UButton>
                        </div>
                      </div>
                    </template>
                  </UModal>
                </div>
              </div>
            </div>

            <!-- Jednostki - osobna linia na mobile -->
            <div v-if="getActiveUnits(strategy).length > 0" class="flex flex-wrap gap-1.5 sm:hidden pt-2 border-t border-gray-100 dark:border-gray-700">
              <span
                v-for="unit in getActiveUnits(strategy)"
                :key="unit.key"
                class="font-medium inline-flex items-center text-[10px]/3 px-1.5 py-1 gap-1 rounded-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
              >
                {{ unit.label }}: {{ unit.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useVillages } from '@/composables/useVillages';
import { useArmyTrainingStrategies } from '@/composables/useArmyTrainingStrategies';
import ArmyTrainingStrategyForm from '@/components/army-training/ArmyTrainingStrategyForm.vue';

const route = useRoute();
const serverId = computed(() => {
  const id = route.query.serverId as string | undefined;
  return id ? parseInt(id) : undefined;
});

const { strategies, isLoading, isCreating, isUpdating, isDeleting, fetchStrategies, createStrategy, updateStrategy, deleteStrategy } = useArmyTrainingStrategies();
const { villages, fetchVillages } = useVillages();

const isCreateOpen = ref(false);
const rowState = reactive<Record<number, { editOpen: boolean; deleteOpen: boolean; deleting: boolean }>>({});

const openCreate = () => { isCreateOpen.value = true; };
const closeCreate = () => { isCreateOpen.value = false; };

const ensureRow = (id: number) => { rowState[id] = rowState[id] || { editOpen: false, deleteOpen: false, deleting: false }; };
const openEdit = (id: number) => { ensureRow(id); rowState[id].editOpen = true; };
const closeEdit = (id: number) => { if (rowState[id]) rowState[id].editOpen = false; };

const getRowEditOpen = (id: number) => (rowState[id]?.editOpen ?? false);
const setRowEditOpen = (id: number, val: boolean) => { ensureRow(id); rowState[id].editOpen = val; };
const getRowDeleting = (id: number) => (rowState[id]?.deleting ?? false);
const getRowDeleteOpen = (id: number) => (rowState[id]?.deleteOpen ?? false);
const setRowDeleteOpen = (id: number, val: boolean) => { ensureRow(id); rowState[id].deleteOpen = val; };
const openDelete = (id: number) => { ensureRow(id); rowState[id].deleteOpen = true; };
const closeDelete = (id: number) => { if (rowState[id]) rowState[id].deleteOpen = false; };

const handleCreate = async (data: any) => {
  if (!serverId.value) return;
  await createStrategy(data, serverId.value);
  closeCreate();
};

const handleUpdate = async (id: number, data: any) => {
  await updateStrategy(id, data, serverId.value);
  closeEdit(id);
};

const toggleActive = async (s: any, val: boolean) => {
  await updateStrategy(s.id, { is_active: val }, serverId.value);
};

const handleDelete = async (id: number) => {
  ensureRow(id);
  rowState[id].deleting = true;
  await deleteStrategy(id, serverId.value);
  rowState[id].deleting = false;
  closeDelete(id);
};

onMounted(async () => {
  await fetchStrategies(serverId.value);
  await fetchVillages(serverId.value);
});

const villageOptions = computed(() => {
  return villages.value.map(v => ({ label: `${v.name} (${v.coordinates})`, value: v.id }));
});

watch(serverId, async (id?: number) => {
  await fetchStrategies(id);
  await fetchVillages(id);
});

const getVillage = (villageId: string) => villages.value.find(v => v.id === villageId);

const groupedStrategies = computed(() => {
  const map = new Map<string, typeof strategies.value>();
  strategies.value.forEach(strategy => {
    const existing = map.get(strategy.villageId) || [];
    map.set(strategy.villageId, [...existing, strategy]);
  });
  return map;
});

interface GroupedStrategy {
  villageId: string;
  villageName: string;
  coordinates: string;
  strategies: typeof strategies.value;
}

const groupedStrategiesArray = computed<GroupedStrategy[]>(() => {
  const groups: GroupedStrategy[] = [];
  groupedStrategies.value.forEach((strategiesList, villageId) => {
    const village = getVillage(villageId);
    if (village) {
      groups.push({
        villageId,
        villageName: village.name || 'Nieznana wioska',
        coordinates: village.coordinates || villageId,
        strategies: strategiesList,
      });
    }
  });
  return groups.sort((a, b) => {
    const nameA = a.villageName.toLowerCase();
    const nameB = b.villageName.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
});

const unitLabels: Record<string, string> = {
  spear: 'Włócznik',
  sword: 'Miecznik',
  axe: 'Topornik',
  archer: 'Łucznik',
  light: 'Lekka kawaleria',
  marcher: 'Łucznik na koniu',
  heavy: 'Ciężka kawaleria',
  ram: 'Taran',
  catapult: 'Katapulta',
  knight: 'Rycerz',
  snob: 'Szlachcic',
  spy: 'Zwiadowca',
};

const getActiveUnits = (strategy: typeof strategies.value[0]) => {
  const units: Array<{ key: string; label: string; value: number }> = [];
  const unitKeys: Array<keyof typeof strategy> = ['spear', 'sword', 'axe', 'archer', 'light', 'marcher', 'heavy', 'ram', 'catapult', 'knight', 'snob', 'spy'];
  unitKeys.forEach(key => {
    const value = strategy[key] as number;
    if (value > 0) {
      units.push({
        key,
        label: unitLabels[key] || key,
        value,
      });
    }
  });
  return units;
};
</script>
