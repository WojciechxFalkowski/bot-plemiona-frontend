<template>
  <div class="flex items-center gap-4 px-4 py-2 text-xs bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 min-h-9">
    <!-- Crawler status -->
    <UPopover
      :content="popoverContent"
      :ui="{ content: 'z-[100]' }"
    >
      <div
        class="flex items-center gap-1.5 shrink-0 cursor-pointer select-none"
        tabindex="0"
        role="button"
        aria-label="Status crawlera – kliknij aby zobaczyć harmonogram"
      >
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="status.activeServer ? 'bg-amber-500' : 'bg-gray-400 dark:bg-gray-500'"
          aria-hidden="true"
        />
        <span class="text-gray-700 dark:text-gray-300 truncate font-medium">
          <template v-if="status.activeServer">
            Crawler: {{ status.activeServer.serverCode }} • {{ status.activeServer.taskType }} • {{ formatDuration(status.activeServer.durationSeconds) }}
          </template>
          <template v-else>
            Crawler: bezczynny<template v-if="status.nextScheduledInSeconds != null">
              • za ~{{ formatDuration(status.nextScheduledInSeconds) }}<template v-if="status.nextScheduledTask">
                : {{ status.nextScheduledTask.taskType }} ({{ status.nextScheduledTask.serverCode }})
              </template>
            </template>
          </template>
        </span>
      </div>
      <template #content>
        <div class="p-3 text-sm min-w-[220px] max-h-[60vh] overflow-y-auto">
          <div class="font-semibold mb-2 text-gray-900 dark:text-white">Plan zadań (harmonogram)</div>
          <div v-if="status.upcomingTasks.length > 0" class="space-y-1.5">
            <div
              v-for="(task, idx) in status.upcomingTasks"
              :key="`${task.taskType}-${task.serverCode}-${idx}`"
              class="text-gray-700 dark:text-gray-300 flex justify-between gap-3"
            >
              <span class="truncate">{{ task.taskType }} ({{ task.serverCode }})</span>
              <span class="text-gray-500 dark:text-gray-400 text-xs shrink-0">za ~{{ formatDuration(task.inSeconds) }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 dark:text-gray-400 text-sm">
            Brak zaplanowanych zadań
          </div>
        </div>
      </template>
    </UPopover>

    <!-- Recaptcha blocked -->
    <div
      v-if="status.recaptchaBlocked.length > 0"
      class="flex items-center gap-2 shrink-0"
    >
      <span
        class="w-2 h-2 rounded-full shrink-0 bg-orange-500"
        aria-hidden="true"
      />
      <span class="text-orange-700 dark:text-orange-400 truncate">
        <template v-if="status.recaptchaBlocked.length === 1">
          {{ status.recaptchaBlocked[0].serverCode }} wymaga odblokowania
        </template>
        <template v-else>
          {{ status.recaptchaBlocked.map((s) => s.serverCode).join(', ') }} wymagają odblokowania
        </template>
      </span>
      <UButton
        v-for="blocked in status.recaptchaBlocked"
        :key="blocked.serverId"
        size="xs"
        color="orange"
        variant="soft"
        :loading="triggeringServerId === blocked.serverId"
        :disabled="triggeringServerId !== null"
        :aria-label="`Sprawdź reCAPTCHA teraz dla serwera ${blocked.serverCode}`"
        @click="handleTriggerRecaptchaCheck(blocked.serverId, blocked.serverCode)"
      >
        Sprawdź teraz
      </UButton>
    </div>

    <!-- Token Expired -->
    <div
      v-if="status.tokenExpired.length > 0"
      class="flex items-center gap-2 shrink-0"
    >
      <span
        class="w-2 h-2 rounded-full shrink-0 bg-red-500"
        aria-hidden="true"
      />
      <span class="text-red-700 dark:text-red-400 truncate">
        <template v-if="status.tokenExpired.length === 1">
          Wygasła sesja dla serwera: {{ status.tokenExpired[0].serverCode }}. Wymagane nowe ciastka.
        </template>
        <template v-else>
          Wygasła sesja dla serwerów: {{ status.tokenExpired.map((s) => s.serverCode).join(', ') }}. Wymagane nowe ciastka.
        </template>
      </span>
      <UButton
        v-for="expired in status.tokenExpired"
        :key="expired.serverId"
        size="xs"
        color="red"
        variant="soft"
        :loading="triggeringTokenServerId === expired.serverId"
        :disabled="triggeringTokenServerId !== null"
        :aria-label="`Sprawdź token teraz dla serwera ${expired.serverCode}`"
        @click="handleTriggerTokenCheck(expired.serverId, expired.serverCode)"
      >
        Sprawdź teraz
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCrawlerStatus } from '@/composables/useCrawlerStatus'

declare const useToast: () => { add: (opts: { title: string; description: string; color?: string }) => void }
const { status, formatDuration, triggerRecaptchaCheck, triggerTokenCheck, fetchStatus } = useCrawlerStatus()
const toast = useToast()
const triggeringServerId = ref<number | null>(null)
const triggeringTokenServerId = ref<number | null>(null)

const handleTriggerRecaptchaCheck = async (serverId: number, serverCode: string): Promise<void> => {
  triggeringServerId.value = serverId
  try {
    const result = await triggerRecaptchaCheck(serverId)
    if (result.success) {
      toast.add({
        title: 'Sukces',
        description: `Sprawdzenie reCAPTCHA zaplanowane dla ${serverCode}`,
        color: 'success'
      })
      await fetchStatus()
    } else {
      toast.add({
        title: 'Błąd',
        description: result.error ?? 'Nie udało się wyzwolić sprawdzenia',
        color: 'error'
      })
    }
  } finally {
    triggeringServerId.value = null
  }
}

const handleTriggerTokenCheck = async (serverId: number, serverCode: string): Promise<void> => {
  triggeringTokenServerId.value = serverId
  try {
    const result = await triggerTokenCheck(serverId)
    if (result.success) {
      toast.add({
        title: 'Sukces',
        description: `Sprawdzenie sesji zaplanowane dla ${serverCode}`,
        color: 'success'
      })
      await fetchStatus()
    } else {
      toast.add({
        title: 'Błąd',
        description: result.error ?? 'Nie udało się wyzwolić sprawdzenia',
        color: 'red'
      })
    }
  } finally {
    triggeringTokenServerId.value = null
  }
}

/** On mobile: bottom to stay on screen; on desktop: right to avoid sidebar */
const isMobile = ref(false)
const mq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)') : null

const popoverContent = computed(() => ({
  side: isMobile.value ? 'bottom' as const : 'right' as const,
  align: 'start' as const
}))

const handleMediaChange = (): void => {
  isMobile.value = mq?.matches ?? false
}

onMounted(() => {
  handleMediaChange()
  mq?.addEventListener('change', handleMediaChange)
})

onUnmounted(() => {
  mq?.removeEventListener('change', handleMediaChange)
})
</script>
