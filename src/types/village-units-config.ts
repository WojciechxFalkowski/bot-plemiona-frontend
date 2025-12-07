export type ScavengingUnit = 'spear' | 'sword' | 'axe' | 'archer' | 'light' | 'marcher' | 'heavy';

export interface ScavengingUnitsConfig {
  spear: boolean;
  sword: boolean;
  axe: boolean;
  archer: boolean;
  light: boolean;
  marcher: boolean;
  heavy: boolean;
}

export interface VillageUnitsConfig {
  villageId: string;
  villageName: string;
  serverId: number;
  isAutoScavengingEnabled: boolean;
  units: ScavengingUnitsConfig;
}

