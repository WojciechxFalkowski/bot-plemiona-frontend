<template>
  <div class="space-y-6">
    <div>
      <UCard>
        <div class="space-y-6">
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-900">
                Globalny monitoring orchestratora
              </p>
              <p class="text-xs text-gray-600">
                Włącza/wyłącza cykliczne sprawdzanie dla wszystkich serwerów.
              </p>
            </div>
            <USwitch
              :model-value="localGlobalMonitoring"
              :loading="isLoading"
              label="Globalny monitoring"
              checked-icon="i-lucide-check"
              unchecked-icon="i-lucide-x"
              @update:model-value="handleGlobalToggle"
            />
          </div>
          <div class="rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
            <p>
              Ustawienie jest globalne – nie wymaga wybranego serwera. Gdy wyłączone, timery monitoringu i scheduler zostaną zatrzymane.
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-900">
                Aktualny plan wykonania
              </p>
              <p class="text-xs text-gray-600">
                Podsumowanie schedulera i liczby aktywnych serwerów.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge
                :color="status?.schedulerActive ? 'green' : 'red'"
                :label="status?.schedulerActive ? 'Scheduler aktywny' : 'Scheduler wyłączony'"
              />
              <UButton
                icon="i-lucide-refresh-cw"
                size="xs"
                color="gray"
                variant="ghost"
                :loading="isLoading"
                class="cursor-pointer"
                @click="handleRefreshPlan"
              >
                Odśwież plan
              </UButton>
            </div>
          </div>

          <div
            v-if="taskScheduleDisplay"
            class="rounded-lg border border-gray-200 p-4 text-xs text-gray-700 space-y-3"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p>
                <span class="font-medium">Aktywne serwery:</span>
                {{ taskScheduleDisplay.activeServersCount }}
              </p>
              <div class="flex flex-wrap gap-1">
                <UBadge
                  :color="taskScheduleDisplay.schedulerActive ? 'green' : 'red'"
                  size="xs"
                >
                  {{ taskScheduleDisplay.schedulerActive ? 'Scheduler aktywny' : 'Scheduler wyłączony' }}
                </UBadge>
                <UBadge
                  :color="taskScheduleDisplay.monitoringActive ? 'green' : 'red'"
                  size="xs"
                >
                  {{ taskScheduleDisplay.monitoringActive ? 'Monitoring aktywny' : 'Monitoring wyłączony' }}
                </UBadge>
                <UBadge
                  :color="taskScheduleDisplay.isRotating ? 'primary' : 'gray'"
                  size="xs"
                >
                  {{ taskScheduleDisplay.isRotating ? 'Rotacja w toku' : 'Rotacja zatrzymana' }}
                </UBadge>
              </div>
            </div>

            <div v-if="taskScheduleDisplay.tasks.length">
              <p class="font-medium mb-2">
                Zadania w kolejce (tylko włączone), posortowane według czasu wykonania:
              </p>
              <ul class="space-y-1 max-h-64 overflow-y-auto">
                <li
                  v-for="(task, index) in taskScheduleDisplay.tasks"
                  :key="`${task.taskType}-${task.serverCode}-${task.nextExecutionTime}`"
                  class="rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm"
                >
                  <p class="text-[11px] font-semibold text-gray-900">
                    {{ index + 1 }}. {{ task.taskLabel }} - {{ task.serverCode }} ({{ task.serverName }})
                  </p>
                  <p class="text-[10px] text-gray-600">
                    ⏰ Następne wykonanie:
                    <span class="font-medium">
                      {{ task.nextExecutionTime }}
                    </span>
                    <span v-if="task.timeUntil">
                      (za {{ task.timeUntil }})
                    </span>
                  </p>
                  <p class="text-[10px] text-gray-600">
                    📅
                    <span v-if="task.lastExecuted">
                      Ostatnie: {{ task.lastExecuted }}
                    </span>
                    <span v-else>
                      Nigdy nie wykonane
                    </span>
                  </p>
                </li>
              </ul>
            </div>
            <p
              v-else
              class="text-xs text-gray-500"
            >
              Brak włączonych zadań w schedulera dla aktywnych serwerów.
            </p>

            <div class="border-t border-gray-100 pt-3 mt-3 space-y-2">
              <p class="font-medium">
                Wyłączone zadania per serwer:
              </p>
              <div v-if="disabledTasksPerServerDisplay.length">
                <ul class="space-y-1">
                  <li
                    v-for="server in disabledTasksPerServerDisplay"
                    :key="server.id"
                    class="flex flex-col gap-0.5"
                  >
                    <p class="text-[11px] font-semibold text-gray-900">
                      {{ server.code }} ({{ server.name }})
                    </p>
                    <p
                      v-if="server.disabledTaskLabels.length"
                      class="text-[10px] text-gray-600"
                    >
                      {{ server.disabledTaskLabels.join(', ') }}
                    </p>
                    <p
                      v-else
                      class="text-[10px] text-gray-500 italic"
                    >
                      Brak wyłączonych zadań.
                    </p>
                  </li>
                </ul>
              </div>
              <p
                v-else
                class="text-[10px] text-gray-500"
              >
                Wszystkie zadania są aktualnie włączone.
              </p>
            </div>
          </div>

          <div
            v-if="defaultIntervals"
            class="rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs"
          >
            <p class="font-medium text-blue-900 mb-3">
              ℹ️ Domyślne interwały startowe (używane przy pierwszym uruchomieniu):
            </p>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-blue-200">
                    <th class="text-left py-2 px-3 font-semibold text-blue-900">Zadanie</th>
                    <th class="text-left py-2 px-3 font-semibold text-blue-900">Interwał</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(interval, key) in defaultIntervals"
                    :key="key"
                    class="border-b border-blue-100 last:border-b-0"
                  >
                    <td class="py-2 px-3 text-blue-800 font-medium">
                      {{ getTaskLabel(key) }}
                    </td>
                    <td class="py-2 px-3 text-blue-800">
                      {{ formatInterval(interval) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p
            v-else-if="!taskScheduleDisplay"
            class="text-xs text-gray-500"
          >
            {{ isLoading ? 'Ładowanie statusu orchestratora...' : 'Brak danych o statusie orchestratora.' }}
          </p>

          <p v-if="errorMessage" class="text-xs text-red-600">
            {{ errorMessage }}
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useOrchestrator } from '@/composables/useOrchestrator'

interface OrchestratorTaskScheduleItem {
  serverCode: string
  serverName: string
  taskType: string
  taskLabel: string
  nextExecutionTime: string
  timeUntil: string | null
  lastExecuted: string | null
}

interface OrchestratorTaskScheduleDisplay {
  activeServersCount: number
  schedulerActive: boolean
  monitoringActive: boolean
  isRotating: boolean
  tasks: OrchestratorTaskScheduleItem[]
}

interface DisabledTasksServerDisplay {
  id: number
  code: string
  name: string
  disabledTaskLabels: string[]
}

const {
  status,
  isLoading,
  error,
  loadGlobalMonitoring,
  updateGlobalMonitoring,
  globalMonitoringEnabled,
  getStatus,
  defaultIntervals,
  getDefaultIntervals
} = useOrchestrator()

const localGlobalMonitoring = ref(true)
const errorMessage = computed(() => error.value || '')

const formatTimeUntil = (target: Date, now: Date): string | null => {
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) {
    return null
  }
  const totalSeconds = Math.floor(diffMs / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

const formatDateTime = (value: string | null): string | null => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const taskScheduleDisplay = computed<OrchestratorTaskScheduleDisplay | null>(() => {
  if (!status.value) {
    return null
  }

  const now = new Date()
  const tasks: OrchestratorTaskScheduleItem[] = []

  for (const server of status.value.servers || []) {
    const serverCode = server.serverCode
    const serverName = server.serverName

    const pushTask = (taskType: string, taskLabel: string, taskData: { enabled: boolean; nextExecution: string | null; lastExecuted: string | null } | undefined) => {
      if (!taskData?.enabled || !taskData.nextExecution) {
        return
      }
      const nextDate = new Date(taskData.nextExecution)
      if (Number.isNaN(nextDate.getTime())) {
        return
      }
      tasks.push({
        serverCode,
        serverName,
        taskType,
        taskLabel,
        nextExecutionTime: nextDate.toLocaleString('pl-PL'),
        timeUntil: formatTimeUntil(nextDate, now),
        lastExecuted: formatDateTime(taskData.lastExecuted ?? null)
      })
    }

    pushTask('Construction Queue', 'Kolejka budowy', server.tasks.constructionQueue)
    pushTask('Scavenging', 'Zbieractwo', server.tasks.scavenging)
    pushTask('Mini Attacks', 'Mini ataki', server.tasks.miniAttacks)
    pushTask('Player Village Attacks', 'Ataki na graczy', server.tasks.playerVillageAttacks)
    pushTask('Army Training', 'Szkolenie armii', server.tasks.armyTraining)
  }

  tasks.sort((a, b) => {
    const aDate = new Date(a.nextExecutionTime)
    const bDate = new Date(b.nextExecutionTime)
    return aDate.getTime() - bDate.getTime()
  })

  return {
    activeServersCount: status.value.activeServersCount,
    schedulerActive: status.value.schedulerActive,
    monitoringActive: status.value.monitoringActive,
    isRotating: status.value.isRotating,
    tasks
  }
})

const disabledTasksPerServerDisplay = computed<DisabledTasksServerDisplay[]>(() => {
  if (!status.value) {
    return []
  }

  return (status.value.servers || []).map<DisabledTasksServerDisplay>((server) => {
    const disabledTaskLabels: string[] = []

    if (!server.tasks.constructionQueue.enabled) {
      disabledTaskLabels.push('Kolejka budowy')
    }
    if (!server.tasks.scavenging.enabled) {
      disabledTaskLabels.push('Zbieractwo')
    }
    if (!server.tasks.miniAttacks.enabled) {
      disabledTaskLabels.push('Mini ataki')
    }
    if (!server.tasks.playerVillageAttacks.enabled) {
      disabledTaskLabels.push('Ataki na graczy')
    }
    if (!server.tasks.armyTraining.enabled) {
      disabledTaskLabels.push('Szkolenie armii')
    }

    return {
      id: server.serverId,
      code: server.serverCode,
      name: server.serverName,
      disabledTaskLabels
    }
  })
})

const handleGlobalToggle = async (value: boolean) => {
  localGlobalMonitoring.value = value
  try {
    await updateGlobalMonitoring(value)
    await loadGlobalMonitoring()
    localGlobalMonitoring.value = globalMonitoringEnabled.value
  } catch {
    localGlobalMonitoring.value = globalMonitoringEnabled.value
  }
}

const formatInterval = (ms: number): string => {
  const seconds = ms / 1000
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainingSeconds}s`
}

const getTaskLabel = (key: string): string => {
  const labels: Record<string, string> = {
    constructionQueue: 'Kolejka budowy',
    scavenging: 'Zbieractwo',
    miniAttacks: 'Mini ataki',
    playerVillageAttacks: 'Ataki na graczy',
    armyTraining: 'Szkolenie armii'
  }
  return labels[key] || key
}

onMounted(() => {
  localGlobalMonitoring.value = globalMonitoringEnabled.value
  loadGlobalMonitoring().then(() => {
    localGlobalMonitoring.value = globalMonitoringEnabled.value
  })
  getStatus()
  getDefaultIntervals()
})

const handleOpenMenu = (): void => {
  const hamburgerBtn = document.querySelector('.hamburger-btn') as HTMLElement | null
  hamburgerBtn?.click()
}

const handleRefreshPlan = async (): Promise<void> => {
  await getStatus()
}
</script>

