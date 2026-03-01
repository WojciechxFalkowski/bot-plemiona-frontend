<template>
  <div class="flex items-center gap-4 px-4 py-2 text-xs bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 min-h-9">
    <!-- Crawler status -->
    <UPopover
      :content="{ side: 'right', align: 'start' }"
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
      class="flex items-center gap-1.5 shrink-0"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCrawlerStatus } from '@/composables/useCrawlerStatus'

const { status, formatDuration } = useCrawlerStatus()
</script>
