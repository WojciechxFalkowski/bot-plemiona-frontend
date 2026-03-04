/**
 * Form data for sending support troops
 */
export interface SendSupportFormData {
	/** Target village ID from game URL (e.g., 30707 from target=30707) */
	targetVillageId: string;
	/** Number of packages to send */
	packageCount: number;
	/** Units per package (e.g., { spear: 100, heavy: 20 }) */
	units: Record<string, number>;
	/** Maximum units that can be taken from a single village (measured in population cost) */
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
	/** Map of units to send from this village */
	unitsToSend: Record<string, number>;
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
	/** Map of total units to send across all villages */
	totalUnits: Record<string, number>;
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
	/** Package units configuration used for calculation */
	packageUnits: Record<string, number>;
}

/**
 * Response from backend after queuing support task
 */
export interface SendSupportResponse {
	/** Unique task ID for tracking */
	taskId: string;
	/** Position in the manual task queue (1-based) */
	queuePosition: number;
	/** Estimated wait time in seconds */
	estimatedWaitTime: number;
	/** Status message */
	message: string;
	/** Total allocations queued */
	totalAllocations: number;
	/** Target village ID */
	targetVillageId: number;
}

