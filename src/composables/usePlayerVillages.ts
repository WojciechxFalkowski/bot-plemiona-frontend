import { ref, computed, readonly } from 'vue';
import { BACKEND_URL } from './backendUrl';
import type {
  PlayerVillage,
  CreatePlayerVillageData,
  UpdatePlayerVillageData,
  VerifyVillageData,
  PlayerVillageAttackStrategy,
  CreatePlayerVillageAttackStrategyData,
  UpdatePlayerVillageAttackStrategyData
} from '@/types/player-villages';

// Global auto-imported composable
declare const useToast: () => any;

export const usePlayerVillages = () => {
  const toast = useToast();

  // State
  const villages = ref<PlayerVillage[]>([]);
  const attackStrategies = ref<PlayerVillageAttackStrategy[]>([]);
  const isLoading = ref(false);
  const isRefreshing = ref(false);
  const isExecutingAttacks = ref(false);
  const searchQuery = ref('');
  const statusFilter = ref<string | null>(null);

  // Server options - będzie pobierane z useServers
  const servers = ref([
    { id: 1, serverName: 'Test Server', serverCode: 'pl216' }
  ]);

  const serverOptions = computed(() =>
    servers.value.map(server => ({
      label: `${server.serverName} (${server.serverCode})`,
      value: server.id
    }))
  );

  const statusOptions = [
    { label: 'Wszystkie', value: null },
    { label: 'Do ataku', value: 'attackable' },
    { label: 'Nie dostępne', value: 'not-attackable' }
  ];

  // Filtered villages
  const filteredVillages = computed(() => {
    let filtered = villages.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.owner.toLowerCase().includes(query) ||
        v.coordinateX.toString().includes(query) ||
        v.coordinateY.toString().includes(query)
      );
    }

    if (statusFilter.value) {
      if (statusFilter.value === 'attackable') {
        filtered = filtered.filter(v => v.canAttack);
      } else if (statusFilter.value === 'not-attackable') {
        filtered = filtered.filter(v => !v.canAttack);
      }
    }

    return filtered;
  });

  // Village actions
  const fetchVillages = async (): Promise<void> => {
    try {
      isLoading.value = true;
      const response = await fetch(`${BACKEND_URL}/api/player-villages`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlayerVillage[] = await response.json();
      villages.value = data;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się pobrać wiosek graczy',
        color: 'red'
      });
    } finally {
      isLoading.value = false;
    }
  };

  const refreshVillages = async (): Promise<void> => {
    try {
      isRefreshing.value = true;
      await fetchVillages();
      toast.add({
        title: 'Sukces',
        description: 'Lista wiosek została odświeżona',
        color: 'green'
      });
    } finally {
      isRefreshing.value = false;
    }
  };

  const createVillage = async (data: CreatePlayerVillageData): Promise<PlayerVillage> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-villages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PlayerVillage = await response.json();
      await fetchVillages();
      toast.add({
        title: 'Sukces',
        description: 'Wioska gracza została dodana',
        color: 'green'
      });
      return result;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się dodać wioski gracza',
        color: 'red'
      });
      throw error;
    }
  };

  const createVillageFromUrl = async (serverId: number, url: string): Promise<PlayerVillage> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-villages/${serverId}/from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PlayerVillage = await response.json();
      await fetchVillages();
      toast.add({
        title: 'Sukces',
        description: 'Wioska gracza została dodana z URL',
        color: 'green'
      });
      return result;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się dodać wioski gracza z URL',
        color: 'red'
      });
      throw error;
    }
  };

  const updateVillage = async (id: number, data: UpdatePlayerVillageData): Promise<PlayerVillage> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-villages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PlayerVillage = await response.json();
      await fetchVillages();
      toast.add({
        title: 'Sukces',
        description: 'Wioska gracza została zaktualizowana',
        color: 'green'
      });
      return result;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować wioski gracza',
        color: 'red'
      });
      throw error;
    }
  };

  const deleteVillage = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-villages/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchVillages();
      toast.add({
        title: 'Sukces',
        description: 'Wioska gracza została usunięta',
        color: 'green'
      });
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się usunąć wioski gracza',
        color: 'red'
      });
      throw error;
    }
  };

  const verifyVillageOwner = async (id: number, serverCode: string): Promise<VerifyVillageData> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-villages/${id}/verify-owner?serverCode=${serverCode}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: VerifyVillageData = await response.json();
      await fetchVillages();
      toast.add({
        title: 'Sukces',
        description: 'Weryfikacja właściciela zakończona',
        color: 'green'
      });
      return result;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się zweryfikować właściciela wioski',
        color: 'red'
      });
      throw error;
    }
  };

  const executeAttacks = async (serverId: number): Promise<void> => {
    try {
      isExecutingAttacks.value = true;
      const response = await fetch(`${BACKEND_URL}/api/player-villages/execute-attacks/${serverId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.add({
        title: 'Sukces',
        description: 'Ataki na wioski graczy zostały wykonane',
        color: 'green'
      });
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się wykonać ataków',
        color: 'red'
      });
      throw error;
    } finally {
      isExecutingAttacks.value = false;
    }
  };

  // Attack Strategy actions
  const fetchAttackStrategies = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-village-attack-strategies`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlayerVillageAttackStrategy[] = await response.json();
      attackStrategies.value = data;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się pobrać strategii ataków',
        color: 'red'
      });
    }
  };

  const createAttackStrategy = async (data: CreatePlayerVillageAttackStrategyData): Promise<PlayerVillageAttackStrategy> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-village-attack-strategies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PlayerVillageAttackStrategy = await response.json();
      await fetchAttackStrategies();
      toast.add({
        title: 'Sukces',
        description: 'Strategia ataku została dodana',
        color: 'green'
      });
      return result;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się dodać strategii ataku',
        color: 'red'
      });
      throw error;
    }
  };

  const updateAttackStrategy = async (id: number, data: UpdatePlayerVillageAttackStrategyData): Promise<PlayerVillageAttackStrategy> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-village-attack-strategies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PlayerVillageAttackStrategy = await response.json();
      await fetchAttackStrategies();
      toast.add({
        title: 'Sukces',
        description: 'Strategia ataku została zaktualizowana',
        color: 'green'
      });
      return result;
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować strategii ataku',
        color: 'red'
      });
      throw error;
    }
  };

  const deleteAttackStrategy = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/player-village-attack-strategies/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchAttackStrategies();
      toast.add({
        title: 'Sukces',
        description: 'Strategia ataku została usunięta',
        color: 'green'
      });
    } catch (error) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się usunąć strategii ataku',
        color: 'red'
      });
      throw error;
    }
  };

  // Filter actions
  const handleServerChange = () => {
    // Server change logic if needed
  };

  // Utility functions
  const formatDate = (date?: Date): string => {
    if (!date) return 'Nigdy';
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const getAttackStatusColor = (canAttack: boolean): string => {
    return canAttack ? 'green' : 'red';
  };

  const getAttackStatusText = (canAttack: boolean): string => {
    return canAttack ? 'Atakowalne' : 'Nieatakowalne';
  };

  return {
    // State
    villages: readonly(villages),
    attackStrategies: readonly(attackStrategies),
    isLoading: readonly(isLoading),
    isRefreshing: readonly(isRefreshing),
    isExecutingAttacks: readonly(isExecutingAttacks),
    searchQuery,
    statusFilter,
    serverOptions,
    statusOptions,
    filteredVillages,

    // Village actions
    fetchVillages,
    refreshVillages,
    createVillage,
    createVillageFromUrl,
    updateVillage,
    deleteVillage,
    verifyVillageOwner,
    executeAttacks,

    // Attack strategy actions
    fetchAttackStrategies,
    createAttackStrategy,
    updateAttackStrategy,
    deleteAttackStrategy,

    // Filter actions
    handleServerChange,

    // Utility functions
    formatDate,
    getAttackStatusColor,
    getAttackStatusText
  };
};
