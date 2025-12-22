<template>
  <div>
    <!-- Mobile Header with Hamburger Button -->
    <div v-if="showMobileHeader"
      class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center fixed top-0 left-0 right-0">
      <UserButton :appearance="userButtonAppearance" />

      <UButton icon="i-lucide-menu" variant="ghost" color="gray" size="md" @click="isOpen = true"
        class="hamburger-btn cursor-pointer p-2" />
    </div>

    <!-- Mobile Overlay -->
    <div v-show="isOpen"
      class="lg:hidden fixed inset-0 z-51 transition-opacity duration-300 cursor-pointer bg-opacity-75 bg-[rgba(0,0,0,0.6)]"
      @click="isOpen = false"></div>

    <!-- Unified Sidebar -->
    <div
      class="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 z-52"
      :class="{
        'translate-x-0': isOpen,
        '-translate-x-full': !isOpen
      }">
      <nav class="p-4">
        <!-- Server Selector -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Serwer</h3>
          <ServerSelector
            v-model="selectedServerId"
            placeholder="Wybierz serwer"
            :servers="servers"
            :loading="loading"
            @server-change="handleServerChange"
          />
          <UButton
            icon="i-lucide-settings"
            label="Zarządzaj serwerami"
            variant="outline"
            color="gray"
            size="sm"
            class="w-full mt-2 cursor-pointer"
            @click="router.push('/servers/management')"
          />
          <UButton
            icon="i-lucide-cookie"
            label="Ustawienia cookies"
            variant="outline"
            color="gray"
            size="sm"
            class="w-full mt-2 cursor-pointer"
            @click="router.push('/settings/plemiona-cookies')"
          />
        </div>

        <DrawerMenuItems :items="config.items" @navigate="handleNavigate" />

        <!-- Message when no server is selected -->
        <div v-if="!route.query.serverId" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="text-center">
            <UIcon name="i-lucide-server" class="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p class="text-sm text-gray-600">
              Wybierz serwer, aby zobaczyć opcje menu
            </p>
          </div>
        </div>
      </nav>
    </div>

    <!-- Content Spacer for Desktop -->
    <div class="hidden lg:block w-80"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { DrawerMenuConfig } from '@/types/navigation'
import type { Server } from '@/types/servers'
import { useServer } from '@/composables/useServer'
import DrawerMenuItems from './DrawerMenuItems.vue'
import ServerSelector from './ServerSelector.vue'
import { UserButton } from '@clerk/vue'

export interface Props {
  config: DrawerMenuConfig
  showMobileHeader?: boolean
}

const userButtonAppearance = {
  elements: {
    avatarBox: 'header-user-avatar',
    userButtonPopover: 'header-user-popover',
  },
}

const props = withDefaults(defineProps<Props>(), {
  showMobileHeader: true
})

const router = useRouter()
const route = useRoute()
const isOpen = ref(false)

// Server selection
const { servers, loading, setSelectedServer, fetchServers } = useServer()
const selectedServerId = ref<number | null>(null)

const handleServerChange = (server: Server | null) => {
  selectedServerId.value = server?.id || null
  setSelectedServer(server)

  // Update URL with server ID
  if (server) {
    router.push({
      path: route.path,
      query: { ...route.query, serverId: server.id.toString() }
    })
  } else {
    // Remove serverId from URL if no server selected
    const { serverId, ...otherQuery } = route.query
    router.push({
      path: route.path,
      query: otherQuery
    })
  }
}

const handleNavigate = (path: string) => {
  // Preserve serverId in URL when navigating
  const currentQuery = { ...route.query }
  router.push({
    path,
    query: currentQuery
  })
  // Close mobile drawer on navigation
  isOpen.value = false
}

// Prevent body scroll when drawer is open on mobile
const toggleBodyScroll = (disable: boolean) => {
  if (typeof window !== 'undefined') {
    if (disable) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
}

// Watch for drawer state changes on mobile
watch(isOpen, (newValue) => {
  // Only disable scroll on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    toggleBodyScroll(newValue)
  }
})

// Watch for URL changes and update selected server
watch(() => route.query.serverId, (newServerId) => {
  if (newServerId && servers.value.length > 0) {
    const serverId = parseInt(newServerId as string)
    const server = servers.value.find(s => s.id === serverId)
    if (server && selectedServerId.value !== server.id) {
      selectedServerId.value = server.id
      setSelectedServer(server)
    }
  } else if (!newServerId && selectedServerId.value !== null) {
    selectedServerId.value = null
    setSelectedServer(null)
  }
})

// Handle ESC key to close drawer
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)
  await fetchServers()

  // Check if serverId is in URL and set selected server
  const urlServerId = route.query.serverId
  if (urlServerId && servers.value.length > 0) {
    const serverId = parseInt(urlServerId as string)
    const server = servers.value.find(s => s.id === serverId)
    if (server) {
      selectedServerId.value = server.id
      setSelectedServer(server)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Reset body scroll when component unmounts
  toggleBodyScroll(false)
})
</script>


