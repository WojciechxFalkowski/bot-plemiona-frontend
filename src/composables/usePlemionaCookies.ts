import { ref, readonly } from 'vue'
import type {
  PlemionaCookie,
  PlemionaCookieResponse,
  UpdatePlemionaCookiesDto
} from '@/types/plemiona-cookies'
import { BACKEND_URL } from './backendUrl'

export function usePlemionaCookies() {
  const cookies = ref<PlemionaCookieResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getCookies = async (): Promise<PlemionaCookieResponse[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/plemiona-cookies`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PlemionaCookieResponse[] = await response.json()
      cookies.value = data

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania cookies'
      error.value = errorMessage
      console.error('Error fetching plemiona cookies:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCookies = async (cookiesData: PlemionaCookie[]): Promise<PlemionaCookieResponse[]> => {
    loading.value = true
    error.value = null

    try {
      const updateDto: UpdatePlemionaCookiesDto = {
        cookies: cookiesData
      }

      const response = await fetch(`${BACKEND_URL}/api/plemiona-cookies`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDto)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const updatedCookies: PlemionaCookieResponse[] = await response.json()
      cookies.value = updatedCookies

      return updatedCookies
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas aktualizacji cookies'
      error.value = errorMessage
      console.error('Error updating plemiona cookies:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCookies = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${BACKEND_URL}/api/plemiona-cookies`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      cookies.value = []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania cookies'
      error.value = errorMessage
      console.error('Error deleting plemiona cookies:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    cookies: readonly(cookies),
    loading: readonly(loading),
    error: readonly(error),
    getCookies,
    updateCookies,
    deleteCookies,
    clearError
  }
}
