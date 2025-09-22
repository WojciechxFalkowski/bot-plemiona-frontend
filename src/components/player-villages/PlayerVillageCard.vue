<template>
  <UCard class="village-card hover:shadow-md transition-shadow duration-200">
    <!-- Compact header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-home" class="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 class="font-semibold text-base text-gray-900">
              <a
                :href="getVillageProfileUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                :title="`Otwórz profil wioski ${village.name} w grze`"
              >
                {{ village.name }}
              </a>
            </h3>
            <p class="text-xs text-gray-500">{{ village.coordinateX }}|{{ village.coordinateY }}</p>
          </div>
        </div>

        <UBadge
          :icon="village.canAttack ? 'i-lucide-shield-check' : 'i-lucide-shield-x'"
          size="xs"
          :color="village.canAttack ? 'green' : 'red'"
          variant="filled"
          :class="village.canAttack ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
        >
          {{ village.canAttack ? 'ON' : 'OFF' }}
        </UBadge>
      </div>
    </template>

    <!-- Compact content -->
    <div class="space-y-3">
      <!-- Player info - each pair in separate line -->
      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">Właściciel:</span>
          <span class="font-medium text-gray-900">{{ village.owner }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">ID Właściciela:</span>
          <span class="font-medium text-gray-900">{{ village.target }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">Plemię:</span>
          <span class="font-medium text-gray-900">{{ village.tribe || 'Brak' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">Punkty:</span>
          <span class="font-medium text-gray-900">{{ village.points }}</span>
        </div>
      </div>

      <!-- Dates - each pair in separate line -->
      <div class="space-y-2 pt-2 border-t border-gray-100">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-1">
            <UIcon name="i-lucide-shield-check" class="w-3 h-3" />
            <span>Weryfikacja:</span>
          </div>
          <span>{{ formatDate(village.lastVerified) }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-1">
            <UIcon name="i-lucide-calendar-plus" class="w-3 h-3" />
            <span>Utworzono:</span>
          </div>
          <span>{{ formatDate(village.createdAt) }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-1">
            <UIcon name="i-lucide-calendar-clock" class="w-3 h-3" />
            <span>Zaktualizowano:</span>
          </div>
          <span>{{ formatDate(village.updatedAt) }}</span>
        </div>
      </div>

      <!-- Actions row -->
      <div class="flex items-center justify-end pt-2 border-t border-gray-100">
        <div class="flex items-center space-x-2">
          <UButton
            size="xs"
            variant="ghost"
            @click="handleVerify"
            :loading="isVerifying"
            class="cursor-pointer"
          >
            <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
          </UButton>

          <!-- Edit Modal -->
          <UModal v-model="showEditModal" title="Edytuj wioskę" description="Edytuj informacje o wiosce">
            <UButton
              icon="i-heroicons-pencil"
              size="xs"
              color="blue"
              variant="ghost"
              class="cursor-pointer"
              @click="openEditModal"
            />

            <template #body>
              <div class="space-y-4">
                <!-- Village ID and Name -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      ID Wioski <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="editForm.villageId"
                      placeholder="Wprowadź ID wioski"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Nazwa Wioski <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="editForm.name"
                      placeholder="Wprowadź nazwę wioski"
                    />
                  </div>
                </div>

                <!-- Coordinates -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Współrzędna X <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="editForm.coordinateX"
                      type="number"
                      placeholder="X"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Współrzędna Y <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="editForm.coordinateY"
                      type="number"
                      placeholder="Y"
                    />
                  </div>
                </div>

                <!-- Owner and Tribe Info -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Właściciel <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="editForm.owner"
                      placeholder="Nazwa właściciela"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      ID Właściciela <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="editForm.target"
                      placeholder="ID właściciela"
                    />
                  </div>
                </div>

                <!-- Tribe Info -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    Plemię
                  </label>
                  <UInput
                    v-model="editForm.tribe"
                    placeholder="Nazwa plemienia"
                  />
                </div>

                <!-- Points and Can Attack -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Punkty <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="editForm.points"
                      type="number"
                      placeholder="Punkty"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div class="flex items-center space-x-2 pt-2">
                      <UCheckbox v-model="editForm.canAttack" />
                      <span class="text-sm font-medium text-gray-700">Można atakować</span>
                    </div>
                  </div>
                </div>

                <!-- Buttons -->
                <div class="flex justify-end gap-2 mt-6">
                  <UButton color="gray" variant="outline" class="cursor-pointer" @click="closeEditModal">
                    Anuluj
                  </UButton>
                  <UButton color="primary" :loading="isUpdating" class="cursor-pointer" @click="saveEdit">
                    Zapisz zmiany
                  </UButton>
                </div>
              </div>
            </template>
          </UModal>

          <!-- Delete Button -->
          <UButton
            icon="i-heroicons-trash"
            size="xs"
            color="red"
            variant="ghost"
            class="cursor-pointer"
            @click="openDeleteModal"
          />
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <UModal v-model:open="showDeleteModal" title="Usuń wioskę" description="Potwierdź usunięcie wioski">
      <template #body>
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">Usuń wioskę</h3>
              <p class="mt-1 text-sm text-gray-500">
                Czy na pewno chcesz usunąć wioskę <strong>{{ village.name }}</strong> ({{ village.coordinateX }}|{{ village.coordinateY }})?
              </p>
              <p class="mt-3 text-sm text-red-600">
                Ta operacja nie może zostać cofnięta.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton color="gray" variant="outline" class="cursor-pointer" @click="closeDeleteModal">
              Anuluj
            </UButton>
            <UButton color="red" :loading="isDeleting" class="cursor-pointer" @click="confirmDelete">
              Usuń wioskę
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PlayerVillage } from '@/types/player-villages';

interface Props {
  village: PlayerVillage;
  onDelete: (id: number, serverId?: number) => Promise<void>;
  serverId?: number;
}

interface Emits {
  (e: 'edit', updateData: any): void;
  (e: 'verify', village: PlayerVillage): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVerifying = ref(false);
const isDeleting = ref(false);
const isUpdating = ref(false);
const showDeleteModal = ref(false);
const showEditModal = ref(false);

// Edit form
const editForm = ref({
  villageId: '',
  name: '',
  coordinateX: 0,
  coordinateY: 0,
  owner: '',
  target: '',
  tribe: '',
  points: 0,
  canAttack: false
});

const menuItems = [
  [{
    label: 'Edytuj',
    icon: 'i-heroicons-pencil',
    click: () => emit('edit', props.village)
  }],
  [{
    label: 'Usuń',
    icon: 'i-heroicons-trash',
    click: () => openDeleteModal()
  }]
];

const handleVerify = async () => {
  isVerifying.value = true;
  try {
    emit('verify', props.village);
  } finally {
    isVerifying.value = false;
  }
};

const openDeleteModal = () => {
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const confirmDelete = async () => {
  isDeleting.value = true;
  try {
    await props.onDelete(props.village.id, props.serverId);
    closeDeleteModal();
  } finally {
    isDeleting.value = false;
  }
};

const openEditModal = () => {
  // Fill form with current village data
  editForm.value = {
    villageId: props.village.villageId,
    name: props.village.name,
    coordinateX: props.village.coordinateX,
    coordinateY: props.village.coordinateY,
  owner: props.village.owner,
  target: props.village.target,
  tribe: props.village.tribe || '',
    points: props.village.points,
    canAttack: props.village.canAttack
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const saveEdit = async () => {
  isUpdating.value = true;
  try {
    // Prepare update data
    const updateData = {
      villageId: editForm.value.villageId,
      name: editForm.value.name,
      coordinateX: Number(editForm.value.coordinateX),
      coordinateY: Number(editForm.value.coordinateY),
    owner: editForm.value.owner,
    target: editForm.value.target,
    tribe: editForm.value.tribe,
      points: Number(editForm.value.points),
      canAttack: editForm.value.canAttack
    };

    emit('edit', updateData);
    closeEditModal();
  } finally {
    isUpdating.value = false;
  }
};

const formatDate = (date?: Date): string => {
  if (!date) return 'Nigdy';
  return new Date(date).toLocaleDateString('pl-PL');
};

const getAttackStatusColor = (canAttack: boolean): string => {
  return canAttack ? 'green' : 'red';
};

const getAttackStatusText = (canAttack: boolean): string => {
  return canAttack ? 'on' : 'off';
};

const getVillageProfileUrl = (): string => {
  if (!props.village.server?.serverCode) {
    return '#';
  }

  const serverCode = props.village.server.serverCode;
  const villageId = props.village.villageId;
  const target = props.village.target;
  const coordinates = `${props.village.coordinateX};${props.village.coordinateY}`;

  return `https://${serverCode}.plemiona.pl/game.php?village=${villageId}&screen=info_village&id=${target}#${coordinates}`;
};
</script>

<style scoped></style>
