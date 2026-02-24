<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Test Powiadomień Push</h1>

    <div class="flex items-center gap-3">
      <UButton
        class=" px-2 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        @click="handleActivateNotifications" :disabled="isActivating" aria-label="Aktywuj powiadomienia">
        <span v-if="!isActivating">Aktywuj powiadomienia</span>
        <span v-else>Aktywuję…</span>
      </UButton>

      <UButton color="success"
        class="px-3 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        @click="handleRegister" :disabled="!deviceToken || isRegistering || !isSignedIn || isRegistered"
        aria-label="Zarejestruj token urządzenia">
        <span v-if="!isRegistering">Zarejestruj</span>
        <span v-else>Rejestruję…</span>
      </UButton>

      <UButton color="error"
        class="px-3 py-2 rounded-md  text-white  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        @click="handleUnregister" :disabled="isUnregistering || !isSignedIn || !isRegistered"
        aria-label="Wyrejestruj token urządzenia">
        <span v-if="!isUnregistering">Wyrejestruj</span>
        <span v-else>Wyrejestrowuję…</span>
      </UButton>
    </div>

    <div v-if="deviceToken" class="space-y-2">
      <div class="flex items-center gap-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">Twój token urządzenia (skopiuj do Postmana):</p>
        <UButton class="px-2 py-1" @click="handleCopy" aria-label="Kopiuj token">
          Kopiuj
        </UButton>

      </div>
      <pre class="bg-gray-100 dark:bg-gray-800 p-3 whitespace-pre-wrap break-words rounded text-sm text-gray-900 dark:text-gray-100">{{ deviceToken }}</pre>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { Ref } from 'vue';
import { getToken as getFcmToken } from 'firebase/messaging';
import { messaging } from '@/firebaseConfig';
import { useAuth } from '@clerk/vue';
import { useNotifications } from '@/composables/useNotifications';
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js';
// NuxtUI toasts were integrated in project memory; use composable if available
const toast = useToast()

const deviceToken: Ref<string | null> = ref(null);
const isActivating: Ref<boolean> = ref(false);
const { registerToken, unregisterToken, loadingRegister: isRegistering, loadingUnregister: isUnregistering } = useNotifications();

const { isSignedIn, isLoaded, getToken } = useAuth();
const isReady = computed(() => Boolean(isLoaded?.value) && Boolean(isSignedIn?.value));

// Local registration state backed by localStorage
const LOCAL_STORAGE_KEY = 'push-device-registered';
const TOKEN_STORAGE_KEY = 'push-device-token';
const isRegistered: Ref<boolean> = ref(false);

onMounted(() => {
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    isRegistered.value = stored === '1';
    if (isRegistered.value) {
      const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (savedToken) {
        deviceToken.value = savedToken;
      }
    }
  } catch {
    isRegistered.value = false;
  }
});

const handleActivateNotifications = async () => {
  if (isActivating.value) return;
  isActivating.value = true;
  const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

  if (!VAPID_KEY) {
    console.error('Brak klucza VAPID.');
    toast.add({ title: 'Błąd', description: 'Brak klucza VAPID', color: 'error' });
    isActivating.value = false;
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.error('Brak zgody na powiadomienia.');
    toast.add({ title: 'Odmowa', description: 'Brak zgody na powiadomienia', color: 'warning' });
    isActivating.value = false;
    return;
  }

  try {
    const currentToken = await getFcmToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (currentToken) {
      deviceToken.value = currentToken;
      toast.add({ title: 'Sukces', description: 'Pobrano token urządzenia', color: 'success' });
    } else {
      console.log('Nie udało się uzyskać tokena.');
      toast.add({ title: 'Błąd', description: 'Nie udało się uzyskać tokena', color: 'error' });
    }
  } catch (err) {
    console.error('Wystąpił błąd podczas pobierania tokena: ', err);
    toast.add({ title: 'Błąd', description: 'Błąd podczas pobierania tokena', color: 'error' });
  } finally {
    isActivating.value = false;
  }
};

const handleRegister = async (): Promise<void> => {
  if (!deviceToken.value) {
    toast.add({ title: 'Brak tokena', description: 'Najpierw aktywuj powiadomienia', color: 'warning' });
    return;
  }
  if (!isReady.value) {
    toast.add({ title: 'Brak dostępu', description: 'Zaloguj się, aby zarejestrować', color: 'warning' });
    return;
  }
  console.log("deviceToken.value", deviceToken.value);

  try {
    const res = await registerToken(deviceToken.value);
    if (!res.ok) throw new Error(res.message);
    toast.add({ title: 'Zarejestrowano', description: 'Token zapisany', color: 'success' });
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, '1');
      window.localStorage.setItem(TOKEN_STORAGE_KEY, deviceToken.value);
      isRegistered.value = true;
    } catch { }
  } catch (error) {
    console.error(error);
    toast.add({ title: 'Błąd', description: 'Rejestracja nie powiodła się', color: 'error' });
  }
};

const handleUnregister = async (): Promise<void> => {
  if (!isReady.value) {
    toast.add({ title: 'Brak dostępu', description: 'Zaloguj się, aby wyrejestrować', color: 'warning' });
    return;
  }
  // Ensure we have a token; try to load from storage if missing
  if (!deviceToken.value) {
    try {
      const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (savedToken) deviceToken.value = savedToken;
    } catch { }
  }
  if (!deviceToken.value) {
    toast.add({ title: 'Brak tokena', description: 'Brak zapisanego tokena. Aktywuj powiadomienia, aby pobrać token.', color: 'warning' });
    return;
  }
  try {
    const res = await unregisterToken(deviceToken.value);
    if (!res.ok) throw new Error(res.message);
    toast.add({ title: 'Wyrejestrowano', description: 'Token usunięty', color: 'success' });
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      isRegistered.value = false;
      deviceToken.value = null;
    } catch { }
  } catch (error) {
    console.error(error);
    toast.add({ title: 'Błąd', description: 'Wyrejestrowanie nie powiodło się', color: 'error' });
  }
};

const handleCopy = async () => {
  if (!deviceToken.value) return;
  try {
    await navigator.clipboard.writeText(deviceToken.value);
    toast.add({ title: 'Skopiowano', description: 'Token skopiowany do schowka', color: 'success' });
  } catch {
    toast.add({ title: 'Błąd', description: 'Nie udało się skopiować', color: 'error' });
  }
};
</script>
