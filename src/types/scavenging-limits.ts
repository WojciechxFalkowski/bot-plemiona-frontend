export interface ScavengingLimit {
  id: number;
  serverId: number;
  villageId: string;
  maxSpearUnits: number | null;
  maxSwordUnits: number | null;
  maxAxeUnits: number | null;
  maxArcherUnits: number | null;
  maxLightUnits: number | null;
  maxMarcherUnits: number | null;
  maxHeavyUnits: number | null;
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

export interface CreateScavengingLimitDto {
  serverId: number;
  villageId: string;
  maxSpearUnits?: number | null;
  maxSwordUnits?: number | null;
  maxAxeUnits?: number | null;
  maxArcherUnits?: number | null;
  maxLightUnits?: number | null;
  maxMarcherUnits?: number | null;
  maxHeavyUnits?: number | null;
}

export interface UpdateScavengingLimitDto extends Partial<CreateScavengingLimitDto> {}

export interface ScavengingLimitFormData {
  serverId?: string;
  villageId: string;
  maxSpearUnits?: string;
  maxSwordUnits?: string;
  maxAxeUnits?: string;
  maxArcherUnits?: string;
  maxLightUnits?: string;
  maxMarcherUnits?: string;
  maxHeavyUnits?: string;
}

export const EMPTY_SCAVENGING_LIMIT_FORM: ScavengingLimitFormData = {
  serverId: '',
  villageId: '',
  maxSpearUnits: '',
  maxSwordUnits: '',
  maxAxeUnits: '',
  maxArcherUnits: '',
  maxLightUnits: '',
  maxMarcherUnits: '',
  maxHeavyUnits: ''
};
