export interface PlayerVillage {
  id: number;
  target: string;
  serverId: number;
  villageId: string;
  name: string;
  coordinateX: number;
  coordinateY: number;
  owner: string;
  ownerId: string;
  tribe?: string;
  points: number;
  canAttack: boolean;
  lastVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  server?: {
    id: number;
    serverName: string;
    serverCode: string;
  };
}

export interface CreatePlayerVillageData {
  target: string;
  serverId: number;
  villageId: string;
  name: string;
  coordinateX: number;
  coordinateY: number;
  owner: string;
  ownerId: string;
  tribe?: string;
  points: number;
}

export interface UpdatePlayerVillageData {
  name?: string;
  owner?: string;
  ownerId?: string;
  target?: string;
  tribe?: string;
  points?: number;
  canAttack?: boolean;
}

export interface VerifyVillageData {
  owner: string;
  ownerId: string;
  tribe?: string;
  points: number;
}

export interface PlayerVillageAttackStrategy {
  id: number;
  serverId: number;
  villageId: string;
  spear: number;
  sword: number;
  axe: number;
  archer: number;
  spy: number;
  light: number;
  marcher: number;
  heavy: number;
  ram: number;
  catapult: number;
  knight: number;
  snob: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlayerVillageAttackStrategyData {
  serverId: number;
  villageId: string;
  spear?: number;
  sword?: number;
  axe?: number;
  archer?: number;
  spy?: number;
  light?: number;
  marcher?: number;
  heavy?: number;
  ram?: number;
  catapult?: number;
  knight?: number;
  snob?: number;
}

export interface UpdatePlayerVillageAttackStrategyData {
  spear?: number;
  sword?: number;
  axe?: number;
  archer?: number;
  spy?: number;
  light?: number;
  marcher?: number;
  heavy?: number;
  ram?: number;
  catapult?: number;
  knight?: number;
  snob?: number;
}
