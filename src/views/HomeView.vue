<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@clerk/vue'

const router = useRouter()
const { isSignedIn } = useAuth()

onMounted(() => {
  // Redirect based on authentication status
  if (isSignedIn.value) {
    router.push('/dashboard')
  } else {
    router.push('/sign-in')
  }
})
</script>

<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p>Przekierowywanie...</p>
  </div>
</template>

<style scoped>
.loading-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
