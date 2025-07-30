<template>
  <UCard class="max-w-2xl">
    <template #header>
      <h3 class="text-base font-medium text-gray-900 dark:text-white">
        Podsumowanie
      </h3>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
      <div class="flex flex-col">
        <span class="text-gray-500 text-xs uppercase tracking-wide">Wioska</span>
        <span class="font-medium">{{ villageLabel }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-gray-500 text-xs uppercase tracking-wide">Budynek</span>
        <span class="font-medium">{{ buildingName }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-gray-500 text-xs uppercase tracking-wide">Poziom</span>
        <span class="font-medium">{{ targetLevel }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  villageLabel: string
  buildingName?: string
  targetLevel: number
}

defineProps<Props>()
</script>
