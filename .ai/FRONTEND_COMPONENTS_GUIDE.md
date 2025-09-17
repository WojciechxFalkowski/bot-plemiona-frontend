# Frontend Components Guide - Best Practices

## Table of Contents
1. [USelect Component](#uselect-component)
2. [Modal Components](#modal-components)
3. [Common Pitfalls](#common-pitfalls)
4. [Debugging Tips](#debugging-tips)

## USelect Component

### ✅ Correct Implementation (Working)

```vue
<template>
  <USelect
    v-model="selectedValue"
    :items="options"
    value-key="value"
    placeholder="Wybierz opcję..."
    @update:model-value="handleChange"
    :disabled="options.length === 0"
    :loading="loading"
  />
</template>

<script setup lang="ts">
const options = computed(() => 
  data.value.map(item => ({
    label: `${item.name} (${item.description})`,
    value: item.id
  }))
)

const handleChange = (value: string | null) => {
  if (!value) return;
  // Handle selection
}
</script>
```

### ❌ Incorrect Implementation (Not Working)

```vue
<template>
  <!-- WRONG: Using :options instead of :items -->
  <USelect
    v-model="selectedValue"
    :options="options"
    placeholder="Wybierz opcję..."
    @change="handleChange"
  />
</template>
```

### Key Differences

| Property | Correct | Incorrect | Why |
|----------|---------|-----------|-----|
| Data prop | `:items` | `:options` | NuxtUI USelect expects `items` |
| Value key | `value-key="value"` | Missing | Required to specify which field is the value |
| Event | `@update:model-value` | `@change` | NuxtUI uses `update:model-value` |
| Event parameter | Direct value | Event object | `update:model-value` passes value directly |

### Data Structure

```typescript
// Correct structure for USelect
interface SelectOption {
  label: string;  // Display text
  value: string;  // Actual value
  disabled?: boolean; // Optional
}

const options: SelectOption[] = [
  { label: "Option 1", value: "opt1" },
  { label: "Option 2", value: "opt2" }
]
```

## Modal Components

### ✅ Correct Implementation (Working)

```vue
<template>
  <!-- Modal with button inside (opens on click) -->
  <UModal title="Modal Title">
    <UButton @click="openModal">
      Open Modal
    </UButton>
    
    <template #body>
      <ModalContent @close="closeModal" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const openModal = () => {
  // Modal opens automatically when button is clicked
}

const closeModal = () => {
  // Handle close logic
}
</script>
```

### ❌ Incorrect Implementation (Not Working)

```vue
<template>
  <!-- WRONG: Using v-model:open with state management -->
  <UModal v-model:open="isModalOpen" title="Modal Title">
    <template #body>
      <ModalContent @close="closeModal" />
    </template>
  </UModal>
  
  <UButton @click="isModalOpen = true">
    Open Modal
  </UButton>
</template>

<script setup lang="ts">
const isModalOpen = ref(false) // This causes issues

const closeModal = () => {
  isModalOpen.value = false
}
</script>
```

### Modal Patterns

#### Pattern 1: Button Inside Modal (Recommended)
```vue
<UModal title="Edit Item">
  <UButton icon="i-heroicons-pencil" @click="editItem">
    Edit
  </UButton>
  
  <template #body>
    <EditForm :item="selectedItem" @save="handleSave" @cancel="handleCancel" />
  </template>
</UModal>
```

#### Pattern 2: Confirmation Modal
```vue
<UModal title="Confirm Delete">
  <UButton color="red" icon="i-heroicons-trash" @click="deleteItem">
    Delete
  </UButton>
  
  <template #body>
    <div class="space-y-4">
      <p>Are you sure you want to delete this item?</p>
      <div class="flex justify-end gap-2">
        <UButton @click="confirmDelete">Confirm</UButton>
      </div>
    </div>
  </template>
</UModal>
```

## Common Pitfalls

### 1. USelect Issues

**Problem**: Select shows empty options despite having data
```typescript
// Debug output shows: "1 opcji dostępnych, villages: 1"
// But select is empty
```

**Solution**: Use correct props
```vue
<!-- Wrong -->
<USelect :options="data" @change="handler" />

<!-- Correct -->
<USelect :items="data" value-key="value" @update:model-value="handler" />
```

### 2. Modal Issues

**Problem**: Modal opens automatically on page load
```vue
<!-- Wrong: Modal state management -->
<UModal v-model:open="isOpen">
  <UButton @click="isOpen = true">Open</UButton>
</UModal>
```

**Solution**: Use button inside modal pattern
```vue
<!-- Correct: Button inside modal -->
<UModal title="Modal">
  <UButton @click="openModal">Open</UButton>
  <template #body>
    <ModalContent />
  </template>
</UModal>
```

### 3. Data Type Mismatches

**Problem**: TypeScript errors with v-model
```typescript
// selectedId is string, but value is number
const selectedId = ref<string>('')
const options = [{ label: 'Test', value: 123 }] // number!
```

**Solution**: Match types
```typescript
const selectedId = ref<number | null>(null)
const options = [{ label: 'Test', value: 123 }] // number
```

## Debugging Tips

### 1. USelect Debugging

```vue
<template>
  <USelect v-model="selected" :items="options" />
  
  <!-- Debug info -->
  <div class="mt-2 text-sm text-gray-500">
    Options: {{ options.length }}, Selected: {{ selected }}
    <br>
    Data: {{ JSON.stringify(options) }}
  </div>
</template>
```

### 2. Modal Debugging

```vue
<template>
  <UModal title="Debug Modal">
    <UButton @click="debugModal">
      Debug Modal
    </UButton>
    
    <template #body>
      <div>
        <p>Modal is open: {{ isOpen }}</p>
        <UButton @click="closeModal">Close</UButton>
      </div>
    </template>
  </UModal>
</template>
```

### 3. Console Debugging

```typescript
// In composables
const fetchData = async () => {
  console.log('Fetching data from:', url)
  const response = await fetch(url)
  const data = await response.json()
  console.log('Data received:', data)
  // Process data...
}
```

## Best Practices Summary

### USelect
1. Always use `:items` not `:options`
2. Always include `value-key="value"`
3. Use `@update:model-value` not `@change`
4. Match data types between v-model and options
5. Use computed properties for data transformation

### Modals
1. Use button inside modal pattern
2. Avoid `v-model:open` state management
3. Use `#body` template for content
4. Handle close events in content components

### General
1. Check existing working components for patterns
2. Use TypeScript for type safety
3. Add debug output during development
4. Test with real data, not mock data
5. Follow NuxtUI documentation patterns

## References

- [NuxtUI USelect Documentation](https://ui.nuxt.com/components/select)
- [NuxtUI UModal Documentation](https://ui.nuxt.com/components/modal)
- Working examples in this codebase:
  - `ServerSelector.vue` - USelect pattern
  - `BarbarianVillageCard.vue` - Modal pattern
  - `DeleteConfirmationModal.vue` - Confirmation modal pattern
