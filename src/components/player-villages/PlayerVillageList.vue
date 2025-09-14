<template>
  <div class="player-village-list">
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
    </div>

    <div v-else-if="villages.length === 0" class="text-center py-8">
      <UIcon name="i-heroicons-home" class="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-500">Brak wiosek graczy</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PlayerVillageCard
        v-for="village in villages"
        :key="village.id"
        :village="village"
        @edit="$emit('edit', village)"
        @delete="$emit('delete', village)"
        @verify="$emit('verify', village)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerVillage } from '@/types/player-villages';

interface Props {
  villages: PlayerVillage[];
  loading: boolean;
}

interface Emits {
  (e: 'edit', village: PlayerVillage): void;
  (e: 'delete', village: PlayerVillage): void;
  (e: 'verify', village: PlayerVillage): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.player-village-list {
  @apply w-full;
}
</style>
