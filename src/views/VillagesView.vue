<template>
  <div class="villages-content">
    <!-- Server not selected message -->
    <div v-if="!route.query.serverId" class="no-server-selected">
      <UCard>
        <div class="text-center py-12">
          <UIcon name="i-lucide-server" class="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            Wybierz serwer
          </h3>
          <p class="text-gray-600 mb-6">
            Aby zobaczyć listę wiosek, wybierz serwer z menu po lewej stronie.
          </p>
          <UButton icon="i-lucide-arrow-left" label="Otwórz menu" color="primary" @click="toggleDrawer" />
        </div>
      </UCard>
    </div>

    <!-- Server selected content -->
    <div v-else class="server-content">
      <div class="villages-header mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Wioski</h1>
        <p class="text-gray-600">Zarządzaj wioskami dla serwera {{ selectedServer?.serverName }}</p>
      </div>

      <VillagesList :server-id="serverId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Server } from '@/types/servers'
import { useServer } from '@/composables/useServer'
import VillagesList from '@/components/VillagesList.vue'

const route = useRoute()
const { selectedServer } = useServer()

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : undefined
})

const toggleDrawer = () => {
  const hamburgerBtn = document.querySelector('.hamburger-btn') as HTMLElement
  hamburgerBtn?.click()
}
</script>

<style scoped>
.villages-content {
  padding: 1.5rem;
}

.no-server-selected {
  margin-top: 2rem;
}

.villages-header {
  margin-bottom: 2rem;
}

.server-content {
  /* Server content styles */
}
</style>
