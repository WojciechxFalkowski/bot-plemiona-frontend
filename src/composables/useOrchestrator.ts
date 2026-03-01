import { ref, computed, readonly } from 'vue'
import { BACKEND_URL } from './backendUrl'

// Global auto-imported composable
declare const useToast: () => any

export interface OrchestratorSettings {
  constructionQueue: boolean
  miniAttacks: boolean
  scavenging: boolean
  armyTraining: boolean
  twDatabase: boolean
  twDatabaseCredentials: { login: string; password: string }
  orchestratorEnabled: boolean
}

/** Keys that can be toggled via updateSetting (boolean only) */
export type OrchestratorToggleKey =
  | 'constructionQueue'
  | 'miniAttacks'
  | 'scavenging'
  | 'armyTraining'
  | 'twDatabase'
  | 'orchestratorEnabled'

export interface OrchestratorTaskStatus {
  enabled: boolean
  nextExecution: string | null
  lastExecuted: string | null
  lastAttackTime?: string | null
  optimalDelay?: number | null
  villageId?: number | null
}

export interface OrchestratorServerTasks {
  constructionQueue: OrchestratorTaskStatus
  scavenging: OrchestratorTaskStatus
  miniAttacks: OrchestratorTaskStatus
  playerVillageAttacks: OrchestratorTaskStatus
  armyTraining: OrchestratorTaskStatus
  twDatabase: OrchestratorTaskStatus
}

export interface OrchestratorServerStatus {
  serverId: number
  serverCode: string
  serverName: string
  isActive: number | boolean
  lastSuccessfulExecution: string | null
  tasks: OrchestratorServerTasks
}

export interface OrchestratorStatus {
  activeServersCount: number
  currentServerIndex: number
  isRotating: boolean
  schedulerActive: boolean
  monitoringActive: boolean
  servers: OrchestratorServerStatus[]
}

export const useOrchestrator = () => {
  const toast = useToast()

  // State
  const loading = ref(false)
  const currentServerId = ref<number | null>(null)
  const settings = ref<OrchestratorSettings>({
    constructionQueue: false,
    miniAttacks: false,
    scavenging: false,
    armyTraining: false,
    twDatabase: false,
    twDatabaseCredentials: { login: '', password: '' },
    orchestratorEnabled: false
  })
  const globalMonitoringEnabled = ref<boolean>(true)
  const status = ref<OrchestratorStatus | null>(null)
  const error = ref<string | null>(null)
  const defaultIntervals = ref<Record<string, number> | null>(null)

  // Computed
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Methods
  const clearError = () => {
    error.value = null
  }

  const getSetting = async (serverId: number, key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/settings/${serverId}/${key}`)

      if (!response.ok) {
        if (response.status === 404) {
          return false // Default to false if setting doesn't exist
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.value || false
    } catch (err) {
      console.error(`Error fetching setting ${key}:`, err)
      return false
    }
  }

  const updateTwDatabaseSetting = async (
    serverId: number,
    payload: { value?: boolean; login?: string; password?: string }
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const body: { value?: boolean; login?: string; password?: string } = {}
      if (payload.value !== undefined) body.value = payload.value
      if (payload.login !== undefined) body.login = payload.login
      if (payload.password !== undefined) body.password = payload.password

      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/settings/${serverId}/tw-database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const result = await response.json()
      if (result.success) {
        if (payload.value !== undefined) settings.value.twDatabase = payload.value
        if (payload.login !== undefined) settings.value.twDatabaseCredentials.login = payload.login
        if (payload.password !== undefined) settings.value.twDatabaseCredentials.password = payload.password

        toast.add({
          title: 'Ustawienie zaktualizowane',
          description: result.message,
          icon: 'i-lucide-check-circle',
          color: 'green'
        })
      } else {
        throw new Error(result.message || 'Nie udało się zaktualizować ustawienia')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage
      toast.add({
        title: 'Błąd aktualizacji',
        description: `Nie udało się zaktualizować ustawienia TW Database: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSetting = async (serverId: number, settingType: OrchestratorToggleKey, value: boolean): Promise<void> => {
    if (settingType === 'twDatabase') {
      await updateTwDatabaseSetting(serverId, { value })
      await getStatus()
      return
    }

    loading.value = true
    error.value = null

    try {
      const endpointMap: Record<string, string> = {
        constructionQueue: 'construction-queue',
        miniAttacks: 'mini-attacks',
        scavenging: 'scavenging',
        armyTraining: 'army-training',
        orchestratorEnabled: 'orchestrator-enabled'
      }

      const endpoint = endpointMap[settingType]
      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/settings/${serverId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        settings.value[settingType] = value

        toast.add({
          title: 'Ustawienie zaktualizowane',
          description: result.message,
          icon: 'i-lucide-check-circle',
          color: 'green'
        })
      } else {
        throw new Error(result.message || 'Nie udało się zaktualizować ustawienia')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage

      toast.add({
        title: 'Błąd aktualizacji',
        description: `Nie udało się zaktualizować ustawienia: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  const loadOrchestratorEnabled = async (serverId: number): Promise<void> => {
    loading.value = true
    error.value = null
    currentServerId.value = serverId

    try {
      const response = await fetch(`${BACKEND_URL}/api/settings/${serverId}/CRAWLER_ORCHESTRATOR_ENABLED`)

      if (!response.ok) {
        if (response.status === 404) {
          settings.value.orchestratorEnabled = false
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      settings.value.orchestratorEnabled = Boolean(data?.value)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage

      toast.add({
        title: 'Błąd ładowania',
        description: `Nie udało się pobrać ustawienia orchestratora: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    } finally {
      loading.value = false
    }
  }

  const updateOrchestratorEnabled = async (serverId: number, value: boolean): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/settings/${serverId}/CRAWLER_ORCHESTRATOR_ENABLED`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      settings.value.orchestratorEnabled = value

      toast.add({
        title: 'Orchestrator zaktualizowany',
        description: value ? 'Orchestrator został włączony.' : 'Orchestrator został wyłączony.',
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage

      toast.add({
        title: 'Błąd aktualizacji',
        description: `Nie udało się zaktualizować orchestratora: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  const loadGlobalMonitoring = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/settings/global/orchestrator-monitoring`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      globalMonitoringEnabled.value = Boolean(data?.enabled ?? true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage
      toast.add({
        title: 'Błąd ładowania',
        description: `Nie udało się pobrać globalnego ustawienia: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    } finally {
      loading.value = false
    }
  }

  const updateGlobalMonitoring = async (enabled: boolean): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/settings/global/orchestrator-monitoring`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      globalMonitoringEnabled.value = enabled

      toast.add({
        title: 'Monitoring zaktualizowany',
        description: enabled ? 'Globalny monitoring włączony.' : 'Globalny monitoring wyłączony.',
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage
      toast.add({
        title: 'Błąd aktualizacji',
        description: `Nie udało się zaktualizować monitoringu: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadTwDatabaseSetting = async (serverId: number): Promise<{ enabled: boolean; login: string; password: string }> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/settings/${serverId}/tw-database`)
      if (!response.ok) return { enabled: false, login: '', password: '' }
      const data = await response.json()
      return {
        enabled: Boolean(data.enabled),
        login: data.login ?? '',
        password: data.password ?? ''
      }
    } catch {
      return { enabled: false, login: '', password: '' }
    }
  }

  const loadSettings = async (serverId: number): Promise<void> => {
    loading.value = true
    error.value = null
    currentServerId.value = serverId

    try {
      const [
        constructionQueue,
        miniAttacks,
        scavenging,
        armyTraining,
        orchestratorEnabled,
        twDatabaseData
      ] = await Promise.all([
        getSetting(serverId, 'AUTO_CONSTRUCTION_QUEUE_ENABLED'),
        getSetting(serverId, 'MINI_ATTACKS_ENABLED'),
        getSetting(serverId, 'AUTO_SCAVENGING_ENABLED'),
        getSetting(serverId, 'AUTO_ARMY_TRAINING_LIGHT_ENABLED'),
        getSetting(serverId, 'CRAWLER_ORCHESTRATOR_ENABLED'),
        loadTwDatabaseSetting(serverId)
      ])

      settings.value = {
        constructionQueue,
        miniAttacks,
        scavenging,
        armyTraining,
        twDatabase: twDatabaseData.enabled,
        twDatabaseCredentials: { login: twDatabaseData.login, password: twDatabaseData.password },
        orchestratorEnabled
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage

      toast.add({
        title: 'Błąd ładowania',
        description: `Nie udało się załadować ustawień: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    } finally {
      loading.value = false
    }
  }

  const getStatus = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/status`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: { success: boolean; data: OrchestratorStatus; message?: string } = await response.json()

      if (result.success && result.data) {
        status.value = result.data
      } else {
        throw new Error(result.message || 'Nie udało się pobrać statusu')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage

      toast.add({
        title: 'Błąd statusu',
        description: `Nie udało się pobrać statusu: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    }
  }

  type TriggerTaskType =
    | 'scavenging'
    | 'constructionQueue'
    | 'miniAttacks'
    | 'armyTraining'
    | 'twDatabase'

  const triggerTaskMap: Record<TriggerTaskType, string> = {
    scavenging: 'trigger-scavenging',
    constructionQueue: 'trigger-construction-queue',
    miniAttacks: 'trigger-mini-attacks',
    armyTraining: 'trigger-army-training',
    twDatabase: 'trigger-tw-database'
  }

  const triggerTask = async (serverId: number, taskType: TriggerTaskType): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const endpoint = triggerTaskMap[taskType]
      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/${serverId}/${endpoint}`, {
        method: 'POST'
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`)
      }

      if (result.success) {
        await getStatus()
        toast.add({
          title: 'Zadanie uruchomione',
          description: result.message || 'Zadanie wykonano pomyślnie',
          icon: 'i-lucide-check-circle',
          color: 'green'
        })
      } else {
        throw new Error(result.message || 'Nie udało się uruchomić zadania')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage
      toast.add({
        title: 'Błąd uruchamiania',
        description: errorMessage,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const startMonitoring = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/start-monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh status after starting monitoring
        await getStatus()

        toast.add({
          title: 'Monitoring uruchomiony',
          description: result.message || 'Monitoring został pomyślnie uruchomiony',
          icon: 'i-lucide-check-circle',
          color: 'green'
        })
      } else {
        throw new Error(result.message || 'Nie udało się uruchomić monitoringu')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      error.value = errorMessage

      toast.add({
        title: 'Błąd uruchamiania',
        description: `Nie udało się uruchomić monitoringu: ${errorMessage}`,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  const getDefaultIntervals = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crawler-orchestrator/default-intervals`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: { success: boolean; data: Record<string, number> } = await response.json()

      if (result.success && result.data) {
        defaultIntervals.value = result.data
      } else {
        throw new Error('Nie udało się pobrać domyślnych interwałów')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
      console.error('Error loading default intervals:', errorMessage)
      defaultIntervals.value = null
    }
  }

  return {
    // State
    settings: readonly(settings),
    status: readonly(status),
    error: readonly(error),
    currentServerId: readonly(currentServerId),
    globalMonitoringEnabled: readonly(globalMonitoringEnabled),
    defaultIntervals: readonly(defaultIntervals),

    // Computed
    isLoading,
    hasError,

    // Methods
    loadSettings,
    updateSetting,
    updateTwDatabaseSetting,
    loadOrchestratorEnabled,
    updateOrchestratorEnabled,
    loadGlobalMonitoring,
    updateGlobalMonitoring,
    getStatus,
    startMonitoring,
    getDefaultIntervals,
    clearError,
    triggerTask
  }
}
