/**
 * Unit key type for army units
 */
export type UnitKey = 'spear' | 'sword' | 'axe' | 'archer' | 'spy' | 'light' | 'heavy' | 'ram' | 'catapult' | 'knight' | 'snob';

/**
 * Units object type
 */
export type UnitsRecord = Record<UnitKey, number>;

/**
 * Interface for village units data extracted from combined overview table
 */
export interface VillageUnitsData {
	villageId: string;
	name: string;
	coordinates: string;
	units: UnitsRecord;
	traders: {
		current: number;
		max: number;
	};
}

/**
 * Sort column type for army overview table
 */
export type SortColumn =
	| 'name'
	| 'coordinates'
	| 'spear'
	| 'sword'
	| 'axe'
	| 'archer'
	| 'spy'
	| 'light'
	| 'heavy'
	| 'ram'
	| 'catapult'
	| 'knight'
	| 'snob'
	| 'traders';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
	column: SortColumn | null;
	direction: SortDirection;
}

