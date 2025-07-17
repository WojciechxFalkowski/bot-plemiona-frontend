<template>
  <div>
    <!-- Mobile Header with Hamburger Button -->
    <div v-if="showMobileHeader"
      class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <UserButton :appearance="userButtonAppearance" />

      <UButton icon="i-lucide-menu" variant="ghost" color="gray" size="md" @click="isOpen = true"
        class="hamburger-btn cursor-pointer p-2" />
    </div>

    <!-- Mobile Overlay -->
    <div v-show="isOpen"
      class="lg:hidden fixed inset-0 z-51 transition-opacity duration-300 cursor-pointer bg-black bg-opacity-75"
      @click="isOpen = false"></div>

    <!-- Unified Sidebar -->
    <div
      class="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-200 z-52 transition-transform duration-300 ease-in-out lg:translate-x-0"
      :class="{
        'translate-x-0': isOpen,
        '-translate-x-full': !isOpen
      }">
      <nav class="p-4">
        <DrawerMenuItems :items="config.items" @navigate="handleNavigate" />
      </nav>
    </div>

    <!-- Content Spacer for Desktop -->
    <div class="hidden lg:block w-80"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DrawerMenuConfig } from '@/types/navigation'
import DrawerMenuItems from './DrawerMenuItems.vue'
import { UserButton } from '@clerk/vue'

export interface Props {
  config: DrawerMenuConfig
  showMobileHeader?: boolean
}

const userButtonAppearance = {
  elements: {
    avatarBox: 'header-user-avatar',
    userButtonPopover: 'header-user-popover',
  },
}

const props = withDefaults(defineProps<Props>(), {
  showMobileHeader: true
})

const router = useRouter()
const isOpen = ref(false)

const handleNavigate = (path: string) => {
  router.push(path)
  // Close mobile drawer on navigation
  isOpen.value = false
}

// Prevent body scroll when drawer is open on mobile
const toggleBodyScroll = (disable: boolean) => {
  if (typeof window !== 'undefined') {
    if (disable) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
}

// Watch for drawer state changes on mobile
watch(isOpen, (newValue) => {
  // Only disable scroll on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    toggleBodyScroll(newValue)
  }
})

// Handle ESC key to close drawer
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Reset body scroll when component unmounts
  toggleBodyScroll(false)
})
</script>


