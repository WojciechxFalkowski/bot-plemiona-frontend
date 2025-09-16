<template>
  <div class="player-villages-view">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Wioski Graczy</h1>
        <div class="flex items-center gap-4">
          <div class="flex gap-2">

            <!-- isModalOpen: {{ isModalOpen }} -->

            <UModal v-model:open="isModalOpen" title="Dodaj wioskę gracza"
              description="Dodaj nową wioskę gracza do listy">
              <UButton color="primary" icon="i-heroicons-plus" @click="handleAddVillage">
                Dodaj Wioskę
              </UButton>

              <template #body>
                <PlayerVillageModal v-if="isModalOpen" :is-open="isModalOpen" :village="selectedVillage"
                  :is-editing="isEditing" :server-options="serverOptions" @close="handleCloseModal"
                  @save="handleSaveVillage" />
              </template>
            </UModal>

            <UButton variant="outline" icon="i-heroicons-arrow-path" :loading="isRefreshing" @click="() => refreshVillages(serverId)">
              Odśwież
            </UButton>
            <UButton color="red" variant="outline" icon="i-heroicons-bolt" :loading="isExecutingAttacks"
              @click="handleExecuteAttacks">
              Wykonaj Ataki
            </UButton>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <UFormGroup label="Status">
          <USelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Filtruj po statusie"
          />
        </UFormGroup>

        <UFormGroup label="Szukaj">
          <UInput
            v-model="searchQuery"
            placeholder="Szukaj wioski..."
            icon="i-heroicons-magnifying-glass"
          />
        </UFormGroup>

        <div class="flex items-end">
          <UButton
            variant="outline"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            Wyczyść filtry
          </UButton>
        </div>
      </div> -->

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-home" class="h-8 w-8 text-blue-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Wszystkie wioski</p>
              <p class="text-2xl font-semibold text-gray-900">{{ filteredVillages.length }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-bolt" class="h-8 w-8 text-green-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Do ataku</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{filteredVillages.filter(v => v.canAttack).length}}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-shield-exclamation" class="h-8 w-8 text-red-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Nie dostępne</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{filteredVillages.filter(v => !v.canAttack).length}}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-users" class="h-8 w-8 text-purple-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Unikalni gracze</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ uniqueOwners.length }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Village List -->
    <PlayerVillageList :villages="filteredVillages" :loading="isLoading" @edit="handleEditVillage"
      @delete="handleDeleteVillage" @verify="handleVerifyVillage" />

    <!-- Modals -->



    <!-- <PlayerVillageAttackStrategyModal
      :is-open="isStrategyModalOpen"
      :strategy="selectedStrategy"
      :is-editing="isStrategyEditing"
      :server-options="serverOptions"
      @close="handleCloseStrategyModal"
      @save="handleSaveStrategy"
    /> -->

    <!-- Delete Confirmation Modal -->
    <!-- <UModal :open="isDeleteModalOpen" @close="isDeleteModalOpen = false">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Potwierdź usunięcie</h3>
        </template>
<p>Czy na pewno chcesz usunąć wioskę "{{ selectedVillage?.name }}"?</p>
<template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="isDeleteModalOpen = false">
              Anuluj
            </UButton>
            <UButton
              color="red"
              :loading="isDeleting"
              @click="confirmDelete"
            >
              Usuń
            </UButton>
          </div>
        </template>
</UCard>
</UModal> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { PlayerVillage, PlayerVillageAttackStrategy } from '@/types/player-villages';
import { usePlayerVillages } from '@/composables/usePlayerVillages';
import PlayerVillageModal from '@/components/player-villages/PlayerVillageModal.vue';
import { useRoute } from 'vue-router';

// Global auto-imported composable
declare const useToast: () => any;

const toast = useToast();
// Composables
const {
  villages,
  isLoading,
  isRefreshing,
  isExecutingAttacks,
  searchQuery,
  statusFilter,
  serverOptions,
  statusOptions,
  filteredVillages,
  fetchVillages,
  refreshVillages,
  createVillage,
  createVillageFromUrl,
  updateVillage,
  deleteVillage,
  verifyVillageOwner,
  executeAttacks,
  createAttackStrategy,
  updateAttackStrategy,
  deleteAttackStrategy,
  handleServerChange
} = usePlayerVillages();

// Modal states
const isModalOpen = ref(false);
const isStrategyModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const isStrategyEditing = ref(false);
const isDeleting = ref(false);

// Selected items
const selectedVillage = ref<PlayerVillage | null>(null);
const selectedStrategy = ref<PlayerVillageAttackStrategy | null>(null);

// Computed
// const hasActiveFilters = computed(() => {
//   return serverId.value !== null || statusFilter.value !== null || searchQuery.value !== '';
// });

const route = useRoute()

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : undefined
})

const uniqueOwners = computed(() => {
  const owners = new Set(filteredVillages.value.map(v => v.owner));
  return Array.from(owners);
});

// Methods
const handleAddVillage = () => {
  selectedVillage.value = null;
  isEditing.value = false;
  isModalOpen.value = true;
};

const handleEditVillage = (village: PlayerVillage) => {
  selectedVillage.value = village;
  isEditing.value = true;
  isModalOpen.value = true;
};

const handleDeleteVillage = (village: PlayerVillage) => {
  selectedVillage.value = village;
  isDeleteModalOpen.value = true;
};

const handleVerifyVillage = async (village: PlayerVillage) => {
  try {
    // Get server code from village's server relation or from serverId
    const serverCode = village.server?.serverCode || 'pl216'; // fallback to default
    await verifyVillageOwner(village.id, serverCode);

    // Refresh data after verification
    if (serverId.value) {
      await fetchVillages(serverId.value);
    }
  } catch (error) {
    console.error('Error verifying village:', error);
  }
};

const handleSaveVillage = async (data: any) => {
  try {
    if (isEditing.value && selectedVillage.value) {
      await updateVillage(selectedVillage.value.id, data);
    } else {
      // For new villages, we need a server ID to create from URL
      if (!serverId.value) {
        toast.add({
          title: 'Błąd',
          description: 'Wybierz serwer przed dodaniem wioski',
          color: 'red'
        });
        return;
      }
      await createVillageFromUrl(serverId.value, data.url);
    }
    handleCloseModal();
  } catch (error) {
    console.error('Error saving village:', error);
  }
};

const confirmDelete = async () => {
  if (!selectedVillage.value) return;

  try {
    isDeleting.value = true;
    await deleteVillage(selectedVillage.value.id);
    isDeleteModalOpen.value = false;
    selectedVillage.value = null;
  } catch (error) {
    console.error('Error deleting village:', error);
  } finally {
    isDeleting.value = false;
  }
};

const handleExecuteAttacks = async () => {
  if (!serverId.value) return;

  try {
    await executeAttacks(serverId.value);
  } catch (error) {
    console.error('Error executing attacks:', error);
  }
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  selectedVillage.value = null;
  isEditing.value = false;
};

const handleCloseStrategyModal = () => {
  isStrategyModalOpen.value = false;
  selectedStrategy.value = null;
  isStrategyEditing.value = false;
};

const handleSaveStrategy = async (data: any) => {
  try {
    if (isStrategyEditing.value && selectedStrategy.value) {
      await updateAttackStrategy(selectedStrategy.value.id, data);
    } else {
      await createAttackStrategy(data);
    }
    handleCloseStrategyModal();
  } catch (error) {
    console.error('Error saving strategy:', error);
  }
};

const clearFilters = () => {
  statusFilter.value = null;
  searchQuery.value = '';
};

// Watch for serverId changes and reload data
watch(serverId, async (newServerId, oldServerId) => {
  if (newServerId && newServerId !== oldServerId) {
    // Reset selected village when server changes
    selectedVillage.value = null;
    selectedStrategy.value = null;

    // Fetch new data for the selected server
    await fetchVillages(newServerId);
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  // Data will be loaded by the watcher with immediate: true
});
</script>

<style scoped>
.player-villages-view {
  /**
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
*/
}
</style>
