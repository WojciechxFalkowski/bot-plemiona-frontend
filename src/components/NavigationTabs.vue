<template>
  <UTabs
    v-model="activeTab"
    :items="tabItems"
    :variant="config.variant"
    :color="config.color"
    :size="config.size"
    :orientation="config.orientation"
    :content="false"
    class="w-full"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { NavigationTabsConfig, TabConfig } from '@/types/navigation'

export interface Props {
  config: NavigationTabsConfig
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    tabs: [],
    variant: 'pill',
    color: 'primary',
    size: 'md',
    orientation: 'horizontal'
  })
})

const route = useRoute()
const router = useRouter()

const tabItems = computed(() => {
  return props.config.tabs.map((tab: TabConfig) => ({
    label: tab.label,
    value: tab.path,
    icon: tab.icon,
    disabled: tab.disabled,
    description: tab.description
  }))
})

const activeTab = computed({
  get() {
    const currentPath = route.path
    const matchingTab = props.config.tabs.find(tab => tab.path === currentPath)
    return matchingTab?.path || props.config.tabs[0]?.path || ''
  },
  set(newPath: string) {
    if (newPath && newPath !== route.path) {
      router.push(newPath)
    }
  }
})
</script>
