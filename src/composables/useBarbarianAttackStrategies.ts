import { ref, computed } from 'vue';
import { BACKEND_URL } from './backendUrl';
import type { AttackStrategy, CreateAttackStrategyDto, UpdateAttackStrategyDto, AttackStrategyFormData } from '@/types/attack-strategies';

// Global auto-imported composable
declare const useToast: () => any;

const toast = useToast();

// State
const strategies = ref<AttackStrategy[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);

// Computed
const strategiesCount = computed(() => strategies.value.length);

// API Base URL
const API_BASE = `${BACKEND_URL}/api/mini-attack-strategies`;

// Helper functions
const convertFormDataToDto = (formData: AttackStrategyFormData, serverId: number, villageId: string): CreateAttackStrategyDto => {
  const dto: CreateAttackStrategyDto = { serverId, villageId };

  Object.entries(formData).forEach(([key, value]) => {
    if (key === 'villageId') return;

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      (dto as any)[key] = numValue;
    } else {
      (dto as any)[key] = 0;
    }
  });

  return dto;
};

const convertStrategyToFormData = (strategy: AttackStrategy): AttackStrategyFormData => {
  return {
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

// API Functions
const fetchStrategies = async (serverId?: number) => {
  try {
    isLoading.value = true;
    // Strategies for barbarian villages can only be fetched with a serverId.
    if (!serverId) {
      strategies.value = [];
      isLoading.value = false;
      return;
    }
    const url = `${API_BASE}?serverId=${serverId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch barbarian attack strategies');
    }

    strategies.value = await response.json();
  } catch (error) {
    console.error('Error fetching barbarian strategies:', error);
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się pobrać strategii ataku na wioski barbarzyńskie',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
};


const createStrategy = async (formData: AttackStrategyFormData, serverId: number, villageId: string) => {
    try {
      isCreating.value = true;
      const dto = convertFormDataToDto(formData, serverId, villageId);

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to create strategy (${response.status})`;
        throw new Error(errorMessage);
      }

      const newStrategy = await response.json();
      strategies.value.push(newStrategy);

      toast.add({
        title: 'Sukces',
        description: 'Strategia ataku na wioski barbarzyńskie została utworzona',
        color: 'green'
      });

      return newStrategy;
    } catch (error) {
      console.error('Error creating barbarian strategy:', error);
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  const updateStrategy = async (id: number, formData: AttackStrategyFormData, serverId: number, villageId: string) => {
    try {
      isUpdating.value = true;
      const dto = convertFormDataToDto(formData, serverId, villageId);
      const { serverId: _, villageId: __, ...updateDto } = dto;

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update strategy (${response.status})`;
        throw new Error(errorMessage);
      }

      const updatedStrategy = await response.json();
      const index = strategies.value.findIndex(s => s.id === id);
      if (index !== -1) {
        strategies.value[index] = updatedStrategy;
      }

      toast.add({
        title: 'Sukces',
        description: 'Strategia ataku na wioski barbarzyńskie została zaktualizowana',
        color: 'green'
      });

      return updatedStrategy;
    } catch (error) {
      console.error('Error updating barbarian strategy:', error);
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować strategii ataku na wioski barbarzyńskie',
        color: 'red'
      });
      throw error;
    } finally {
      isUpdating.value = false;
    }
  };

  const deleteStrategy = async (id: number) => {
    try {
      isDeleting.value = true;

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to delete strategy (${response.status})`;
        throw new Error(errorMessage);
      }

      strategies.value = strategies.value.filter(s => s.id !== id);

      toast.add({
        title: 'Sukces',
        description: 'Strategia ataku na wioski barbarzyńskie została usunięta',
        color: 'green'
      });
    } catch (error) {
      console.error('Error deleting barbarian strategy:', error);
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się usunąć strategii ataku na wioski barbarzyńskie',
        color: 'red'
      });
      throw error;
    } finally {
      isDeleting.value = false;
    }
  };

// Utility functions
const getStrategyById = (id: number) => {
  return strategies.value.find(s => s.id === id);
};

const getStrategiesByVillage = async (serverId: number, villageId: string) => {
    try {
      const response = await fetch(`${API_BASE}/${serverId}/${villageId}/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch barbarian village strategies');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching barbarian village strategies:', error);
      return null;
    }
  };

const clearStrategies = () => {
  strategies.value = [];
};

export const useBarbarianAttackStrategies = () => {
  return {
    strategies,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    strategiesCount,
    fetchStrategies,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    getStrategyById,
    getStrategiesByVillage,
    clearStrategies,
    convertStrategyToFormData,
  };
};
