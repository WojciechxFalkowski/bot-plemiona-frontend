<template>
  <ProtectedLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Drawer Menu -->
      <DrawerMenu :config="drawerMenuConfig" />

      <!-- Main Content -->
      <div class="lg:ml-60">
        <!-- Mobile Content Padding (for fixed header) -->
        <div class="lg:hidden h-16"></div>

        <!-- Page Content -->
        <main class="min-h-screen">
          <div class="hidden lg:flex items-center justify-between p-6 bg-white border-b border-gray-200">
            <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
            <UserButton :appearance="userButtonAppearance" />
          </div>

          <div class="p-2 lg:p-4">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </ProtectedLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UserButton } from '@clerk/vue'
import ProtectedLayout from '@/components/ProtectedLayout.vue'
import DrawerMenu from '@/components/DrawerMenu.vue'
import { drawerMenuConfig } from '@/config/navigationTabs'

const route = useRoute()

const userButtonAppearance = {
  elements: {
    avatarBox: 'header-user-avatar',
    userButtonPopover: 'header-user-popover',
  },
}

const pageTitle = computed(() => {
  // Get page title based on current route
  const pathSegments = route.path.split('/').filter(Boolean)

  if (pathSegments.length === 0) return 'Dashboard'

  // Find the menu item that matches current path
  const findMenuItem = (items: any[], path: string): any => {
    for (const item of items) {
      if (item.path === path) return item
      if (item.children) {
        const found = findMenuItem(item.children, path)
        if (found) return found
      }
    }
    return null
  }

  const currentItem = findMenuItem(drawerMenuConfig.items, route.path)
  return currentItem?.label || 'Plemiona Bot'
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
