export interface UnitConfig {
  key: string;
  name: string;
  icon?: string;
  category?: string;
}

export const UNITS_CONFIG: UnitConfig[] = [
  { key: 'spear', name: 'Włócznik', category: 'piechota' },
  { key: 'sword', name: 'Miecznik', category: 'piechota' },
  { key: 'axe', name: 'Topornik', category: 'piechota' },
  { key: 'archer', name: 'Łucznik', category: 'piechota' },
  { key: 'light', name: 'Lekka kawaleria', category: 'kawaleria' },
  { key: 'marcher', name: 'Łucznik konny', category: 'kawaleria' },
  { key: 'heavy', name: 'Ciężka kawaleria', category: 'kawaleria' },
  { key: 'ram', name: 'Taran', category: 'oblężenie' },
  { key: 'catapult', name: 'Katapulta', category: 'oblężenie' },
  { key: 'knight', name: 'Rycerz', category: 'specjalne' },
  { key: 'snob', name: 'Szlachcic', category: 'specjalne' },
  { key: 'spy', name: 'Szpieg', category: 'specjalne' },
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
