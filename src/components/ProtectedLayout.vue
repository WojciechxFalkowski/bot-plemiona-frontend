<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex-grow flex justify-center items-center h-full">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="mt-4 text-gray-600">Ładowanie...</p>
      </div>
    </div>

    <!-- Main content when authenticated -->
    <div v-else-if="isAuthenticated">
      <!-- Sidebar placeholder - można dodać później -->
      <!-- <aside class="hidden lg:block">
        <SidebarMenu />
      </aside> -->

      <!-- Main Content -->
      <div class="flex-1 mx-auto overflow-x-hidden ">
        <slot />
      </div>
    </div>

    <!-- Error state (optional) -->
    <div v-else class="flex-grow flex justify-center items-center h-full">
      <div class="text-center">
        <p class="text-gray-600">Przekierowywanie do logowania...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { isSignedIn, isLoaded } = useAuth()
const authStore = useAuthStore()

const isLoading = ref(true)

const isAuthenticated = computed(() => {
  return isSignedIn.value && authStore.isAuthenticated
})

// Sprawdź stan autoryzacji i przekieruj jeśli potrzeba
const checkAuthAndRedirect = async () => {
  // Czekaj aż Clerk załaduje się kompletnie
  if (!isLoaded.value) {
    return
  }

  if (!isSignedIn.value) {
    // Zapisz aktualną ścieżkę przed przekierowaniem
    const redirectPath = route.fullPath
    router.push({
      name: 'sign-in',
      query: { redirect: redirectPath }
    })
    return
  }

  // Jeśli użytkownik jest zalogowany, ale nie mamy jego profilu, pobierz go
  if (isSignedIn.value && !authStore.currentUser) {
    await authStore.initialize()
  }

  isLoading.value = false
}

onMounted(async () => {
  await checkAuthAndRedirect()
})

// Obserwuj zmiany w stanie autoryzacji
watch([isLoaded, isSignedIn], async () => {
  await checkAuthAndRedirect()
}, { immediate: true })

// Obserwuj zmiany w profilu użytkownika
watch(() => authStore.currentUser, (newUser) => {
  if (newUser || !isSignedIn.value) {
    isLoading.value = false
  }
})
</script>

<style scoped>
.loading-spinner {
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>