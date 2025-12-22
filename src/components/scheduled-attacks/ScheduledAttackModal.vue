<template>
  <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-2 gap-2 sm:gap-4">
      <UFormField label="Server ID" name="serverId" required>
        <UInput
          v-model.number="formState.serverId"
          type="number"
          readonly
          required
          class="text-sm"
        />
      </UFormField>

      <UFormField label="Typ ataku" required>
        <USelect
          v-model="formState.attackType"
          :items="attackTypeOptions"
          value-key="value"
          placeholder="Wybierz typ ataku"
          :content="{ side: 'bottom', align: 'start', class: 'z-[10001]' }"
          :ui="{ content: 'z-[10001]' }"
          class="text-sm w-full"
        />
      </UFormField>

      <UFormField label="Village ID" name="villageId">
        <UInput
          v-model="formState.villageId"
          placeholder="np. 26410"
          class="text-sm"
        />
        <template #help>
          <p class="text-xs text-gray-500">ID wioski źródłowej (opcjonalne)</p>
        </template>
      </UFormField>

      <UFormField label="Target ID" name="targetId" required>
        <UInput
          v-model="formState.targetId"
          placeholder="np. 4871"
          required
          class="text-sm"
        />
      </UFormField>

      <UFormField label="Wsp. źródła" name="sourceCoordinates" required>
        <UInput
          v-model="formState.sourceCoordinates"
          placeholder="650|449"
          required
          class="text-sm"
        />
        <template #help>
          <p class="text-xs text-gray-500">Format: X|Y</p>
        </template>
      </UFormField>

      <UFormField label="Wsp. celu" name="targetCoordinates" required>
        <UInput
          v-model="formState.targetCoordinates"
          placeholder="563|481"
          required
          class="text-sm"
        />
        <template #help>
          <p class="text-xs text-gray-500">Format: X|Y</p>
        </template>
      </UFormField>

      <UFormField v-if="isEditMode" label="Status" name="status" class="col-span-2">
        <USelect
          v-model="formState.status"
          :items="statusOptions"
          value-key="value"
          placeholder="Wybierz status"
          :disabled="formState.status === 'completed' || formState.status === 'failed' || formState.status === 'expired'"
          :content="{ side: 'bottom', align: 'start', class: 'z-[10001]' }"
          :ui="{ content: 'z-[10001]' }"
          class="text-sm w-full"
        />
        <template #help>
          <p class="text-xs text-gray-500">
            Status "Zakończony", "Nieudany" i "Wygasły" nie mogą być zmienione
          </p>
        </template>
      </UFormField>
    </div>

    <UFormField label="URL ataku" name="attackUrl" required>
      <UTextarea
        v-model="formState.attackUrl"
        placeholder="https://pl218.plemiona.pl/game.php?village=26410&screen=place&target=4871"
        :rows="3"
        required
        class="text-sm w-full"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-2 sm:gap-4">
      <UFormField label="Czas od" name="sendTimeFrom" required>
        <UInput
          v-model="formState.sendTimeFrom"
          type="datetime-local"
          required
          class="text-xs sm:text-sm px-1.5 sm:px-2.5 py-1 sm:py-1.5 max-w-[140px] sm:max-w-none"
        />
      </UFormField>

      <UFormField label="Czas do" name="sendTimeTo" required>
        <UInput
          v-model="formState.sendTimeTo"
          type="datetime-local"
          required
          class="text-xs sm:text-sm px-1.5 sm:px-2.5 py-1 sm:py-1.5 max-w-[140px] sm:max-w-none"
        />
      </UFormField>
    </div>

    <UFormField label="Opis" name="description">
      <UTextarea
        v-model="formState.description"
        placeholder="np. 100 off, 50k na ZAGRODA"
        :rows="2"
        class="text-sm w-full"
      />
    </UFormField>

    <div class="flex justify-end space-x-3">
      <UButton
        label="Anuluj"
        color="gray"
        variant="ghost"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEditMode ? 'Zaktualizuj' : 'Utwórz'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { z } from 'zod'
import type {
  ScheduledAttack,
  CreateScheduledAttackDto,
  UpdateScheduledAttackDto,
} from '@/types/scheduled-attacks'

const schema = z.object({
  serverId: z.number().min(1),
  villageId: z.string().optional(),
  targetId: z.string().min(1),
  sourceCoordinates: z.string().regex(/^\d+\|\d+$/, 'Format: X|Y'),
  targetCoordinates: z.string().regex(/^\d+\|\d+$/, 'Format: X|Y'),
  attackUrl: z.string().url(),
  attackType: z.enum(['off', 'fake', 'nobleman', 'support']),
  sendTimeFrom: z.string().min(1),
  sendTimeTo: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'scheduled', 'executing', 'completed', 'failed', 'cancelled', 'expired']).optional(),
})

type Schema = z.output<typeof schema>

interface Props {
  attack?: ScheduledAttack | null
  loading?: boolean
  serverId?: number
}

const props = withDefaults(defineProps<Props>(), {
  attack: null,
  loading: false,
  serverId: undefined,
})

const emit = defineEmits<{
  submit: [data: CreateScheduledAttackDto | UpdateScheduledAttackDto]
  cancel: []
}>()

const isEditMode = computed(() => !!props.attack)

const attackTypeOptions = [
  { label: 'OFF', value: 'off' },
  { label: 'FEJK', value: 'fake' },
  { label: 'SZLACHCIC', value: 'nobleman' },
  { label: 'WSPARCIE', value: 'support' },
]

const statusOptions = [
  { label: 'Oczekujący', value: 'pending' },
  { label: 'Zaplanowany', value: 'scheduled' },
  { label: 'Wykonywany', value: 'executing' },
  { label: 'Zakończony', value: 'completed' },
  { label: 'Nieudany', value: 'failed' },
  { label: 'Anulowany', value: 'cancelled' },
]

const formState = reactive<Partial<Schema>>({
  serverId: props.serverId || props.attack?.serverId || undefined,
  villageId: props.attack?.villageId || '',
  targetId: props.attack?.targetId || '',
  sourceCoordinates: props.attack?.sourceCoordinates || '',
  targetCoordinates: props.attack?.targetCoordinates || '',
  attackUrl: props.attack?.attackUrl || '',
  attackType: props.attack?.attackType || 'off',
  sendTimeFrom: formatDateForInput(props.attack?.sendTimeFrom) || '',
  sendTimeTo: formatDateForInput(props.attack?.sendTimeTo) || '',
  description: props.attack?.description || '',
  status: props.attack?.status || 'pending',
})

function formatDateForInput(date: Date | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function parseDateFromInput(dateString: string): Date {
  return new Date(dateString)
}

watch(
  () => props.attack,
  (newAttack) => {
    if (newAttack) {
      formState.serverId = newAttack.serverId
      formState.villageId = newAttack.villageId || ''
      formState.targetId = newAttack.targetId
      formState.sourceCoordinates = newAttack.sourceCoordinates
      formState.targetCoordinates = newAttack.targetCoordinates
      formState.attackUrl = newAttack.attackUrl
      formState.attackType = newAttack.attackType
      formState.sendTimeFrom = formatDateForInput(newAttack.sendTimeFrom)
      formState.sendTimeTo = formatDateForInput(newAttack.sendTimeTo)
      formState.description = newAttack.description || ''
      formState.status = newAttack.status
    }
  },
  { immediate: true }
)

watch(
  () => props.serverId,
  (newServerId) => {
    if (newServerId && !isEditMode.value) {
      formState.serverId = newServerId
    }
  }
)

const handleSubmit = async (event: any) => {
  const data = {
    ...event.data,
    sendTimeFrom: parseDateFromInput(event.data.sendTimeFrom),
    sendTimeTo: parseDateFromInput(event.data.sendTimeTo),
  }

  if (isEditMode.value) {
    // Update mode - only send changed fields
    const updateData: UpdateScheduledAttackDto = {
      ...data,
      serverId: undefined, // Don't allow changing serverId
    }
    emit('submit', updateData)
  } else {
    // Create mode - send all required fields
    const createData: CreateScheduledAttackDto = {
      serverId: data.serverId!,
      villageId: data.villageId || '',
      targetId: data.targetId,
      sourceCoordinates: data.sourceCoordinates,
      targetCoordinates: data.targetCoordinates,
      attackUrl: data.attackUrl,
      attackType: data.attackType,
      sendTimeFrom: data.sendTimeFrom,
      sendTimeTo: data.sendTimeTo,
      description: data.description,
    }
    emit('submit', createData)
  }
}
</script>
