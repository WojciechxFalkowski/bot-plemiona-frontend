import { ref } from 'vue';
import { BACKEND_URL } from './backendUrl';
import type { VillageUnitsConfig, ScavengingUnitsConfig } from '@/types/village-units-config';

// Global auto-imported composable
declare const useToast: () => any;

const toast = useToast();

// State
const config = ref<VillageUnitsConfig | null>(null);
const serverConfigs = ref<VillageUnitsConfig[]>([]);
const isLoading = ref(false);
const isUpdating = ref(false);

// API Base URL
const API_BASE = `${BACKEND_URL}/api/advanced-scavenging`;

// API functions
const fetchConfig = async (serverId: number, villageId: string): Promise<VillageUnitsConfig | null> => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE}/${serverId}/village/${villageId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Config not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: VillageUnitsConfig = await response.json();
    config.value = data;
    return data;
  } catch (error) {
    console.error('Error fetching village units config:', error);
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się pobrać konfiguracji jednostek',
      color: 'red'
    });
    return null;
  } finally {
    isLoading.value = false;
  }
};

const fetchServerConfig = async (serverId: number): Promise<VillageUnitsConfig[]> => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE}/${serverId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: VillageUnitsConfig[] = await response.json();
    serverConfigs.value = data;
    return data;
  } catch (error) {
    console.error('Error fetching server units config:', error);
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się pobrać konfiguracji jednostek dla serwera',
      color: 'red'
    });
    return [];
  } finally {
    isLoading.value = false;
  }
};

const updateConfig = async (
  serverId: number,
  villageId: string,
  units: ScavengingUnitsConfig
): Promise<VillageUnitsConfig | null> => {
  isUpdating.value = true;
  try {
    const response = await fetch(`${API_BASE}/${serverId}/village/${villageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ units })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const updatedConfig: VillageUnitsConfig = await response.json();
    
    // Update local state
    if (config.value && config.value.villageId === villageId) {
      config.value = updatedConfig;
    }
    
    // Update in server configs array
    const index = serverConfigs.value.findIndex(c => c.villageId === villageId);
    if (index !== -1) {
      serverConfigs.value[index] = updatedConfig;
    }

    toast.add({
      title: 'Sukces',
      description: 'Konfiguracja jednostek została zaktualizowana',
      color: 'green'
    });

    return updatedConfig;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas aktualizacji konfiguracji';
    toast.add({
      title: 'Błąd',
      description: errorMessage,
      color: 'red'
    });
    throw error;
  } finally {
    isUpdating.value = false;
  }
};

export function useVillageUnitsConfig() {
  return {
    // State
    config,
    serverConfigs,
    isLoading,
    isUpdating,

    // Methods
    fetchConfig,
    fetchServerConfig,
    updateConfig,
  };
}

