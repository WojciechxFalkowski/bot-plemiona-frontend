import { ref } from 'vue'
import type { Ref } from 'vue'
import { BACKEND_URL } from './backendUrl'
import { useAuthStore } from '@/stores/auth'

export type RegisterResult = { ok: boolean; message: string }

export function useNotifications() {
  const loadingRegister: Ref<boolean> = ref(false)
  const loadingUnregister: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const authStore = useAuthStore()

  const getJwt = async (): Promise<string | null> => {
    if (authStore.currentJwt) return authStore.currentJwt
    const token = await authStore.updateJwtFromClerk()
    return token
  }

  const registerToken = async (deviceToken: string): Promise<RegisterResult> => {
    loadingRegister.value = true
    error.value = null
    try {
      const jwt = await getJwt()
      if (!jwt) throw new Error('Missing JWT')
      const res = await fetch(`${BACKEND_URL}/api/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ token: deviceToken })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `HTTP ${res.status}`)
      }

      const data = (await res.json().catch(() => ({ message: 'OK' }))) as { message?: string }
      return { ok: true, message: data.message ?? 'OK' }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Register failed'
      error.value = msg
      return { ok: false, message: msg }
    } finally {
      loadingRegister.value = false
    }
  }

  const unregisterToken = async (deviceToken: string): Promise<RegisterResult> => {
    loadingUnregister.value = true
    error.value = null
    try {
      const jwt = await getJwt()
      if (!jwt) throw new Error('Missing JWT')

      const res = await fetch(`${BACKEND_URL}/api/notifications/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ token: deviceToken })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `HTTP ${res.status}`)
      }

      const data = (await res.json().catch(() => ({ message: 'OK' }))) as { message?: string }
      return { ok: true, message: data.message ?? 'OK' }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unregister failed'
      error.value = msg
      return { ok: false, message: msg }
    } finally {
      loadingUnregister.value = false
    }
  }

  return {
    // state
    loadingRegister,
    loadingUnregister,
    error,
    // actions
    registerToken,
    unregisterToken,
  }
}


