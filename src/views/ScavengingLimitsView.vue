<template>
  <div class="scavenging-limits-view">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Limity Zbieractwa</h1>
          <p class="text-gray-600 mt-1">
            Zarządzaj limitami pikinierów dla zbieractwa w wioskach
          </p>
        </div>

        <div class="flex items-center gap-4">
          <!-- Create Limit Modal -->
          <UModal v-model:open="isModalOpen" title="Dodaj limit zbieractwa"
                  description="Ustaw maksymalną ilość pikinierów do użycia w zbieractwie">
            <UButton color="primary" icon="i-heroicons-plus" class="cursor-pointer" @click="handleAddLimit">
              Dodaj Limit
            </UButton>

            <template #body>
              <ScavengingLimitModal
                :is-open="isModalOpen"
                :limit="selectedLimit"
                :is-editing="isEditing"
                :server-id="serverId || 0"
                :village-options="villageOptions"
                @close="handleCloseModal"
                @save="handleSaveLimit"
              />
            </template>
          </UModal>

          <UButton variant="outline" icon="i-heroicons-arrow-path" :loading="isLoading"
                   class="cursor-pointer" @click="() => fetchLimits(serverId)">
            Odśwież
          </UButton>
        </div>
      </div>


      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-target" class="w-8 h-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Łączne limity</p>
              <p class="text-2xl font-semibold text-gray-900">{{ limitsCount }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-sword" class="w-8 h-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Łączne pikinierów</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalSpearUnits }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-lucide-server" class="w-8 h-8 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Aktywnych serwerów</p>
              <p class="text-2xl font-semibold text-gray-900">{{ activeServersCount }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && limits.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie limitów zbieractwa...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && limits.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-target-off" class="w-12 h-12 text-gray-400 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">Brak limitów zbieractwa</h3>
      <p class="mt-2 text-sm text-gray-600">
        Dodaj pierwszy limit zbieractwa używając przycisku powyżej
      </p>
    </div>

    <!-- Limits Grid -->
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ScavengingLimitCard
          v-for="limit in limits"
          :key="limit.id"
          :limit="limit"
          @update="handleUpdateLimit"
          @delete="handleDeleteLimit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useScavengingLimits } from '@/composables/useScavengingLimits';
import { useVillages } from '@/composables/useVillages';
import { useServersStore } from '@/stores/servers';
import type { ScavengingLimit, ScavengingLimitFormData } from '@/types/scavenging-limits';
import ScavengingLimitModal from '@/components/scavenging-limits/ScavengingLimitModal.vue';
import ScavengingLimitCard from '@/components/scavenging-limits/ScavengingLimitCard.vue';

// Global auto-imported composable
declare const useToast: () => any;

const toast = useToast();
const route = useRoute();

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId;
  return id ? parseInt(id as string) : undefined;
});

// Composables
const {
  limits,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  limitsCount,
  fetchLimits,
  createLimit,
  updateLimit,
  deleteLimitById
} = useScavengingLimits();

const serversStore = useServersStore();
const { villages, fetchVillages } = useVillages();

// Modal states
const isModalOpen = ref(false);
const isEditing = ref(false);
const selectedLimit = ref<ScavengingLimit | null>(null);

// Computed
const servers = computed(() => serversStore.servers);
const serverOptions = computed(() =>
  servers.value.map(server => ({
    label: `${server.serverName} (${server.serverCode})`,
    value: server.id.toString()
  }))
);

const villageOptions = computed(() => {
  if (!serverId.value) {
    return [];
  }

  return villages.value
    .filter(village => village.serverId === serverId.value)
    .map(village => ({
      label: `${village.name} (${village.coordinates})`,
      value: village.id
    }));
});


const totalSpearUnits = computed(() =>
  limits.value.reduce((sum, limit) => sum + limit.maxSpearUnits, 0)
);

const activeServersCount = computed(() => {
  const serverIds = new Set(limits.value.map(limit => limit.serverId));
  return serverIds.size;
});

// Methods
const handleAddLimit = () => {
  selectedLimit.value = null;
  isEditing.value = false;
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  selectedLimit.value = null;
  isEditing.value = false;
};

const handleSaveLimit = async (data: ScavengingLimitFormData) => {
  try {
    if (isEditing.value && selectedLimit.value) {
      await updateLimit(selectedLimit.value.id, data);
    } else {
      await createLimit(data);
    }
    handleCloseModal();
    await fetchLimits(serverId.value);
  } catch (error) {
    // Error handling is done in the composable
  }
};

const handleUpdateLimit = async ({ id, updateData }: { id: number; updateData: ScavengingLimitFormData }) => {
  try {
    await updateLimit(id, updateData);
    await fetchLimits(serverId.value);
  } catch (error) {
    // Error handling is done in the composable
  }
};

const handleDeleteLimit = async (id: number) => {
  try {
    await deleteLimitById(id);
    await fetchLimits(serverId.value);
  } catch (error) {
    // Error handling is done in the composable
  }
};


// Lifecycle
onMounted(async () => {
  // Fetch servers if not already loaded
  if (!servers.value.length) {
    await serversStore.fetchServers();
  }

  // Fetch villages for the current server
  if (serverId.value) {
    await fetchVillages(serverId.value);
  }

  // Fetch limits
  await fetchLimits(serverId.value);
});

// Watch for serverId changes in URL
watch(serverId, async (newServerId) => {
  if (newServerId) {
    await fetchVillages(newServerId);
    await fetchLimits(newServerId);
  }
});
</script>
