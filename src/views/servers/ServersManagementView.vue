<template>
  <div class="servers-management-view">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Zarządzanie serwerami
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Twórz, edytuj i zarządzaj serwerami Plemiona
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <UButton
          icon="i-lucide-refresh-cw"
          label="Odśwież"
          :loading="loading"
          color="gray"
          variant="ghost"
          class="cursor-pointer"
          @click="handleRefresh"
        />
        <UButton
          icon="i-lucide-cookie"
          label="Ustawienia cookies"
          color="gray"
          variant="outline"
          class="cursor-pointer"
          @click="router.push('/settings/plemiona-cookies')"
        />
        <UButton
          color="primary"
          variant="outline"
          icon="i-lucide-plus-circle"
          label="Dodaj serwer"
          class="cursor-pointer"
          @click="handleAddServer"
        />
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-gray-700">Filtruj:</span>
        <div class="flex gap-2">
          <UTooltip v-if="!isAllFilter" :text="`Pokaż wszystkie serwery (${totalCount})`">
            <UButton
              :variant="isAllFilter ? 'solid' : 'outline'"
              :color="isAllFilter ? 'primary' : 'gray'"
              size="xs"
              class="cursor-pointer border"
              @click="statusFilter = 'all'"
            >
              <span class="truncate">Wszystkie</span>
              <UBadge
                :color="isAllFilter ? 'white' : 'gray'"
                variant="solid"
                size="sm"
                class="ml-1.5 font-semibold text-xs"
              >
                {{ totalCount }}
              </UBadge>
            </UButton>
          </UTooltip>
          <UButton
            v-else
            :variant="isAllFilter ? 'solid' : 'outline'"
            :color="isAllFilter ? 'primary' : 'gray'"
            size="xs"
            class="cursor-pointer border"
            @click="statusFilter = 'all'"
          >
            <span class="truncate">Wszystkie</span>
            <UBadge
              :color="isAllFilter ? 'white' : 'gray'"
              variant="solid"
              size="sm"
              class="ml-1.5 font-semibold text-xs"
            >
              {{ totalCount }}
            </UBadge>
          </UButton>

          <UTooltip v-if="!isActiveFilter" :text="`Pokaż tylko aktywne serwery (${activeCount})`">
            <UButton
              :variant="isActiveFilter ? 'solid' : 'outline'"
              :color="isActiveFilter ? 'primary' : 'gray'"
              size="xs"
              class="cursor-pointer border"
              @click="statusFilter = 'active'"
            >
              <span class="truncate">Aktywne</span>
              <UBadge
                :color="isActiveFilter ? 'white' : 'gray'"
                variant="solid"
                size="sm"
                class="ml-1.5 font-semibold text-xs"
              >
                {{ activeCount }}
              </UBadge>
            </UButton>
          </UTooltip>
          <UButton
            v-else
            :variant="isActiveFilter ? 'solid' : 'outline'"
            :color="isActiveFilter ? 'primary' : 'gray'"
            size="xs"
            class="cursor-pointer border"
            @click="statusFilter = 'active'"
          >
            <span class="truncate">Aktywne</span>
            <UBadge
              :color="isActiveFilter ? 'white' : 'gray'"
              variant="solid"
              size="sm"
              class="ml-1.5 font-semibold text-xs"
            >
              {{ activeCount }}
            </UBadge>
          </UButton>

          <UTooltip v-if="!isInactiveFilter" :text="`Pokaż tylko nieaktywne serwery (${inactiveCount})`">
            <UButton
              :variant="isInactiveFilter ? 'solid' : 'outline'"
              :color="isInactiveFilter ? 'primary' : 'gray'"
              size="xs"
              class="cursor-pointer border"
              @click="statusFilter = 'inactive'"
            >
              <span class="truncate">Nieaktywne</span>
              <UBadge
                :color="isInactiveFilter ? 'white' : 'gray'"
                variant="solid"
                size="sm"
                class="ml-1.5 font-semibold text-xs"
              >
                {{ inactiveCount }}
              </UBadge>
            </UButton>
          </UTooltip>
          <UButton
            v-else
            :variant="isInactiveFilter ? 'solid' : 'outline'"
            :color="isInactiveFilter ? 'primary' : 'gray'"
            size="xs"
            class="cursor-pointer border"
            @click="statusFilter = 'inactive'"
          >
            <span class="truncate">Nieaktywne</span>
            <UBadge
              :color="isInactiveFilter ? 'white' : 'gray'"
              variant="solid"
              size="sm"
              class="ml-1.5 font-semibold text-xs"
            >
              {{ inactiveCount }}
            </UBadge>
          </UButton>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <UAlert
      v-if="error"
      icon="i-lucide-alert-circle"
      color="red"
      variant="soft"
      :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
      @close="clearError"
      class="mb-6"
    />

    <!-- Loading State -->
    <div v-if="loading && filteredServers.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie serwerów...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredServers.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-server-off" class="w-12 h-12 text-gray-400 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">Brak serwerów</h3>
      <p class="mt-2 text-sm text-gray-600">
        {{ statusFilter === 'all' ? 'Dodaj pierwszy serwer używając przycisku powyżej' : 'Brak serwerów spełniających kryteria filtrowania' }}
      </p>
    </div>

    <!-- Servers Table -->
    <div v-else>
      <ServerList
        :servers="[...filteredServers]"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <!-- Server Form Modal -->
    <UModal
      v-model:open="isFormModalOpen"
      :title="isEditing ? 'Edytuj serwer' : 'Dodaj serwer'"
      :description="isEditing ? 'Zaktualizuj informacje o serwerze' : 'Utwórz nowy serwer Plemiona'"
      :ui="{ width: 'sm:max-w-lg', content: 'divide-y-0' }"
    >
      <template #body>
        <ServerForm
          ref="serverFormRef"
          :is-open="isFormModalOpen"
          :server="selectedServer"
          :is-editing="isEditing"
          @close="handleCloseFormModal"
          @save="handleSaveServer"
        />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            class="cursor-pointer"
            @click="handleCloseFormModal"
          >
            Anuluj
          </UButton>
          <UButton
            color="primary"
            :loading="loading"
            class="cursor-pointer"
            @click="handleSaveServerFromFooter"
          >
            {{ isEditing ? 'Zapisz' : 'Dodaj' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Dialog -->
    <ServerDeleteDialog
      v-model:is-open="isDeleteDialogOpen"
      :server="serverToDelete"
      :is-deleting="loading"
      @close="handleCloseDeleteDialog"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServer } from '@/composables/useServer'
import type { Server, CreateServerDto, UpdateServerDto } from '@/types/servers'
import ServerList from '@/components/servers/ServerList.vue'
import ServerForm from '@/components/servers/ServerForm.vue'
import ServerDeleteDialog from '@/components/servers/ServerDeleteDialog.vue'

declare const useToast: () => any

const toast = useToast()
const router = useRouter()

const {
  servers,
  loading,
  error,
  fetchServersWithInactive,
  createServer,
  updateServer,
  deleteServer,
  clearError
} = useServer()

type StatusFilter = 'all' | 'active' | 'inactive'
const statusFilter = ref<StatusFilter>('all')

const filteredServers = computed(() => {
  if (statusFilter.value === 'all') {
    return servers.value
  } else if (statusFilter.value === 'active') {
    return servers.value.filter(server => server.isActive)
  } else {
    return servers.value.filter(server => !server.isActive)
  }
})

const totalCount = computed(() => servers.value.length)
const activeCount = computed(() => servers.value.filter(server => server.isActive).length)
const inactiveCount = computed(() => servers.value.filter(server => !server.isActive).length)

const isAllFilter = computed(() => statusFilter.value === 'all')
const isActiveFilter = computed(() => statusFilter.value === 'active')
const isInactiveFilter = computed(() => statusFilter.value === 'inactive')

const isFormModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isEditing = ref(false)
const selectedServer = ref<Server | null>(null)
const serverToDelete = ref<Server | null>(null)
const serverFormRef = ref<InstanceType<typeof ServerForm> | null>(null)

const handleRefresh = async () => {
  try {
    await fetchServersWithInactive()
    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Lista serwerów została zaktualizowana',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch (err) {
    toast.add({
      title: 'Błąd odświeżania',
      description: 'Nie udało się zaktualizować listy serwerów',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const handleAddServer = () => {
  selectedServer.value = null
  isEditing.value = false
  isFormModalOpen.value = true
}

const handleEdit = (server: Server) => {
  selectedServer.value = server
  isEditing.value = true
  isFormModalOpen.value = true
}

const handleDelete = (server: Server) => {
  serverToDelete.value = server
  isDeleteDialogOpen.value = true
}

const handleToggleStatus = async (server: Server) => {
  try {
    const updateData: UpdateServerDto = {
      isActive: !server.isActive
    }
    await updateServer(server.id, updateData)
    await fetchServersWithInactive()
    toast.add({
      title: 'Status zaktualizowany',
      description: `Serwer ${server.serverName} został ${server.isActive ? 'deaktywowany' : 'aktywowany'}`,
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd aktualizacji',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const handleCloseFormModal = () => {
  isFormModalOpen.value = false
  selectedServer.value = null
  isEditing.value = false
}

const handleSaveServerFromFooter = async () => {
  if (serverFormRef.value && typeof serverFormRef.value.submit === 'function') {
    await serverFormRef.value.submit()
  }
}

const handleSaveServer = async (data: CreateServerDto | UpdateServerDto) => {
  try {
    if (isEditing.value && selectedServer.value) {
      await updateServer(selectedServer.value.id, data as UpdateServerDto)
      toast.add({
        title: 'Serwer zaktualizowany',
        description: `Serwer ${selectedServer.value.serverName} został zaktualizowany pomyślnie`,
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    } else {
      const newServer = await createServer(data as CreateServerDto)
      toast.add({
        title: 'Serwer utworzony',
        description: `Serwer ${newServer.serverName} został utworzony pomyślnie`,
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    }
    handleCloseFormModal()
    await fetchServersWithInactive()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: isEditing.value ? 'Błąd aktualizacji' : 'Błąd tworzenia',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const handleCloseDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  serverToDelete.value = null
}

const handleConfirmDelete = async () => {
  if (!serverToDelete.value) return

  try {
    await deleteServer(serverToDelete.value.id)
    toast.add({
      title: 'Serwer usunięty',
      description: `Serwer ${serverToDelete.value.serverName} został usunięty pomyślnie`,
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
    handleCloseDeleteDialog()
    await fetchServersWithInactive()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd usuwania',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

onMounted(async () => {
  await fetchServersWithInactive()
})
</script>

<style scoped>
.servers-management-view {
  width: 100%;
}
</style>

