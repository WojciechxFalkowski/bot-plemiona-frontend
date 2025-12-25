import { ref, computed } from 'vue';
import { BACKEND_URL } from './backendUrl';
import type { ArmyTrainingStrategy, CreateArmyTrainingStrategyDto, UpdateArmyTrainingStrategyDto, ArmyTrainingStrategyFormData } from '@/types/army-training-strategies';

// Global auto-imported composable
declare const useToast: () => any;

const toast = useToast();

// State
const strategies = ref<ArmyTrainingStrategy[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);

// Computed
const strategiesCount = computed(() => strategies.value.length);

// API Base URL
const API_BASE = `${BACKEND_URL}/api/army-training-strategies`;

// Helpers
const toCreateDto = (form: ArmyTrainingStrategyFormData & { villageId: string; is_active?: boolean }, serverId: number): CreateArmyTrainingStrategyDto => {
  const dto: CreateArmyTrainingStrategyDto = { serverId, villageId: form.villageId };
  Object.entries(form).forEach(([key, value]) => {
    if (key === 'villageId') return;
    if (key === 'is_active') {
      (dto as any)[key] = value;
      return;
    }
    if (key === 'max_total_per_unit') {
      (dto as any)[key] = value === '' ? null : parseInt(value);
      return;
    }
    const num = parseInt(value as string);
    (dto as any)[key] = isNaN(num) ? 0 : num;
  });
  return dto;
};

const toUpdateDto = (form: Partial<ArmyTrainingStrategyFormData>): UpdateArmyTrainingStrategyDto => {
  const dto: UpdateArmyTrainingStrategyDto = {};
  Object.entries(form).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === 'villageId') {
      (dto as any)[key] = value as string;
      return;
    }
    if (key === 'is_active') {
      (dto as any)[key] = value;
      return;
    }
    if (key === 'max_total_per_unit') {
      (dto as any)[key] = value === '' ? null : parseInt(value as string);
      return;
    }
    const num = parseInt(value as string);
    (dto as any)[key] = isNaN(num) ? 0 : num;
  });
  return dto;
};

// API
const fetchStrategies = async (serverId?: number) => {
  try {
    isLoading.value = true;
    const url = serverId ? `${API_BASE}/server/${serverId}` : API_BASE;
    const res = await fetch(url);
    strategies.value = await res.json();
  } catch (err: any) {
    toast.add({ title: 'Błąd', description: err?.message || 'Nie udało się pobrać strategii', color: 'red' });
  } finally {
    isLoading.value = false;
  }
};

const createStrategy = async (form: ArmyTrainingStrategyFormData & { villageId: string }, serverId: number) => {
  try {
    isCreating.value = true;
    const dto = toCreateDto(form, serverId);
    const res = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) });
    if (!res.ok) throw new Error('Nie udało się utworzyć strategii');
    await fetchStrategies(serverId);
  } catch (err: any) {
    toast.add({ title: 'Błąd', description: err?.message || 'Nie udało się utworzyć strategii', color: 'red' });
  } finally {
    isCreating.value = false;
  }
};

const updateStrategy = async (id: number, form: Partial<ArmyTrainingStrategyFormData>, serverId?: number) => {
  try {
    isUpdating.value = true;
    const dto = toUpdateDto(form);
    const res = await fetch(`${API_BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) });
    if (!res.ok) throw new Error('Nie udało się zaktualizować strategii');
    await fetchStrategies(serverId);
  } catch (err: any) {
    toast.add({ title: 'Błąd', description: err?.message || 'Nie udało się zaktualizować strategii', color: 'red' });
  } finally {
    isUpdating.value = false;
  }
};

const deleteStrategy = async (id: number, serverId?: number) => {
  try {
    isDeleting.value = true;
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Nie udało się usunąć strategii');
    await fetchStrategies(serverId);
  } catch (err: any) {
    toast.add({ title: 'Błąd', description: err?.message || 'Nie udało się usunąć strategii', color: 'red' });
  } finally {
    isDeleting.value = false;
  }
};

const clearStrategies = () => { strategies.value = []; };

export const useArmyTrainingStrategies = () => ({
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
  clearStrategies,
});


