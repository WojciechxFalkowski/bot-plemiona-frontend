import { ref, computed } from 'vue';
import { BACKEND_URL } from './backendUrl';
import type { ScavengingLimit, CreateScavengingLimitDto, UpdateScavengingLimitDto, ScavengingLimitFormData } from '@/types/scavenging-limits';

// Global auto-imported composable
declare const useToast: () => any;

const toast = useToast();

// State
const limits = ref<ScavengingLimit[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);

// Computed
const limitsCount = computed(() => limits.value.length);

// API Base URL
const API_BASE = `${BACKEND_URL}/api/scavenging-limits`;

// Helper functions
const convertFormDataToDto = (formData: ScavengingLimitFormData): CreateScavengingLimitDto => {
  return {
    serverId: parseInt(formData.serverId || '0'),
    villageId: formData.villageId,
    maxSpearUnits: parseInt(formData.maxSpearUnits) || 0
  };
};

const convertLimitToFormData = (limit: ScavengingLimit): ScavengingLimitFormData => {
  return {
    serverId: limit.serverId.toString(),
    villageId: limit.villageId,
    maxSpearUnits: limit.maxSpearUnits.toString()
  };
};

// API functions
const fetchLimits = async (serverId?: number) => {
  isLoading.value = true;
  try {
    const url = serverId ? `${API_BASE}?serverId=${serverId}` : API_BASE;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ScavengingLimit[] = await response.json();
    limits.value = data;
  } catch (error) {
    console.error('Error fetching scavenging limits:', error);
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się pobrać limitów zbieractwa',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
};

const fetchLimitByServerAndVillage = async (serverId: number, villageId: string): Promise<ScavengingLimit | null> => {
  try {
    const response = await fetch(`${API_BASE}/village?serverId=${serverId}&villageId=${villageId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Limit not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching scavenging limit:', error);
    return null;
  }
};

const createLimit = async (formData: ScavengingLimitFormData) => {
  isCreating.value = true;
  try {
    console.log('Creating limit with form data:', formData);
    const dto = convertFormDataToDto(formData);
    console.log('Converted DTO:', dto);

    const url = `${API_BASE}/village?serverId=${dto.serverId}&villageId=${dto.villageId}`;
    console.log('Request URL:', url);
    console.log('Request body:', { maxSpearUnits: dto.maxSpearUnits });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maxSpearUnits: dto.maxSpearUnits })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const newLimit: ScavengingLimit = await response.json();
    limits.value.push(newLimit);

    toast.add({
      title: 'Sukces',
      description: 'Limit zbieractwa został utworzony',
      color: 'green'
    });

    return newLimit;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas tworzenia limitu';
    toast.add({
      title: 'Błąd',
      description: errorMessage,
      color: 'red'
    });
    throw error;
  } finally {
    isCreating.value = false;
  }
};

const updateLimit = async (id: number, formData: ScavengingLimitFormData) => {
  isUpdating.value = true;
  try {
    const dto = convertFormDataToDto(formData);
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const updatedLimit: ScavengingLimit = await response.json();
    const index = limits.value.findIndex(l => l.id === id);
    if (index !== -1) {
      limits.value[index] = updatedLimit;
    }

    toast.add({
      title: 'Sukces',
      description: 'Limit zbieractwa został zaktualizowany',
      color: 'green'
    });

    return updatedLimit;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas aktualizacji limitu';
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

const deleteLimit = async (serverId: number, villageId: string) => {
  isDeleting.value = true;
  try {
    const response = await fetch(`${API_BASE}/village?serverId=${serverId}&villageId=${villageId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    limits.value = limits.value.filter(l => !(l.serverId === serverId && l.villageId === villageId));

    toast.add({
      title: 'Sukces',
      description: 'Limit zbieractwa został usunięty',
      color: 'green'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas usuwania limitu';
    toast.add({
      title: 'Błąd',
      description: errorMessage,
      color: 'red'
    });
    throw error;
  } finally {
    isDeleting.value = false;
  }
};

const deleteLimitById = async (id: number) => {
  isDeleting.value = true;
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    limits.value = limits.value.filter(l => l.id !== id);

    toast.add({
      title: 'Sukces',
      description: 'Limit zbieractwa został usunięty',
      color: 'green'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas usuwania limitu';
    toast.add({
      title: 'Błąd',
      description: errorMessage,
      color: 'red'
    });
    throw error;
  } finally {
    isDeleting.value = false;
  }
};

export function useScavengingLimits() {
  return {
    // State
    limits,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Computed
    limitsCount,

    // Methods
    fetchLimits,
    fetchLimitByServerAndVillage,
    createLimit,
    updateLimit,
    deleteLimit,
    deleteLimitById,

    // Helpers
    convertFormDataToDto,
    convertLimitToFormData
  };
}
