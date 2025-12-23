<template>
  <div class="space-y-2">
    <div v-for="item in items" :key="item.path" class="menu-item-wrapper">
      <!-- Item without children -->
      <div v-if="!item.children || item.children.length === 0">
        <UButton v-if="shouldShowMenuItem(item.path)" :icon="item.icon" :label="item.label" variant="ghost" color="gray"
          size="sm" :class="[
            'w-full justify-start text-left h-auto py-3 px-3 cursor-pointer',
            isActive(item.path) ? 'bg-primary-50 text-primary-600 font-bold border-r-2 border-primary-600' : 'hover:bg-gray-50'
          ]" @click="$emit('navigate', item.path)" />
      </div>

      <!-- Item with children (accordion) -->
      <div v-else v-if="shouldShowMenuItem(item.path)">
        <UAccordion :items="[{
          class: 'px-3 cursor-pointer text-xs',
          label: item.label,
          icon: item.icon,
          value: item.path,
          slot: 'content'
        }]" :default-open="isActiveCategory(item) ? [item.path] : []" :class="[
          'accordion-wrapper cursor-pointer',
          isActiveCategory(item) ? 'active-category' : ''
        ]">
          <template #content="{ item: accordionItem, open }">
            <div class="ml-6 space-y-1">
              <UButton v-for="child in item.children" :key="child.path" :icon="child.icon" :label="child.label"
                variant="ghost" color="gray" size="sm" :class="[
                  'w-full justify-start h-auto py-2 px-3 cursor-pointer',
                  isActive(child.path) ? 'bg-primary-100 text-primary-700 font-bold border-r-2 border-primary-600' : 'hover:bg-gray-50 text-gray-600'
                ]" @click="$emit('navigate', child.path)" />
            </div>
          </template>
        </UAccordion>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import type { DrawerMenuItem } from '@/types/navigation'

export interface Props {
  items: DrawerMenuItem[]
}

const props = defineProps<Props>()

defineEmits<{
  navigate: [path: string]
}>()

const route = useRoute()

const hasServerId = computed(() => {
  const serverId = route.query.serverId
  return !!serverId && serverId !== ''
})

const isActive = (path: string): boolean => {
  return route.path === path
}

const isActiveCategory = (item: DrawerMenuItem): boolean => {
  if (!item.children) return false

  // Check if current route matches any child path or the parent path itself
  return item.children.some(child => route.path === child.path) || route.path === item.path
}

const shouldShowMenuItem = (path: string): boolean => {
  // Always show dashboard
  if (path === '/dashboard') return true

  // For other pages, require serverId in query params
  const shouldShow = hasServerId.value

  // console.log(`Menu item ${path}: hasServerId=${hasServerId.value}, shouldShow=${shouldShow}`)

  return shouldShow
}
</script>
<style scoped>
/* Zmniejsz rozmiar tekstu dla nagłówków akordeonu (sekcje z dziećmi) */
.accordion-wrapper :deep(button) {
  font-size: 0.75rem !important;
  /* text-xs */
}
</style>
