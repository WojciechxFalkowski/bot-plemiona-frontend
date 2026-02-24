import { ref, computed } from 'vue';
import { BACKEND_URL } from './backendUrl';
import type { ScavengingLimit, GlobalScavengingLimit, CreateScavengingLimitDto, ScavengingLimitFormData, GlobalScavengingLimitFormData } from '@/types/scavenging-limits';

// Global auto-imported composable
declare const useToast: () => any;

const toast = useToast();

// State
const limits = ref<ScavengingLimit[]>([]);
const globalLimit = ref<GlobalScavengingLimit | null>(null);
const isLoading = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);
const isSavingGlobalLimit = ref(false);

// Computed
const limitsCount = computed(() => limits.value.length);

// API Base URL
const API_BASE = `${BACKEND_URL}/api/scavenging-limits`;

// Helper functions
const parseNullableInt = (value: string | undefined): number | null => {
  if (!value || value === '') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
};

const convertFormDataToDto = (formData: ScavengingLimitFormData): CreateScavengingLimitDto => {
  return {
    serverId: parseInt(formData.serverId || '0'),
    villageId: formData.villageId,
    maxSpearUnits: parseNullableInt(formData.maxSpearUnits),
    maxSwordUnits: parseNullableInt(formData.maxSwordUnits),
    maxAxeUnits: parseNullableInt(formData.maxAxeUnits),
    maxArcherUnits: parseNullableInt(formData.maxArcherUnits),
    maxLightUnits: parseNullableInt(formData.maxLightUnits),
    maxMarcherUnits: parseNullableInt(formData.maxMarcherUnits),
    maxHeavyUnits: parseNullableInt(formData.maxHeavyUnits),
  };
};

const convertLimitToFormData = (limit: ScavengingLimit): ScavengingLimitFormData => {
  return {
    serverId: limit.serverId.toString(),
    villageId: limit.villageId,
    maxSpearUnits: limit.maxSpearUnits?.toString() || '',
    maxSwordUnits: limit.maxSwordUnits?.toString() || '',
    maxAxeUnits: limit.maxAxeUnits?.toString() || '',
    maxArcherUnits: limit.maxArcherUnits?.toString() || '',
    maxLightUnits: limit.maxLightUnits?.toString() || '',
    maxMarcherUnits: limit.maxMarcherUnits?.toString() || '',
    maxHeavyUnits: limit.maxHeavyUnits?.toString() || '',
  };
};

const convertGlobalLimitToFormData = (limit: GlobalScavengingLimit | null): GlobalScavengingLimitFormData => {
  if (!limit) return { maxSpearUnits: '', maxSwordUnits: '', maxAxeUnits: '', maxArcherUnits: '', maxLightUnits: '', maxMarcherUnits: '', maxHeavyUnits: '' };
  return {
    maxSpearUnits: limit.maxSpearUnits?.toString() || '',
    maxSwordUnits: limit.maxSwordUnits?.toString() || '',
    maxAxeUnits: limit.maxAxeUnits?.toString() || '',
    maxArcherUnits: limit.maxArcherUnits?.toString() || '',
    maxLightUnits: limit.maxLightUnits?.toString() || '',
    maxMarcherUnits: limit.maxMarcherUnits?.toString() || '',
    maxHeavyUnits: limit.maxHeavyUnits?.toString() || '',
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

const fetchGlobalLimit = async (serverId: number): Promise<GlobalScavengingLimit | null> => {
  try {
    const response = await fetch(`${API_BASE}/global?serverId=${serverId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    if (!text || text.trim() === '') {
      globalLimit.value = null;
      return null;
    }
    const data: GlobalScavengingLimit = JSON.parse(text);
    globalLimit.value = data;
    return data;
  } catch (error) {
    console.error('Error fetching global scavenging limit:', error);
    globalLimit.value = null;
    return null;
  }
};

const saveGlobalLimit = async (serverId: number, formData: GlobalScavengingLimitFormData): Promise<GlobalScavengingLimit | null> => {
  isSavingGlobalLimit.value = true;
  try {
    const body: Record<string, number | null> = {};
    const spear = parseNullableInt(formData.maxSpearUnits);
    const sword = parseNullableInt(formData.maxSwordUnits);
    const axe = parseNullableInt(formData.maxAxeUnits);
    const archer = parseNullableInt(formData.maxArcherUnits);
    const light = parseNullableInt(formData.maxLightUnits);
    const marcher = parseNullableInt(formData.maxMarcherUnits);
    const heavy = parseNullableInt(formData.maxHeavyUnits);
    if (spear !== null) body.maxSpearUnits = spear;
    if (sword !== null) body.maxSwordUnits = sword;
    if (axe !== null) body.maxAxeUnits = axe;
    if (archer !== null) body.maxArcherUnits = archer;
    if (light !== null) body.maxLightUnits = light;
    if (marcher !== null) body.maxMarcherUnits = marcher;
    if (heavy !== null) body.maxHeavyUnits = heavy;

    const response = await fetch(`${API_BASE}/global?serverId=${serverId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GlobalScavengingLimit = await response.json();
    globalLimit.value = data;
    toast.add({ title: 'Sukces', description: 'Limit globalny został zapisany', color: 'green' });
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas zapisywania limitu globalnego';
    toast.add({ title: 'Błąd', description: errorMessage, color: 'red' });
    throw error;
  } finally {
    isSavingGlobalLimit.value = false;
  }
};

const deleteGlobalLimit = async (serverId: number): Promise<void> => {
  isSavingGlobalLimit.value = true;
  try {
    const response = await fetch(`${API_BASE}/global?serverId=${serverId}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    globalLimit.value = null;
    toast.add({ title: 'Sukces', description: 'Limit globalny został usunięty', color: 'green' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas usuwania limitu globalnego';
    toast.add({ title: 'Błąd', description: errorMessage, color: 'red' });
    throw error;
  } finally {
    isSavingGlobalLimit.value = false;
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

    const requestBody: Partial<CreateScavengingLimitDto> = {};
    if (dto.maxSpearUnits !== null && dto.maxSpearUnits !== undefined) requestBody.maxSpearUnits = dto.maxSpearUnits;
    if (dto.maxSwordUnits !== null && dto.maxSwordUnits !== undefined) requestBody.maxSwordUnits = dto.maxSwordUnits;
    if (dto.maxAxeUnits !== null && dto.maxAxeUnits !== undefined) requestBody.maxAxeUnits = dto.maxAxeUnits;
    if (dto.maxArcherUnits !== null && dto.maxArcherUnits !== undefined) requestBody.maxArcherUnits = dto.maxArcherUnits;
    if (dto.maxLightUnits !== null && dto.maxLightUnits !== undefined) requestBody.maxLightUnits = dto.maxLightUnits;
    if (dto.maxMarcherUnits !== null && dto.maxMarcherUnits !== undefined) requestBody.maxMarcherUnits = dto.maxMarcherUnits;
    if (dto.maxHeavyUnits !== null && dto.maxHeavyUnits !== undefined) requestBody.maxHeavyUnits = dto.maxHeavyUnits;

    console.log('Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
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

type ScavengingUnit = 'spear' | 'sword' | 'axe' | 'archer' | 'light' | 'marcher' | 'heavy';

const getTotalLimitForUnit = (unit: ScavengingUnit): number => {
  const unitLimitKey: Record<ScavengingUnit, 'maxSpearUnits' | 'maxSwordUnits' | 'maxAxeUnits' | 'maxArcherUnits' | 'maxLightUnits' | 'maxMarcherUnits' | 'maxHeavyUnits'> = {
    spear: 'maxSpearUnits',
    sword: 'maxSwordUnits',
    axe: 'maxAxeUnits',
    archer: 'maxArcherUnits',
    light: 'maxLightUnits',
    marcher: 'maxMarcherUnits',
    heavy: 'maxHeavyUnits',
  };

  return limits.value.reduce((sum, limit) => {
    const limitValue = limit[unitLimitKey[unit]];
    return sum + (typeof limitValue === 'number' ? limitValue : 0);
  }, 0);
};

export function useScavengingLimits() {
  return {
    // State
    limits,
    globalLimit,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isSavingGlobalLimit,

    // Computed
    limitsCount,

    // Methods
    fetchLimits,
    fetchLimitByServerAndVillage,
    fetchGlobalLimit,
    saveGlobalLimit,
    deleteGlobalLimit,
    createLimit,
    updateLimit,
    deleteLimit,
    deleteLimitById,

    // Helpers
    convertFormDataToDto,
    convertLimitToFormData,
    convertGlobalLimitToFormData,
    getTotalLimitForUnit
  };
}
