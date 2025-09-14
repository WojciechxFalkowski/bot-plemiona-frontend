<template>
  <UCard class="village-card">
    <template #header>
      <div class="flex space-x-2 justify-between items-center">
        <div class="flex-1">
          <h3 class="font-semibold text-lg">{{ village.name }}</h3>
          <p class="text-sm text-gray-600">{{ village.coordinateX }}|{{ village.coordinateY }}</p>
        </div>

        <div class="flex items-center gap-2">
          <UBadge :icon="village.canAttack ? 'uiw:smile-o' : 'uiw:frown-o'" size="xs" class="py-1"
            :color="village.canAttack ? 'success' : 'error'" variant="solid">
            {{ village.canAttack ? 'ON' : 'OFF' }}
          </UBadge>
          <!-- <UDropdown :items="menuItems">
            <UButton variant="ghost" color="gray" icon="i-heroicons-ellipsis-vertical" />
          </UDropdown> -->
        </div>
      </div>
    </template>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div>
        <p class="text-sm text-gray-500">Właściciel</p>
        <p class="font-medium">{{ village.owner }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Plemię</p>
        <p class="font-medium">{{ village.tribe || 'Brak' }}</p>
      </div>

      <div>
        <p class="text-sm text-gray-500">Punkty</p>
        <p class="font-medium">{{ village.points }}</p>
      </div>

      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-map-pin" class="text-gray-400 w-4 h-4" />
        <span class="text-sm text-gray-600">
          Koordynaty: {{ village.coordinateX }}|{{ village.coordinateY }}
        </span>
      </div>
    </div>

    <!-- Dates -->
    <div class="text-xs text-gray-500 space-y-1">
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>Ostatnia weryfikacja: {{ formatDate(village.lastVerified) }}</span>
        <UButton size="xs" variant="ghost" @click="handleVerify" :loading="isVerifying">
          Weryfikuj
        </UButton>
      </div>

      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-calendar-plus" class="w-3 h-3" />
        <span>Utworzono: {{ formatDate(village.createdAt) }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-calendar-clock" class="w-3 h-3" />
        <span>Zaktualizowano: {{ formatDate(village.updatedAt) }}</span>
      </div>
    </div>


    <template #footer>
      <div class="flex justify-end space-x-2">
        <UModal title="Edytuj wioskę barbarzynską" description="Edytuj wioskę barbarzynską">
          <UButton icon="i-lucide-edit" size="sm" color="blue" variant="ghost" class="cursor-pointer">
            Edytuj
          </UButton>

          <!-- <template #body> -->
          <!-- <BarbarianVillageModal :village="village" :loading="loading" @submit-manual="handleEdit" /> -->
          <!-- </template> -->
        </UModal>

        <!-- <DeleteConfirmationModal :village="village" :loading="loading" @confirm="handleDelete"
          @selectVillage="selectVillage" /> -->
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PlayerVillage } from '@/types/player-villages';

interface Props {
  village: PlayerVillage;
}

interface Emits {
  (e: 'edit', village: PlayerVillage): void;
  (e: 'delete', village: PlayerVillage): void;
  (e: 'verify', village: PlayerVillage): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVerifying = ref(false);

const menuItems = [
  [{
    label: 'Edytuj',
    icon: 'i-heroicons-pencil',
    click: () => emit('edit', props.village)
  }],
  [{
    label: 'Usuń',
    icon: 'i-heroicons-trash',
    click: () => emit('delete', props.village)
  }]
];

const handleVerify = async () => {
  isVerifying.value = true;
  try {
    emit('verify', props.village);
  } finally {
    isVerifying.value = false;
  }
};

const formatDate = (date?: Date): string => {
  if (!date) return 'Nigdy';
  return new Date(date).toLocaleDateString('pl-PL');
};

const getAttackStatusColor = (canAttack: boolean): string => {
  return canAttack ? 'green' : 'red';
};

const getAttackStatusText = (canAttack: boolean): string => {
  return canAttack ? 'on' : 'off';
};
</script>

<style scoped></style>
