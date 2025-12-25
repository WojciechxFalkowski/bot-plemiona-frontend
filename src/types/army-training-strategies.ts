export interface ArmyTrainingStrategy {
  id: number;
  serverId: number;
  villageId: string;
  spear: number;
  sword: number;
  axe: number;
  archer: number;
  light: number;
  marcher: number;
  heavy: number;
  ram: number;
  catapult: number;
  knight: number;
  snob: number;
  spy: number;
  is_active: boolean;
  max_total_per_unit: number | null;
  max_in_queue_per_unit_overall: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArmyTrainingStrategyDto {
  serverId: number;
  villageId: string;
  spear?: number;
  sword?: number;
  axe?: number;
  archer?: number;
  light?: number;
  marcher?: number;
  heavy?: number;
  ram?: number;
  catapult?: number;
  knight?: number;
  snob?: number;
  spy?: number;
  is_active?: boolean;
  max_total_per_unit?: number | null;
  max_in_queue_per_unit_overall?: number;
}

export interface UpdateArmyTrainingStrategyDto extends Partial<CreateArmyTrainingStrategyDto> {}

export interface ArmyTrainingStrategyFormData {
  spear: string;
  sword: string;
  axe: string;
  archer: string;
  light: string;
  marcher: string;
  heavy: string;
  ram: string;
  catapult: string;
  knight: string;
  snob: string;
  spy: string;
  is_active: boolean;
  max_total_per_unit: string; // allow empty for null
  max_in_queue_per_unit_overall: string;
}

export const EMPTY_ARMY_TRAINING_STRATEGY_FORM: ArmyTrainingStrategyFormData = {
  spear: '',
  sword: '',
  axe: '',
  archer: '',
  light: '',
  marcher: '',
  heavy: '',
  ram: '',
  catapult: '',
  knight: '',
  snob: '',
  spy: '',
  is_active: true,
  max_total_per_unit: '',
  max_in_queue_per_unit_overall: '10',
};


