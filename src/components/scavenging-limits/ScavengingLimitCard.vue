<template>
  <UCard class="hover:shadow-md transition-shadow">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <p class="text-xs text-gray-500">ID: {{ limit.villageId }}</p>
          <p class="text-base font-semibold text-gray-900">
            {{ getVillageName(limit.villageId) || `Wioska ${limit.villageId}` }}
          </p>
          <p class="text-xs text-gray-500">
            Serwer: {{ limit.server?.serverName || `#${limit.serverId}` }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-blue-600">{{ limit.maxSpearUnits }}</p>
          <p class="text-xs text-gray-500">pikinierów</p>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Village Info -->
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-map-pin" class="text-gray-400 w-4 h-4" />
        <span class="text-sm text-gray-600">
          Wioska: {{ limit.villageId }}
        </span>
      </div>

      <!-- Server Info -->
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-server" class="text-gray-400 w-4 h-4" />
        <span class="text-sm text-gray-600">
          Serwer: {{ limit.server?.serverCode || `#${limit.serverId}` }}
        </span>
      </div>

      <!-- Dates -->
      <div class="text-xs text-gray-500 space-y-1">
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-calendar-plus" class="w-3 h-3" />
          <span>Utworzono: {{ formatDate(limit.createdAt) }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-calendar-clock" class="w-3 h-3" />
          <span>Zaktualizowano: {{ formatDate(limit.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <UModal :open="getRowEditOpen(limit.id)" @update:open="(val: boolean) => setRowEditOpen(limit.id, val)"
                :title="`Edytuj limit zbieractwa`"
                description="Edytuj maksymalną ilość pikinierów dla tej wioski">
          <UButton size="sm" variant="ghost" icon="i-heroicons-pencil" class="cursor-pointer"
                   @click="openEdit(limit.id)">
            Edytuj
          </UButton>
          <template #body>
            <ScavengingLimitModal
              :is-open="getRowEditOpen(limit.id)"
              :limit="limit"
              :is-editing="true"
              :server-id="limit.serverId"
              :village-options="villageOptions"
              @close="() => closeEdit(limit.id)"
              @save="(data) => handleUpdate(limit.id, data)"
            />
          </template>
        </UModal>

        <UModal :open="getRowDeleteOpen(limit.id)" @update:open="(val: boolean) => setRowDeleteOpen(limit.id, val)"
                title="Potwierdź usunięcie"
                description="Operacja jest nieodwracalna">
          <UButton size="sm" color="error" variant="outline" icon="i-heroicons-trash" class="cursor-pointer"
                   @click="() => openDelete(limit.id)">
            Usuń
          </UButton>
          <template #body>
            <div class="space-y-4">
              <p>Czy na pewno chcesz usunąć limit zbieractwa dla wioski {{ limit.villageId }}?</p>
              <div class="flex justify-end gap-2">
                <UButton variant="ghost" class="cursor-pointer" @click="() => closeDelete(limit.id)">
                  Anuluj
                </UButton>
                <UButton color="error" class="cursor-pointer" :loading="getRowDeleting(limit.id)"
                         @click="() => handleDelete(limit.id)">
                  Usuń
                </UButton>
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ScavengingLimit, ScavengingLimitFormData } from '@/types/scavenging-limits';
import ScavengingLimitModal from './ScavengingLimitModal.vue';
import { useVillages } from '@/composables/useVillages';

export interface Props {
  limit: ScavengingLimit;
}

export interface Emits {
  (e: 'update', data: { id: number; updateData: ScavengingLimitFormData }): void;
  (e: 'delete', id: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Use villages composable
const { villages, fetchVillages } = useVillages();

// Computed village options for the limit's server
const villageOptions = computed(() => {
  return villages.value
    .filter(village => village.serverId === props.limit.serverId)
    .map(village => ({
      label: `${village.name} (${village.coordinates})`,
      value: village.id
    }));
});

// Modal state management
const rowEditOpen = ref<Record<number, boolean>>({});
const rowDeleteOpen = ref<Record<number, boolean>>({});
const rowDeleting = ref<Record<number, boolean>>({});

const getRowEditOpen = (id: number) => rowEditOpen.value[id] || false;
const setRowEditOpen = (id: number, open: boolean) => {
  rowEditOpen.value[id] = open;
};

const getRowDeleteOpen = (id: number) => rowDeleteOpen.value[id] || false;
const setRowDeleteOpen = (id: number, open: boolean) => {
  rowDeleteOpen.value[id] = open;
};

const getRowDeleting = (id: number) => rowDeleting.value[id] || false;

const openEdit = (id: number) => {
  rowEditOpen.value[id] = true;
};

const closeEdit = (id: number) => {
  rowEditOpen.value[id] = false;
};

const openDelete = (id: number) => {
  rowDeleteOpen.value[id] = true;
};

const closeDelete = (id: number) => {
  rowDeleteOpen.value[id] = false;
};

const handleUpdate = async (id: number, data: ScavengingLimitFormData) => {
  emit('update', { id, updateData: data });
  closeEdit(id);
};

const handleDelete = async (id: number) => {
  rowDeleting.value[id] = true;
  try {
    emit('delete', id);
  } finally {
    rowDeleting.value[id] = false;
    closeDelete(id);
  }
};

const getVillageName = (villageId: string) => {
  const village = villages.value.find(v => v.id === villageId);
  return village ? `${village.name} (${village.coordinates})` : null;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fetch villages for the server when component mounts
onMounted(async () => {
  await fetchVillages(props.limit.serverId);
});
</script>
