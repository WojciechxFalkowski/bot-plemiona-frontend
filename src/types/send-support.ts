/**
 * Form data for sending support troops
 */
export interface SendSupportFormData {
	/** Target village ID from game URL (e.g., 30707 from target=30707) */
	targetVillageId: string;
	/** Number of packages to send */
	packageCount: number;
	/** Units per package (e.g., 100 = 100 spearmen + 100 swordsmen) */
	packageSize: number;
	/** Maximum units that can be taken from a single village */
	maxUnitsPerVillage: number;
}

/**
 * Allocation of packages for a single village
 */
export interface VillageAllocation {
	/** Village name */
	villageName: string;
	/** Village ID */
	villageId: string;
	/** Village coordinates */
	coordinates: string;
	/** Number of packages allocated from this village */
	packagesFromVillage: number;
	/** Number of spearmen to send from this village */
	spearToSend: number;
	/** Number of swordsmen to send from this village */
	swordToSend: number;
}

/**
 * Result of package allocation calculation
 */
export interface AllocationResult {
	/** Array of village allocations */
	allocations: VillageAllocation[];
	/** Whether all packages can be fulfilled */
	isValid: boolean;
	/** Total packages that were allocated */
	totalPackagesAllocated: number;
	/** Number of packages that couldn't be allocated */
	missingPackages: number;
	/** Total spearmen to send */
	totalSpear: number;
	/** Total swordsmen to send */
	totalSword: number;
}

/**
 * Request DTO for sending support to backend
 */
export interface SendSupportRequest {
	/** Server ID */
	serverId: number;
	/** Target village ID from game URL (e.g., 30707) */
	targetVillageId: number;
	/** Village allocations for support */
	allocations: VillageAllocation[];
	/** Total packages being sent */
	totalPackages: number;
	/** Package size used for calculation */
	packageSize: number;
}

/**
 * Response from backend after sending support
 */
export interface SendSupportResponse {
	success: boolean;
	message: string;
	/** Number of support commands dispatched */
	dispatchedCount?: number;
}

