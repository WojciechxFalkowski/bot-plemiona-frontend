export interface AttackStrategy {
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
  next_target_index: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  server?: {
    id: number;
    serverCode: string;
    serverName: string;
    isActive: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateAttackStrategyDto {
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
  next_target_index?: number;
  is_active?: boolean;
}

export interface UpdateAttackStrategyDto extends Partial<CreateAttackStrategyDto> {
  id: number;
}

export interface AttackStrategyFormData {
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
  next_target_index: string;
}

export const EMPTY_ATTACK_STRATEGY_FORM: AttackStrategyFormData = {
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
  next_target_index: '',
};
