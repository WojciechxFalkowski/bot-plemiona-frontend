export interface ScavengingLimit {
  id: number;
  serverId: number;
  villageId: string;
  maxSpearUnits: number;
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
  maxSpearUnits: number;
}

export interface UpdateScavengingLimitDto extends Partial<CreateScavengingLimitDto> {}

export interface ScavengingLimitFormData {
  serverId?: string;
  villageId: string;
  maxSpearUnits: string;
}

export const EMPTY_SCAVENGING_LIMIT_FORM: ScavengingLimitFormData = {
  serverId: '',
  villageId: '',
  maxSpearUnits: ''
};
