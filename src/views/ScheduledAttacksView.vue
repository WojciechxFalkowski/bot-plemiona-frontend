<template>
  <div class="scheduled-attacks-view">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Zaplanowane ataki
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Zarządzaj harmonogramami ataków i wsparcia w grze Plemiona
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <UButton icon="i-lucide-refresh-cw" label="Odśwież" :loading="loading" color="gray" variant="ghost"
          class="cursor-pointer" @click="handleRefresh" />
        <UButton icon="i-lucide-trash-2" label="Usuń wszystkie" color="red" variant="outline" class="cursor-pointer"
          :loading="loading" @click="handleDeleteAll" />
        <UButton icon="i-lucide-upload" label="Importuj plan" color="primary" variant="outline" class="cursor-pointer"
          @click="isImportModalOpen = true" />
        <UButton icon="i-lucide-plus" label="Dodaj atak" color="primary" class="cursor-pointer"
          @click="handleOpenCreateModal" />
        <UButton v-if="serverId" icon="i-lucide-calendar-clock" label="Zaplanuj wszystkie" color="purple"
          variant="outline" class="cursor-pointer" :loading="scheduling" @click="handleScheduleAll" />
      </div>
    </div>

    <!-- Error Display -->
    <UAlert v-if="error" icon="i-lucide-alert-circle" color="red" variant="soft" :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }" @close="clearError"
      class="mb-6" />

    <!-- Loading State -->
    <div v-if="loading && attacks.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Ładowanie zaplanowanych ataków...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Stats -->
      <ScheduledAttackStats v-if="attacks.length > 0" :attacks="[...attacks]" @filter-change="handleFilterChange"
        class="mb-6" />

      <!-- Attack List -->
      <ScheduledAttackList :attacks="[...attacks]" :loading="loading" @edit="handleEdit" @delete="handleDelete"
        @execute-now="handleExecuteNow" />
    </div>

    <!-- Import Modal -->
    <UModal v-model:open="isImportModalOpen" title="Import planu ataków"
      description="Wklej plan ataków z forum Plemiona" :ui="{ width: 'max-w-3xl' }">
      <template #body>
        <ImportAttackPlanForm :loading="loading" @submit="handleImportPlan" @cancel="isImportModalOpen = false" />
      </template>
    </UModal>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="isEditModalOpen" :title="editingAttack ? 'Edytuj zaplanowany atak' : 'Utwórz nowy atak'"
      :description="editingAttack ? 'Edytuj parametry zaplanowanego ataku' : 'Utwórz nowy zaplanowany atak'"
      :ui="{ width: 'max-w-3xl' }">
      <template #body>
        <ScheduledAttackModal :attack="editingAttack" :loading="loading" :server-id="serverId"
          @submit="handleSubmitAttack" @cancel="isEditModalOpen = false" />
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Usuń zaplanowany atak"
      description="Czy na pewno chcesz usunąć ten atak?" :ui="{}">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Czy na pewno chcesz usunąć ten zaplanowany atak? Ta operacja jest nieodwracalna.
          </p>
          <div class="flex justify-end space-x-2">
            <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">
              Anuluj
            </UButton>
            <UButton color="error" variant="solid" :loading="loading" @click="handleConfirmDelete">
              Usuń
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete All Confirmation Modal -->
    <UModal v-model:open="isDeleteAllModalOpen" title="Usuń wszystkie zaplanowane ataki"
      :description="serverId ? `Czy na pewno chcesz usunąć wszystkie ataki dla serwera ${serverId}?` : 'Czy na pewno chcesz usunąć wszystkie zaplanowane ataki?'"
      :ui="{}">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Ta operacja jest nieodwracalna. Wszystkie zaplanowane ataki{{ serverId ? ` dla serwera ${serverId}` : '' }}
            zostaną trwale usunięte z bazy danych.
          </p>
          <div class="flex justify-end space-x-2">
            <UButton color="neutral" variant="ghost" @click="isDeleteAllModalOpen = false">
              Anuluj
            </UButton>
            <UButton color="error" variant="solid" :loading="loading" @click="handleConfirmDeleteAll">
              Usuń wszystkie
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScheduledAttacks } from '@/composables/useScheduledAttacks'
import { useServer } from '@/composables/useServer'
import type {
  ScheduledAttack,
  CreateScheduledAttackDto,
  UpdateScheduledAttackDto,
} from '@/types/scheduled-attacks'
import ScheduledAttackStats from '@/components/scheduled-attacks/ScheduledAttackStats.vue'
import ScheduledAttackList from '@/components/scheduled-attacks/ScheduledAttackList.vue'
import ImportAttackPlanForm from '@/components/scheduled-attacks/ImportAttackPlanForm.vue'
import ScheduledAttackModal from '@/components/scheduled-attacks/ScheduledAttackModal.vue'

declare const useToast: () => any

const toast = useToast()
const route = useRoute()
const router = useRouter()

const {
  attacks,
  loading,
  error,
  getAllAttacks,
  importAttackPlan,
  createAttack,
  updateAttack,
  deleteAttack,
  deleteAllAttacks,
  scheduleAllAttacks,
  executeAttackNow,
  clearError,
} = useScheduledAttacks()

const { selectedServer } = useServer()

const serverId = computed(() => {
  const id = route.query.serverId
  return id ? parseInt(id as string) : undefined
})

const isImportModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleteAllModalOpen = ref(false)
const editingAttack = ref<ScheduledAttack | null>(null)
const attackToDelete = ref<ScheduledAttack | null>(null)
const scheduling = ref(false)

const handleRefresh = async () => {
  try {
    if (serverId.value) {
      await getAllAttacks(serverId.value)
    } else {
      await getAllAttacks()
    }
    toast.add({
      title: 'Odświeżono pomyślnie',
      description: 'Lista ataków została zaktualizowana',
      icon: 'i-lucide-check-circle',
      color: 'green',
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd odświeżania',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  }
}

const handleImportPlan = async (data: { rawPlan: string; skipDuplicates: boolean }) => {
  if (!serverId.value) {
    toast.add({
      title: 'Błąd',
      description: 'Wybierz serwer przed importem planu',
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
    return
  }

  try {
    await importAttackPlan(serverId.value, data.rawPlan, data.skipDuplicates)
    isImportModalOpen.value = false
    toast.add({
      title: 'Plan zaimportowany',
      description: 'Ataki zostały zaimportowane pomyślnie',
      icon: 'i-lucide-check-circle',
      color: 'green',
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd importu',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  }
}

const handleOpenCreateModal = () => {
  if (!serverId.value) {
    toast.add({
      title: 'Błąd',
      description: 'Wybierz serwer przed utworzeniem ataku',
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
    return
  }
  editingAttack.value = null
  isEditModalOpen.value = true
}

const handleEdit = (attack: ScheduledAttack) => {
  editingAttack.value = attack
  isEditModalOpen.value = true
}

const handleSubmitAttack = async (data: CreateScheduledAttackDto | UpdateScheduledAttackDto) => {
  try {
    if (editingAttack.value) {
      await updateAttack(editingAttack.value.id, data as UpdateScheduledAttackDto)
      toast.add({
        title: 'Atak zaktualizowany',
        description: 'Zaplanowany atak został zaktualizowany pomyślnie',
        icon: 'i-lucide-check-circle',
        color: 'green',
      })
    } else {
      await createAttack(data as CreateScheduledAttackDto)
      toast.add({
        title: 'Atak utworzony',
        description: 'Nowy zaplanowany atak został utworzony pomyślnie',
        icon: 'i-lucide-check-circle',
        color: 'green',
      })
    }
    isEditModalOpen.value = false
    editingAttack.value = null
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  }
}

const handleDelete = (attack: ScheduledAttack) => {
  attackToDelete.value = attack
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!attackToDelete.value) return

  try {
    await deleteAttack(attackToDelete.value.id)
    isDeleteModalOpen.value = false
    attackToDelete.value = null
    toast.add({
      title: 'Atak usunięty',
      description: 'Zaplanowany atak został usunięty pomyślnie',
      icon: 'i-lucide-check-circle',
      color: 'green',
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd usuwania',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  }
}

const handleExecuteNow = async (attack: ScheduledAttack) => {
  try {
    await executeAttackNow(attack.id)
    toast.add({
      title: 'Atak wykonany',
      description: 'Atak został wykonany pomyślnie',
      icon: 'i-lucide-check-circle',
      color: 'green',
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd wykonania',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  }
}

const handleScheduleAll = async () => {
  if (!serverId.value) return

  scheduling.value = true
  try {
    const result = await scheduleAllAttacks(serverId.value)
    toast.add({
      title: 'Ataki zaplanowane',
      description: result.message,
      icon: 'i-lucide-check-circle',
      color: 'green',
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd harmonogramowania',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  } finally {
    scheduling.value = false
  }
}

const handleDeleteAll = () => {
  isDeleteAllModalOpen.value = true
}

const handleConfirmDeleteAll = async () => {
  try {
    const deletedCount = await deleteAllAttacks(serverId.value)
    isDeleteAllModalOpen.value = false
    toast.add({
      title: 'Ataki usunięte',
      description: `Usunięto ${deletedCount} zaplanowanych ataków${serverId.value ? ` dla serwera ${serverId.value}` : ''}`,
      icon: 'i-lucide-check-circle',
      color: 'green',
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
    toast.add({
      title: 'Błąd usuwania',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  }
}

const handleFilterChange = (filter: string) => {
  // Filter change is handled by ScheduledAttackList component
  // This is just for future extensibility
}

// Watch for server changes and reload attacks
watch(
  () => serverId.value,
  async (newServerId) => {
    if (newServerId) {
      await getAllAttacks(newServerId)
    } else {
      await getAllAttacks()
    }
  }
)

onMounted(async () => {
  if (serverId.value) {
    await getAllAttacks(serverId.value)
  } else {
    await getAllAttacks()
  }
})
</script>

<style scoped>
.scheduled-attacks-view {
  width: 100%;
}
</style>
