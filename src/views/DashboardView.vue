<template>
  <ProtectedLayout>
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <Logo />
          <div class="header-actions">
            <UserButton :appearance="userButtonAppearance" />
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <VillagesList />
      </main>
    </div>
  </ProtectedLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserButton } from '@clerk/vue'
import { useAuthStore } from '@/stores/auth'
import ProtectedLayout from '@/components/ProtectedLayout.vue'
import Logo from '@/components/Logo.vue'
import VillagesList from '@/components/VillagesList.vue'

const authStore = useAuthStore()

const userButtonAppearance = {
  elements: {
    avatarBox: 'header-user-avatar',
    userButtonPopover: 'header-user-popover',
  },
}

onMounted(async () => {
  // Dashboard mounted
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo styles are handled in Logo component */

.header-actions {
  display: flex;
  align-items: center;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}



/* Global styles for header UserButton */
:global(.header-user-avatar) {
  width: 40px !important;
  height: 40px !important;
}

:global(.header-user-popover) {
  border-radius: 12px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    padding: 0 0.5rem;
  }

  /* Logo responsive styles are handled in Logo component */

  .dashboard-main {
    padding: 1rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    gap: 1rem;
    text-align: center;
  }
}
</style>