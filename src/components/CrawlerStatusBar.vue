<template>
  <div class="flex items-center gap-4 px-4 py-2 text-xs bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 min-h-9">
    <!-- Crawler status -->
    <div class="flex items-center gap-1.5 shrink-0">
      <span
        class="w-2 h-2 rounded-full shrink-0"
        :class="status.activeServer ? 'bg-amber-500' : 'bg-gray-400 dark:bg-gray-500'"
        aria-hidden="true"
      />
      <span class="text-gray-600 dark:text-gray-400 truncate">
        <template v-if="status.activeServer">
          Crawler: {{ status.activeServer.serverCode }} • {{ formatDuration(status.activeServer.durationSeconds) }}
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
