<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Rekrutacja wojska Wojska</h1>
        <p class="text-sm text-gray-600">Zarządzaj strategiami rekrutacji (globalne limity i jednostki)</p>
      </div>

      <UModal v-model:open="isCreateOpen" title="Nowa strategia" description="Utwórz strategię treningu">
        <UButton color="primary" icon="i-heroicons-plus" class="cursor-pointer" @click="openCreate">Dodaj Strategię
        </UButton>
        <template #body>
          <ArmyTrainingStrategyForm :is-editing="false" :is-loading="isCreating" :server-id="serverId" :village-options="villageOptions"
            @cancel="closeCreate" @submit="handleCreate" />
        </template>
      </UModal>
    </div>

    <div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <UCard v-for="s in strategies" :key="s.id" class="text-sm">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <p class="text-xs text-gray-500">{{ getVillage(s.villageId)?.id || s.villageId }}</p>
                <p class="text-base font-semibold text-gray-900">{{ getVillage(s.villageId)?.name || 'Nieznana wioska' }}</p>
                <p v-if="getVillage(s.villageId)?.coordinates" class="text-xs text-gray-500">{{ getVillage(s.villageId)?.coordinates }}</p>
              </div>
              <USwitch class="cursor-pointer" :model-value="s.is_active" label="" @update:modelValue="(val: boolean) => toggleActive(s, val)" />
            </div>
          </template>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-gray-500">Max Total</p>
              <p class="text-sm text-gray-900">{{ s.max_total_overall ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Max in queue</p>
              <p class="text-sm text-gray-900">{{ s.max_in_queue_per_unit_overall }}</p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UModal :open="getRowEditOpen(s.id)" @update:open="(val: boolean) => setRowEditOpen(s.id, val)" :title="`Edytuj strategię ${s.villageId}`" description="Edytuj ustawienia strategii rekrutacji">
                <UButton size="sm" variant="ghost" icon="i-heroicons-pencil" class="cursor-pointer" @click="openEdit(s.id)">Edytuj</UButton>
                <template #body>
                  <ArmyTrainingStrategyForm :is-editing="true" :is-loading="isUpdating" :server-id="serverId" :village-options="villageOptions" :initial-strategy="s" @cancel="() => closeEdit(s.id)" @submit="(data: any) => handleUpdate(s.id, data)" />
                </template>
              </UModal>

              <UModal :open="getRowDeleteOpen(s.id)" @update:open="(val: boolean) => setRowDeleteOpen(s.id, val)" title="Potwierdź usunięcie" description="Operacja jest nieodwracalna">
                <UButton size="sm" color="error" variant="outline" icon="i-heroicons-trash" class="cursor-pointer" @click="() => openDelete(s.id)">Usuń</UButton>
                <template #body>
                  <div class="space-y-4">
                    <p>Czy na pewno chcesz usunąć tę strategię?</p>
                    <div class="flex justify-end gap-2">
                      <UButton variant="ghost" class="cursor-pointer" @click="() => closeDelete(s.id)">Anuluj</UButton>
                      <UButton color="error" class="cursor-pointer" :loading="getRowDeleting(s.id)" @click="() => handleDelete(s.id)">Usuń</UButton>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </template>
        </UCard>
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
</script>
