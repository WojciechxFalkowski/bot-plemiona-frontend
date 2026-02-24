<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()

const currentLayout = computed(() => {
  const layoutName = route.meta?.layout as string || 'default'

  const layouts = {
    app: AppLayout,
    default: DefaultLayout
  }

  return layouts[layoutName as keyof typeof layouts] || DefaultLayout
})
</script>

<template>
  <UApp>
    <div id="app" class="text-gray-900 dark:text-gray-100">
      <component :is="currentLayout">
        <RouterView />
      </component>
      <teleport to="body">
        <vue3-snackbar bottom right :duration="4000"></vue3-snackbar>
      </teleport>
    </div>
  </UApp>
</template>

<style>
* {
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}
</style>
