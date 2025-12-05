<template>
  <div class="server-list">
    <UTable :data="tableRows" :columns="columns" :loading="loading" :ui="{ separator: 'hidden', table: 'z-0' }" class="w-full">
      <template #status-cell="{ row }">
        <UBadge :color="row.original.isActive ? 'green' : 'red'" variant="soft" size="sm">
          {{ row.original.isActive ? 'Aktywny' : 'Nieaktywny' }}
        </UBadge>
      </template>

      <template #createdAt-cell="{ row }">
        {{ formatDate(row.original.createdAt) }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton icon="i-lucide-edit" color="gray" variant="ghost" size="sm" class="cursor-pointer"
            @click="handleEdit(row.original)" :aria-label="`Edytuj serwer ${row.original.serverName}`" />
          <USwitch :model-value="row.original.isActive" class="cursor-pointer"
            @update:model-value="() => handleToggleStatus(row.original)"
            :aria-label="`${row.original.isActive ? 'Deaktywuj' : 'Aktywuj'} serwer ${row.original.serverName}`" />
          <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="sm" class="cursor-pointer"
            @click="handleDelete(row.original)" :aria-label="`Usuń serwer ${row.original.serverName}`" />
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Server } from '@/types/servers'
import type { TableColumn } from '@nuxt/ui'

interface Props {
  servers: Server[]
  loading?: boolean
}

interface Emits {
  (e: 'edit', server: Server): void
  (e: 'delete', server: Server): void
  (e: 'toggle-status', server: Server): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const columns: TableColumn<Server>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'serverCode',
    header: 'Kod serwera'
  },
  {
    accessorKey: 'serverName',
    header: 'Nazwa'
  },
  {
    id: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'createdAt',
    header: 'Data utworzenia'
  },
  {
    id: 'actions',
    header: 'Akcje'
  }
]

const tableRows = computed(() => {
  return props.servers.map(server => ({
    ...server,
    isActive: Boolean(server.isActive)
  }))
})

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleEdit = (server: Server) => {
  emit('edit', server)
}

const handleDelete = (server: Server) => {
  emit('delete', server)
}

const handleToggleStatus = (server: Server) => {
  emit('toggle-status', server)
}
</script>

<style scoped>
.server-list {
  width: 100%;
}
</style>
