<template>
  <div class="village-units-config-view">
    <!-- Server not selected message -->
    <div v-if="!route.query.serverId" class="no-server-selected">
      <UCard>
        <div class="text-center py-12">
          <UIcon name="i-lucide-server" class="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            Wybierz serwer
          </h3>
          <p class="text-gray-600 mb-6">
            Aby zobaczyć konfigurację jednostek zbieractwa, wybierz serwer z menu po lewej stronie.
          </p>
          <UButton icon="i-lucide-arrow-left" label="Otwórz menu" color="primary" @click="toggleDrawer" />
        </div>
      </UCard>
    </div>

    <!-- Server selected content -->
    <div v-else class="server-content">
      <div class="mb-4 sm:mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div class="min-w-0">
            <h1 class="text-lg sm:text-2xl font-bold text-gray-900">Konfiguracja jednostek zbieractwa</h1>
            <p class="text-xs sm:text-sm text-gray-600 mt-1">
              Zarządzaj włączonymi jednostkami dla zbieractwa w wioskach
            </p>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              variant="outline"
              icon="i-lucide-send"
              size="sm"
              class="cursor-pointer flex-shrink-0"
              @click="openTriggerModal"
            >
              <span class="hidden sm:inline">Wyślij zbieractwo</span>
            </UButton>
            <UButton
              variant="outline"
              icon="i-heroicons-arrow-path"
              :loading="isLoading"
              size="sm"
              class="cursor-pointer flex-shrink-0"
              @click="handleRefresh"
            >
              <span class="hidden sm:inline">Odśwież</span>
            </UButton>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-4 sm:gap-6 mb-4 text-sm">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span class="text-gray-600">Łącznie wiosek:</span>
            <span class="font-semibold text-gray-900">{{ configs.length }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sword" class="w-4 h-4 text-green-600 flex-shrink-0" />
            <span class="text-gray-600">Z włączonymi jednostkami:</span>
            <span class="font-semibold text-gray-900">{{ villagesWithEnabledUnits }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && configs.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
        <p class="mt-2 text-sm text-gray-600">Ładowanie konfiguracji jednostek...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading && configs.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-settings-2" class="w-12 h-12 text-gray-400 mx-auto" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Brak konfiguracji</h3>
        <p class="mt-2 text-sm text-gray-600">
          Brak wiosek dla wybranego serwera
        </p>
      </div>

      <!-- Configs List - Horizontal rows -->
      <div v-else class="space-y-3">
        <VillageUnitsConfigCard
          v-for="config in configs"
          :key="config.villageId"
          :config="config"
          :is-updating="isUpdating"
          @update="handleUpdateConfig"
        />
      </div>
    </div>

    <!-- Modal do wyboru wioski i wysłania zbieractwa -->
    <UModal v-model:open="isTriggerModalOpen" title="Wyślij zbieractwo dla wioski">
      <template #body>
        <div class="space-y-4">
          <USelect
            v-model="selectedVillageId"
            :items="villageOptions"
            placeholder="Wybierz wioskę"
            value-key="value"
            label-key="label"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="outline"
            label="Anuluj"
            @click="isTriggerModalOpen = false"
          />
          <UButton
            label="Wyślij"
            :loading="isTriggering"
            :disabled="!selectedVillageId"
            @click="handleTriggerScavenging"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useVillageUnitsConfig } from '@/composables/useVillageUnitsConfig';
import { useServersStore } from '@/stores/servers';
import { BACKEND_URL } from '@/composables/backendUrl';
import type { ScavengingUnitsConfig } from '@/types/village-units-config';
import VillageUnitsConfigCard from '@/components/village-units-config/VillageUnitsConfigCard.vue';

declare const useToast: () => any;
const toast = useToast();

const route = useRoute();
const serversStore = useServersStore();

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId;
  return id ? parseInt(id as string) : undefined;
});

// Composables
const {
  serverConfigs: configs,
  isLoading,
  isUpdating,
  fetchServerConfig,
  updateConfig,
} = useVillageUnitsConfig();

const villagesWithEnabledUnits = computed(() => {
  return configs.value.filter(config => {
    return Object.values(config.units).some(enabled => enabled === true);
  }).length;
});

// Modal state
const isTriggerModalOpen = ref(false);
const selectedVillageId = ref<string | null>(null);
const isTriggering = ref(false);

const villageOptions = computed(() => {
  return configs.value.map(config => ({
    label: `${config.villageName} (ID: ${config.villageId})`,
    value: config.villageId,
  }));
});

const openTriggerModal = () => {
  selectedVillageId.value = null;
  isTriggerModalOpen.value = true;
};

const handleTriggerScavenging = async () => {
  if (!selectedVillageId.value || !serverId.value) return;

  isTriggering.value = true;
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/advanced-scavenging/${serverId.value}/village/${selectedVillageId.value}/trigger-scavenging`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd podczas wysyłania zbieractwa');
    }

    const result = await response.json();
    
    toast.add({
      title: 'Zbieractwo uruchomione',
      description: result.message || `Wysłano ${result.dispatchedCount} misji zbieractwa`,
      color: 'success',
    });

    isTriggerModalOpen.value = false;
    selectedVillageId.value = null;
  } catch (error) {
    toast.add({
      title: 'Błąd',
      description: error instanceof Error ? error.message : 'Nie udało się wysłać zbieractwa',
      color: 'error',
    });
  } finally {
    isTriggering.value = false;
  }
};

// Methods
const toggleDrawer = () => {
  const hamburgerBtn = document.querySelector('.hamburger-btn') as HTMLElement;
  hamburgerBtn?.click();
};

const handleRefresh = async () => {
  if (serverId.value) {
    await fetchServerConfig(serverId.value);
  }
};

const handleUpdateConfig = async (villageId: string, units: ScavengingUnitsConfig) => {
  const updatedConfig = configs.value.find(c => c.villageId === villageId);

  if (!updatedConfig) {
    console.error(`Config not found for village ${villageId}`);
    return;
  }

  const originalUnits = { ...updatedConfig.units };

  try {
    await updateConfig(
      updatedConfig.serverId,
      updatedConfig.villageId,
      units
    );
    // Refresh configs to get updated state
    if (serverId.value) {
      await fetchServerConfig(serverId.value);
    }
  } catch (error) {
    // On error, revert UI state
    const index = configs.value.findIndex(c => c.villageId === villageId);
    if (index !== -1) {
      configs.value[index].units = originalUnits;
    }
    if (serverId.value) {
      await fetchServerConfig(serverId.value);
    }
  }
};

// Watch for serverId changes in URL
watch(serverId, async (newServerId) => {
  if (newServerId) {
    await fetchServerConfig(newServerId);
  } else {
    configs.value = [];
  }
}, { immediate: true });

// Lifecycle
onMounted(async () => {
  if (!serversStore.servers.length) {
    await serversStore.fetchServers();
  }
});
</script>

<style scoped>
.no-server-selected {
  margin-top: 2rem;
}
</style>

