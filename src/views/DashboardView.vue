<template>
  <div class="dashboard-content">
    <div class="dashboard-header">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
    </div>

    <!-- Server not selected message -->
    <div v-if="!route.query.serverId" class="no-server-selected">
      <UCard>
        <div class="text-center py-12">
          <UIcon name="i-lucide-server" class="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            Wybierz serwer
          </h3>
          <p class="text-gray-600 mb-6">
            Aby zobaczyć dashboard i zarządzać wioskami, wybierz serwer z menu po lewej stronie.
          </p>
          <UButton
            icon="i-lucide-arrow-left"
            label="Otwórz menu"
            color="primary"
            @click="toggleDrawer"
          />
        </div>
      </UCard>
    </div>

    <!-- Server selected content -->
    <div v-else-if="selectedServer" class="server-content">
      <div class="server-info mb-6">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ selectedServer.serverName }} ({{ selectedServer.serverCode }})
              </h2>
              <p class="text-sm text-gray-600">
                Status:
                <UBadge
                  :color="selectedServer.isActive ? 'green' : 'red'"
                  variant="soft"
                  size="sm"
                >
                  {{ selectedServer.isActive ? 'Aktywny' : 'Nieaktywny' }}
                </UBadge>
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">
                Utworzono: {{ formatDate(selectedServer.createdAt) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { Server } from '@/types/servers'
import { useServer } from '@/composables/useServer'
import VillagesList from '@/components/VillagesList.vue'

const route = useRoute()
const { selectedServer } = useServer()

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toggleDrawer = () => {
  const hamburgerBtn = document.querySelector('.hamburger-btn') as HTMLElement
  hamburgerBtn?.click()
}
</script>

<style scoped>
.dashboard-content {
  padding: 1.5rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.no-server-selected {
  margin-top: 2rem;
}

.server-content {
  /* Server content styles */
}
</style>
