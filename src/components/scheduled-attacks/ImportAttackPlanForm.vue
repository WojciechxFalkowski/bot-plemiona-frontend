<template>
  <div class="space-y-4">
    <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-2">
      <div class="flex items-center">
        <UButton size="xs" color="gray" variant="ghost" icon="i-lucide-copy" label="Kopiuj przykłady"
          @click="copyAllExamplesToClipboard" />

        <UTooltip text="Kliknij przycisk obok, aby skopiować przykłady poprawnej struktury planu ataków do schowka">
          <UIcon name="i-lucide-help-circle" class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        </UTooltip>
      </div>
      <UFormField name="rawPlan">
        <template #label>
          <div>
            <span>Plan ataków (BBCode) <span class="text-red-500">*</span></span>
          </div>
        </template>


        <UTextarea v-model="formState.rawPlan" placeholder="Wklej tutaj plan ataków z forum Plemiona..." :rows="10"
          class="w-full font-mono text-sm" />
        <template #help>
          <p class="text-sm text-gray-500">
            Wklej tekst planu ataków skopiowany z forum Plemiona. System automatycznie sparsuje plan i utworzy
            zaplanowane ataki.
          </p>
        </template>
      </UFormField>

      <UFormField label="Opcje importu" name="skipDuplicates">
        <UCheckbox v-model="formState.skipDuplicates" label="Pomiń duplikaty (domyślnie włączone)" />
        <template #help>
          <p class="text-sm text-gray-500">
            Jeśli włączone, ataki które już istnieją w bazie (z tymi samymi parametrami) zostaną pominięte.
          </p>
        </template>
      </UFormField>

      <div class="flex justify-end space-x-3">
        <UButton label="Anuluj" color="gray" variant="ghost" @click="$emit('cancel')" />
        <UButton type="submit" label="Importuj plan" icon="i-lucide-upload" :loading="loading" />
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { z } from 'zod'

declare const useToast: () => any

const toast = useToast()

const schema = z.object({
  rawPlan: z.string().min(10, 'Plan ataków musi zawierać co najmniej 10 znaków'),
  skipDuplicates: z.boolean().default(true),
})

type Schema = z.output<typeof schema>

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  submit: [data: { rawPlan: string; skipDuplicates: boolean }]
  cancel: []
}>()

const formState = reactive<Schema>({
  rawPlan: '',
  skipDuplicates: true,
})

const examples = {
  fake: `1. [b][color=#00a500]Wyślij FEJK[100 off][/color] (1 z 2)[/b]

[b]2025-11-27 [color=#ff0000]14:39:03 - 17:39:03[/color][/b]
650|449 [b]->[/b] 563|481
[url=https://pl218.plemiona.pl/game.php?village=26410&screen=place&target=4871]Wyślij FEJK[/url]`,
  off: `4. [b][color=#a50000]Wyślij OFF[10057 off + 50k na ZAGRODA][/color] (2 z 5)[/b]

[b]2025-11-27 [color=#ff0000]16:45:52 - 17:15:52[/color][/b]
654|454 [b]->[/b] 571|490
[url=https://pl218.plemiona.pl/game.php?village=27374&screen=place&target=6721]Wyślij OFF[/url]`,
}

const copyAllExamplesToClipboard = async () => {
  const allExamples = `${examples.fake}
${examples.off}`


  try {
    await navigator.clipboard.writeText(allExamples)
    toast.add({
      title: 'Skopiowano',
      description: 'Przykłady zostały skopiowane do schowka',
      icon: 'i-lucide-check-circle',
      color: 'green',
    })
  } catch (err) {
    toast.add({
      title: 'Błąd kopiowania',
      description: 'Nie udało się skopiować przykładów',
      icon: 'i-lucide-alert-circle',
      color: 'red',
    })
  }
}

const handleSubmit = async (event: any) => {
  emit('submit', {
    rawPlan: event.data.rawPlan,
    skipDuplicates: event.data.skipDuplicates,
  })
}
</script>
