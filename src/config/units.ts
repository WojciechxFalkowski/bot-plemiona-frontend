/**
 * Base URL for unit icons from Plemiona CDN
 */
export const UNIT_ICON_BASE_URL = 'https://dspl.innogamescdn.com/asset/fc339a06/graphic/unit';

/**
 * Unit icon filenames mapping
 */
export const UNIT_ICONS: Record<string, string> = {
	spear: 'unit_spear.webp',
	sword: 'unit_sword.webp',
	axe: 'unit_axe.webp',
	archer: 'unit_archer.webp',
	spy: 'unit_spy.webp',
	light: 'unit_light.webp',
	marcher: 'unit_marcher.webp',
	heavy: 'unit_heavy.webp',
	ram: 'unit_ram.webp',
	catapult: 'unit_catapult.webp',
	knight: 'unit_knight.webp',
	snob: 'unit_snob.webp',
	militia: 'unit_militia.webp',
} as const;

/**
 * Unit display names in Polish
 */
export const UNIT_NAMES: Record<string, string> = {
	spear: 'Pikinier',
	sword: 'Miecznik',
	axe: 'Topornik',
	archer: 'Łucznik',
	spy: 'Zwiadowca',
	light: 'Lekki kawalerzysta',
	marcher: 'Łucznik na koniu',
	heavy: 'Ciężki kawalerzysta',
	ram: 'Taran',
	catapult: 'Katapulta',
	knight: 'Rycerz',
	snob: 'Szlachcic',
	militia: 'Chłop',
} as const;

/**
 * Get full URL for unit icon
 * @param unitKey - Unit key (e.g., 'spear', 'sword')
 * @returns Full URL to unit icon
 */
export function getUnitIconUrl(unitKey: string): string {
	const iconFilename = UNIT_ICONS[unitKey];
	if (!iconFilename) {
		return '';
	}
	return `${UNIT_ICON_BASE_URL}/${iconFilename}`;
}

/**
 * Get unit display name
 * @param unitKey - Unit key (e.g., 'spear', 'sword')
 * @returns Unit display name in Polish
 */
export function getUnitName(unitKey: string): string {
	return UNIT_NAMES[unitKey] || unitKey;
}

export interface UnitConfig {
	key: string;
	name: string;
	icon: string;
	category?: string;
}

export const UNITS_CONFIG: UnitConfig[] = [
	{ key: 'spear', name: UNIT_NAMES.spear, icon: getUnitIconUrl('spear'), category: 'piechota' },
	{ key: 'sword', name: UNIT_NAMES.sword, icon: getUnitIconUrl('sword'), category: 'piechota' },
	{ key: 'axe', name: UNIT_NAMES.axe, icon: getUnitIconUrl('axe'), category: 'piechota' },
	{ key: 'archer', name: UNIT_NAMES.archer, icon: getUnitIconUrl('archer'), category: 'piechota' },
	{ key: 'spy', name: UNIT_NAMES.spy, icon: getUnitIconUrl('spy'), category: 'specjalne' },
	{ key: 'light', name: UNIT_NAMES.light, icon: getUnitIconUrl('light'), category: 'kawaleria' },
	{ key: 'marcher', name: UNIT_NAMES.marcher, icon: getUnitIconUrl('marcher'), category: 'kawaleria' },
	{ key: 'heavy', name: UNIT_NAMES.heavy, icon: getUnitIconUrl('heavy'), category: 'kawaleria' },
	{ key: 'ram', name: UNIT_NAMES.ram, icon: getUnitIconUrl('ram'), category: 'oblężenie' },
	{ key: 'catapult', name: UNIT_NAMES.catapult, icon: getUnitIconUrl('catapult'), category: 'oblężenie' },
	{ key: 'knight', name: UNIT_NAMES.knight, icon: getUnitIconUrl('knight'), category: 'specjalne' },
	{ key: 'snob', name: UNIT_NAMES.snob, icon: getUnitIconUrl('snob'), category: 'specjalne' },
	{ key: 'militia', name: UNIT_NAMES.militia, icon: getUnitIconUrl('militia'), category: 'specjalne' },
];

export const UNITS_BY_CATEGORY = UNITS_CONFIG.reduce((acc, unit) => {
  const category = unit.category || 'inne';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(unit);
  return acc;
}, {} as Record<string, UnitConfig[]>);

export const UNIT_KEYS = UNITS_CONFIG.map(unit => unit.key);
