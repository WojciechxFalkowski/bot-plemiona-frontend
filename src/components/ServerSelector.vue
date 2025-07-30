<template>
  <div>
    <USelect v-model="selectedServerId" :items="serverItems" :loading="loading" :placeholder="placeholder"
      :disabled="disabled" value-key="value" class="w-full"
      :content="{ side: 'bottom', align: 'start', class: 'z-[9999]' }" :ui="{ content: 'z-[9999]' }"
      @update:model-value="handleServerChange">
      <template #leading>
        <UIcon name="i-lucide-server" class="text-gray-500" />
      </template>
    </USelect>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Server } from '@/types/servers'

interface Props {
  modelValue?: number | null
  placeholder?: string
  disabled?: boolean
  showInactive?: boolean
  servers: readonly Server[]
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'serverChange', server: Server | null): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Wybierz serwer',
  disabled: false,
  showInactive: false,
  loading: false
})

const emit = defineEmits<Emits>()

// Servers data comes from parent component

const selectedServerId = computed({
  get: () => props.modelValue,
  set: (value: number | null) => {
    emit('update:modelValue', value)
  }
})

const serverItems = computed(() => {
  const serversToShow = props.showInactive ? props.servers : props.servers.filter(server => server.isActive)

  return serversToShow.map(server => ({
    label: `${server.serverName} (${server.serverCode})`,
    value: server.id,
    disabled: !server.isActive
  }))
})

const handleServerChange = (serverId: number | null) => {
  const selectedServer = serverId ? props.servers.find(server => server.id === serverId) || null : null
  emit('serverChange', selectedServer)
}

// Data fetching is handled by parent component (DrawerMenu)
</script>

<style></style>
