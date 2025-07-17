<template>
  <div class="dashboard-content">
    <VillagesList />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import VillagesList from '@/components/VillagesList.vue'

const authStore = useAuthStore()

onMounted(async () => {
  // Dashboard mounted
})
</script>

<style scoped>
.dashboard-content {
  /* Dashboard specific styles */
}
</style>
