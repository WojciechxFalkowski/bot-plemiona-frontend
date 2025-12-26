/**
 * Interface for village units data extracted from combined overview table
 */
export interface VillageUnitsData {
	villageId: string;
	name: string;
	coordinates: string;
	units: {
		spear: number;      // Pikinier
		sword: number;     // Miecznik
		axe: number;       // Topornik
		archer: number;    // Łucznik (może nie być dostępny na wszystkich serwerach)
		spy: number;       // Zwiadowca
		light: number;     // Lekki kawalerzysta
		heavy: number;     // Ciężki kawalerzysta
		ram: number;       // Taran
		catapult: number;  // Katapulta
		knight: number;    // Rycerz
		snob: number;      // Szlachcic
	};
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

