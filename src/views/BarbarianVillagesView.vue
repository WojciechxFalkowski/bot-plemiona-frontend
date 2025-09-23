<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Wioski barbarzynskie
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Zarządzaj wioskami barbarzynskimi do ataków
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <UButton icon="i-lucide-refresh-cw" label="Refresh" :loading="loading" color="gray" variant="ghost"
          @click="refreshData" class="cursor-pointer" />
        <UButton color="purple" variant="outline" icon="i-heroicons-shield-check" class="cursor-pointer" @click="handleGoToStrategies">
          Strategie Ataku
        </UButton>
      </div>
    </div>

    <!-- Error Display -->
    <UAlert v-if="error" icon="i-lucide-alert-circle" color="red" variant="soft" :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }" @close="clearError" />

    <!-- Loading State -->
    <div v-if="loading && villages.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600">Ładowanie wiosek barbarzynskich...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && villages.length === 0" class="text-center py-12">
      <AddBarbarianVillageCard :loading="loading" @submit-manual="handleCreateManual"
        @submit-url="handleCreateFromUrl" />

      <!-- <UIcon name="i-lucide-map-pin-off" class="w-12 h-12 text-gray-400 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">Brak wiosek barbarzynskich</h3>
      <p class="mt-2 text-sm text-gray-600">
        Dodaj pierwszą wioskę barbarzynską używając przycisków powyżej
      </p> -->
    </div>




    <div v-else>
      <!-- Stats -->
      <div v-if="villages.length > 0" class="border border-gray-200 rounded-lg my-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-200"
            :class="selectedFilter === 'all' ? 'bg-gray-50 rounded-md' : ''"
            @click="handleSelectFilter('all')"
            aria-label="Pokaż wszystkie wioski"
          >
            <div class="text-2xl font-bold text-gray-900">{{ totalCount }}</div>
            <div class="text-sm text-gray-600">Łącznie wiosek</div>
          </button>
          <button
            type="button"
            class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-200"
            :class="selectedFilter === 'attackable' ? 'bg-gray-50 rounded-md' : ''"
            @click="handleSelectFilter('attackable')"
            aria-label="Pokaż wioski do ataku"
          >
            <div class="text-2xl font-bold text-green-600">{{ attackableCount }}</div>
            <div class="text-sm text-gray-600">Do ataku</div>
          </button>
          <button
            type="button"
            class="text-center focus:outline-none cursor-pointer py-2 hover:bg-gray-200"
            :class="selectedFilter === 'nonAttackable' ? 'bg-gray-50 rounded-md' : ''"
            @click="handleSelectFilter('nonAttackable')"
            aria-label="Pokaż wioski niedostępne do ataku"
          >
            <div class="text-2xl font-bold text-red-600">{{ nonAttackableCount }}</div>
            <div class="text-sm text-gray-600">Niedostępne</div>
          </button>
        </div>
      </div>

      <!-- Villages Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AddBarbarianVillageCard :loading="loading" @submit-manual="handleCreateManual"
          @submit-url="handleCreateFromUrl" />

        <BarbarianVillageCard v-for="village in villages" :key="village.target" :village="village" :selectedServerCode="selectedServer?.serverCode" @edit="handleEdit"
          @select="selectVillage" @delete="handleDelete" @submitManualCreate="handleCreateManual" />
      </div>
    </div>



  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBarbarianVillages } from '@/composables/useBarbarianVillages'
import type {
  BarbarianVillage,
  CreateAndUpdateBarbarianVillageDto,
  CreateBarbarianVillageFromUrlDto,
  CreateBarbarianVillageMethod
} from '@/types/barbarian-villages'
import BarbarianVillageCard from '@/components/barbarian-villages/BarbarianVillageCard.vue'
import AddBarbarianVillageCard from '@/components/barbarian-villages/AddBarbarianVillageCard.vue'
import { useServersStore } from '@/stores/servers'

// Global auto-imported composable
declare const useToast: () => any

const route = useRoute()
const router = useRouter()

// Get serverId from URL query params
const serverId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : undefined
})

const handleGoToStrategies = () => {
  const query: any = {
    strategyType: 'barbarian'
  };
  if (serverId.value) {
    query.serverId = serverId.value.toString();
  }
  router.push({ name: 'attack-strategies', query });
};

const serversStore = useServersStore()
const servers = computed(() => serversStore.servers)

const selectedServer = computed(() => servers.value.find(server => server.id === serverId.value) || null)

onMounted(async () => {
  if (!servers.value.length) {
    await serversStore.fetchServers()
  }
})

// Composables
const {
  villages,
  loading,
  error,
  totalCount,
  fetchVillages,
  createVillage,
  createVillageFromUrl,
  updateVillage,
  deleteVillage,
  refreshVillages,
  clearError
} = useBarbarianVillages()

const toast = useToast()

// Computed stats
const attackableCount = computed(() =>
  villages.value.filter(v => v.canAttack).length
)

const nonAttackableCount = computed(() =>
  villages.value.filter(v => !v.canAttack).length
)

type FilterType = 'all' | 'attackable' | 'nonAttackable'
const selectedFilter = computed<FilterType>(() => {
  const qp = route.query.canAttack as string | undefined
  if (qp === 'true') return 'attackable'
  if (qp === 'false') return 'nonAttackable'
  return 'all'
})

const handleSelectFilter = async (filter: FilterType) => {
  const canAttack = filter === 'all' ? undefined : filter === 'attackable'
  await router.replace({
    query: {
      ...route.query,
      canAttack: typeof canAttack === 'boolean' ? String(canAttack) : undefined,
    }
  })
  await fetchVillages(serverId.value, canAttack)
}

const refreshData = async () => {
  try {
    const qp = route.query.canAttack as string | undefined
    const canAttack = qp === undefined ? undefined : qp === 'true'
    await refreshVillages(serverId.value, canAttack)
    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Lista wiosek barbarzynskich została zaktualizowana',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  } catch (err) {
    toast.add({
      title: 'Błąd odświeżania',
      description: 'Nie udało się zaktualizować listy wiosek',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  }
}

const selectedVillage = ref<BarbarianVillage | null>(null)

const selectVillage = (village: BarbarianVillage) => {
  selectedVillage.value = village
}

// Create handlers
const handleCreateManual = async (data: CreateAndUpdateBarbarianVillageDto) => {
  try {
    await createVillage(data, serverId.value)
  } catch (err) {
    console.error('Error creating village:', err)
  }
}

const handleCreateFromUrl = async (data: CreateBarbarianVillageFromUrlDto) => {
  try {
    await createVillageFromUrl(data, serverId.value)
  } catch (err) {
    console.error('Error creating village from URL:', err)
  }
}

// Edit handler
const handleEdit = async (data: CreateAndUpdateBarbarianVillageDto) => {
  try {
    await updateVillage(data.target, data, serverId.value)
  } catch (err) {
    console.error('Error updating village:', err)
  }
}

// Delete handler
const handleDelete = async (village: BarbarianVillage) => {
  try {
    await deleteVillage(village.target, serverId.value)
  } catch (err) {
    console.error('Error deleting village:', err)
  }
}

// Watch for serverId changes
watch(serverId, async (newServerId, oldServerId) => {
  if (newServerId && newServerId !== oldServerId) {
    // Reset selected village when server changes
    selectedVillage.value = null

    // Fetch new data for the selected server
    const qp = route.query.canAttack as string | undefined
    const canAttack = qp === undefined ? undefined : qp === 'true'
    await fetchVillages(newServerId, canAttack)
  }
}, { immediate: true })

// Initial load
onMounted(async () => {
  // When landing directly with canAttack in query, ensure data respects filter
  if (serverId.value) {
    const qp = route.query.canAttack as string | undefined
    const canAttack = qp === undefined ? undefined : qp === 'true'
    await fetchVillages(serverId.value, canAttack)
  }
})
</script>
