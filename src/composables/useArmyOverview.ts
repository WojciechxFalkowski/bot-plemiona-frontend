import { ref, computed, onUnmounted } from 'vue'
import type { VillageUnitsData } from '@/types/army-overview'
import { useSnackbar } from 'vue3-snackbar'
import { BACKEND_URL } from './backendUrl'

const CACHE_TTL = 1000 * 60 * 5 // 5 minut
const AUTO_REFRESH_INTERVAL = 1000 * 60 * 5 // 5 minut

/**
 * Composable for fetching and managing village units data
 */
export function useArmyOverview() {
	const villageUnits = ref<VillageUnitsData[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)
	const totalCount = ref(0)
	const cachedAt = ref<Date | null>(null)
	const autoRefreshIntervalId = ref<NodeJS.Timeout | null>(null)
	const currentServerId = ref<number | null>(null)
	const isAutoRefresh = ref(false)

	const snackbar = useSnackbar()

	/**
	 * Checks if cached data is still valid
	 */
	const isCacheValid = computed(() => {
		if (!cachedAt.value) return false
		const now = new Date()
		const cacheAge = now.getTime() - cachedAt.value.getTime()
		return cacheAge < CACHE_TTL
	})

	/**
	 * Fetches village units data for a specific server
	 * @param serverId - Server ID
	 * @param forceRefresh - Force refresh even if cache is valid
	 */
	const fetchVillageUnits = async (serverId: number, forceRefresh: boolean = false): Promise<void> => {
		// If cache is valid and not forcing refresh, don't fetch (use cache)
		if (!forceRefresh && isCacheValid.value && villageUnits.value.length > 0) {
			// Show info message that cache is being used
			if (!isAutoRefresh.value) {
				snackbar.add({
					type: 'success',
					text: `Używane są dane z cache (aktualne przez najbliższe 5 minut)`
				})
			}
			return
		}

		loading.value = true
		error.value = null

		try {
			// Add forceRefresh query parameter to backend URL
			const url = `${BACKEND_URL}/api/scavenging/village-units/${serverId}?forceRefresh=${forceRefresh}`

			const response = await fetch(url)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data: VillageUnitsData[] = await response.json()

			villageUnits.value = data
			totalCount.value = data.length
			cachedAt.value = new Date()
			currentServerId.value = serverId

			// Show success message only if not auto-refresh
			if (!isAutoRefresh.value) {
				const message = forceRefresh 
					? `Pobrano świeże dane o jednostkach z ${data.length} wiosek`
					: `Pobrano dane o jednostkach z ${data.length} wiosek`
				snackbar.add({
					type: 'success',
					text: message
				})
			}

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania danych o jednostkach'
			error.value = errorMessage

			// Show error message only if not auto-refresh
			if (!isAutoRefresh.value) {
				snackbar.add({
					type: 'error',
					text: `Nie udało się pobrać danych o jednostkach: ${errorMessage}`
				})
			}

			console.error('Error fetching village units:', err)
		} finally {
			loading.value = false
		}
	}

	/**
	 * Refreshes village units data (force refresh)
	 * @param serverId - Server ID
	 */
	const refreshVillageUnits = async (serverId: number): Promise<void> => {
		await fetchVillageUnits(serverId, true)
	}

	/**
	 * Starts automatic refresh interval
	 * @param serverId - Server ID
	 */
	const startAutoRefresh = (serverId: number): void => {
		stopAutoRefresh()
		currentServerId.value = serverId

		autoRefreshIntervalId.value = setInterval(() => {
			if (currentServerId.value) {
				isAutoRefresh.value = true
				fetchVillageUnits(currentServerId.value, false).finally(() => {
					isAutoRefresh.value = false
				})
			}
		}, AUTO_REFRESH_INTERVAL)
	}

	/**
	 * Stops automatic refresh interval
	 */
	const stopAutoRefresh = (): void => {
		if (autoRefreshIntervalId.value) {
			clearInterval(autoRefreshIntervalId.value)
			autoRefreshIntervalId.value = null
		}
	}

	/**
	 * Clears cached data
	 */
	const clearCache = (): void => {
		villageUnits.value = []
		cachedAt.value = null
		totalCount.value = 0
		error.value = null
	}

	// Cleanup on unmount
	onUnmounted(() => {
		stopAutoRefresh()
	})

	return {
		// State
		villageUnits: computed(() => villageUnits.value),
		loading: computed(() => loading.value),
		error: computed(() => error.value),
		totalCount: computed(() => totalCount.value),
		cachedAt: computed(() => cachedAt.value),
		isCacheValid,

		// Actions
		fetchVillageUnits,
		refreshVillageUnits,
		startAutoRefresh,
		stopAutoRefresh,
		clearCache
	}
}

