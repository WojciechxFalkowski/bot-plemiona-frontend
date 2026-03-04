import { ref } from 'vue'
import type { VillageUnitsData } from '@/types/army-overview'
import type {
	SendSupportFormData,
	VillageAllocation,
	AllocationResult,
	SendSupportRequest,
	SendSupportResponse
} from '@/types/send-support'
import { BACKEND_URL } from './backendUrl'

/**
 * Composable for sending support troops to a target village
 */
export function useSendSupport() {
	const loading = ref(false)
	const error = ref<string | null>(null)

	/**
	 * Validates target village ID format
	 * Village IDs are numeric (e.g., 30707 from URL target=30707)
	 * @param villageId - Village ID string to validate
	 * @returns True if valid, false otherwise
	 */
	const isValidVillageId = (villageId: string): boolean => {
		if (!villageId) return false
		const trimmed = villageId.trim()
		// Must be a positive integer
		return /^\d+$/.test(trimmed) && parseInt(trimmed, 10) > 0
	}

	/**
	 * Calculates package allocation across villages
	 * 
	 * Algorithm:
	 * 1. Sort villages by name (ascending)
	 * 2. For each village, calculate available packages based on min(spear, sword) / packageSize
	 * 3. Apply maxUnitsPerVillage constraint
	 * 4. Allocate packages until totalPackages is reached or no more villages
	 * 
	 * @param villages - Array of village units data
	 * @param formData - Form data with package settings
	 * @returns Allocation result with villages and validation status
	 */
	const calculatePackageAllocation = (
		villages: VillageUnitsData[],
		formData: SendSupportFormData
	): AllocationResult => {
		const { packageCount, units, maxUnitsPerVillage } = formData

		// Filter out units with 0 count
		const activeUnits = Object.entries(units).filter(([_, count]) => count > 0)

		// Validate inputs
		if (packageCount <= 0 || activeUnits.length === 0 || maxUnitsPerVillage <= 0) {
			return {
				allocations: [],
				isValid: false,
				totalPackagesAllocated: 0,
				missingPackages: packageCount,
				totalUnits: {}
			}
		}

		// Calculate population cost of one package
		// We use a simplified assumption that 1 unit = 1 pop for now, 
		// or we can just sum up the counts if we want to limit by raw unit count.
		// Let's use raw unit count as the maxUnitsPerVillage constraint.
		const unitsPerPackage = activeUnits.reduce((sum, [_, count]) => sum + count, 0)

		// Calculate max packages per village based on maxUnitsPerVillage constraint
		const maxPackagesPerVillage = Math.floor(maxUnitsPerVillage / unitsPerPackage)

		// Sort villages by name (ascending order: 0001, 0002, 0003, etc.)
		const sortedVillages = [...villages].sort((a, b) => a.name.localeCompare(b.name))

		let remainingPackages = packageCount
		const allocations: VillageAllocation[] = []

		for (const village of sortedVillages) {
			if (remainingPackages <= 0) break

			// Calculate available packages based on all required units
			let availablePackages = maxPackagesPerVillage;
			for (const [unit, requiredCount] of activeUnits) {
				const availableCount = (village.units as any)[unit] || 0;
				const possiblePackages = Math.floor(availableCount / requiredCount);
				availablePackages = Math.min(availablePackages, possiblePackages);
			}

			// Take what we need, up to what's available
			const packagesToTake = Math.min(availablePackages, remainingPackages)

			if (packagesToTake > 0) {
				const unitsToSend: Record<string, number> = {};
				for (const [unit, requiredCount] of activeUnits) {
					unitsToSend[unit] = packagesToTake * requiredCount;
				}

				allocations.push({
					villageName: village.name,
					villageId: village.villageId,
					coordinates: village.coordinates,
					packagesFromVillage: packagesToTake,
					unitsToSend
				})
				remainingPackages -= packagesToTake
			}
		}

		const totalPackagesAllocated = packageCount - remainingPackages

		const totalUnits: Record<string, number> = {}
		for (const allocation of allocations) {
			for (const [unit, count] of Object.entries(allocation.unitsToSend)) {
				totalUnits[unit] = (totalUnits[unit] || 0) + count;
			}
		}

		return {
			allocations,
			isValid: remainingPackages === 0,
			totalPackagesAllocated,
			missingPackages: remainingPackages,
			totalUnits
		}
	}

	/**
	 * Calculates total available packages across all villages
	 * @param villages - Array of village units data
	 * @param units - Units required per package
	 * @param maxUnitsPerVillage - Max units per village constraint
	 * @returns Total available packages
	 */
	const calculateTotalAvailablePackages = (
		villages: VillageUnitsData[],
		units: Record<string, number>,
		maxUnitsPerVillage: number
	): number => {
		const activeUnits = Object.entries(units).filter(([_, count]) => count > 0)
		if (activeUnits.length === 0 || maxUnitsPerVillage <= 0) return 0

		const unitsPerPackage = activeUnits.reduce((sum, [_, count]) => sum + count, 0)
		const maxPackagesPerVillage = Math.floor(maxUnitsPerVillage / unitsPerPackage)

		return villages.reduce((total, village) => {
			let availablePackages = maxPackagesPerVillage;
			for (const [unit, requiredCount] of activeUnits) {
				const availableCount = (village.units as any)[unit] || 0;
				const possiblePackages = Math.floor(availableCount / requiredCount);
				availablePackages = Math.min(availablePackages, possiblePackages);
			}
			return total + availablePackages
		}, 0)
	}

	/**
	 * Sends support request to backend
	 * @param serverId - Server ID
	 * @param formData - Form data
	 * @param allocationResult - Calculated allocation
	 * @returns Response from backend
	 */
	const sendSupport = async (
		serverId: number,
		formData: SendSupportFormData,
		allocationResult: AllocationResult
	): Promise<SendSupportResponse> => {
		loading.value = true
		error.value = null

		try {
			if (!isValidVillageId(formData.targetVillageId)) {
				throw new Error('Nieprawidłowe ID wioski docelowej')
			}

			const request: SendSupportRequest = {
				serverId,
				targetVillageId: parseInt(formData.targetVillageId.trim(), 10),
				allocations: allocationResult.allocations,
				totalPackages: allocationResult.totalPackagesAllocated,
				packageUnits: formData.units
			}

			const response = await fetch(`${BACKEND_URL}/api/support/send`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(request)
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
			}

			const data: SendSupportResponse = await response.json()
			return data

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas wysyłania wsparcia'
			error.value = errorMessage
			throw err
		} finally {
			loading.value = false
		}
	}

	return {
		// State
		loading,
		error,

		// Functions
		isValidVillageId,
		calculatePackageAllocation,
		calculateTotalAvailablePackages,
		sendSupport
	}
}

