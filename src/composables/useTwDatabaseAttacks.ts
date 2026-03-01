import { ref, readonly } from 'vue'
import { BACKEND_URL } from './backendUrl'

export interface TwDatabaseAttackDetails {
  lp: string | null
  etykietaAtaku: string | null
  dataWyjsciaOd: string | null
  dataWyjsciaDo: string | null
  wioskaWysylajaca: string | null
  wioskaDocelowa: string | null
  atakowanyGracz: string | null
  dataDotarcia: string | null
  czasDoWysylki: string | null
  akcjaUrl: string | null
  attackType: string | null
}

export interface TwDatabaseAttack {
  id: number
  fingerprint: string
  status: 'pending' | 'sent' | 'failed'
  sentAt: string | null
  failureReason: string | null
  clearedFromTwDatabase: boolean
  createdAt: string
  details: TwDatabaseAttackDetails
}

export function useTwDatabaseAttacks() {
  const attacks = ref<TwDatabaseAttack[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadAttacks = async (serverId: number, status?: 'pending' | 'sent' | 'failed'): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({ serverId: serverId.toString() })
      if (status) params.append('status', status)

      const response = await fetch(`${BACKEND_URL}/api/tw-database/attacks?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success && result.data) {
        attacks.value = result.data
      } else {
        attacks.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Nie udało się pobrać ataków'
      attacks.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    attacks: readonly(attacks),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadAttacks
  }
}
