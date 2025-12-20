export interface Building {
  screen: string;
  name: string;
  maxLevel: number;
  href: string;
}

export interface BuildingsResponse {
  buildings: Building[];
}

export interface AddBuildingToQueueRequest {
  villageName: string;
  buildingId: string;
  targetLevel: number;
  serverId: number;
}

export interface QueueItem {
  id: number;
  villageId: string;
  villageName: string;
  buildingId: string;
  buildingName: string;
  targetLevel: number;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildingLevels {
  main: number;
  barracks: number;
  stable: number;
  garage: number;
  church: number;
  snob: number;
  smith: number;
  place: number;
  statue: number;
  market: number;
  wood: number;
  stone: number;
  iron: number;
  farm: number;
  storage: number;
  hide: number;
  wall: number;
}

export interface BuildQueueItem {
  building: string;
  level: number;
  timeRemaining: string;
  timeRemainingSeconds: number;
}

export interface BuildingState {
  buildingId: string;
  buildingName: string;
  currentLevel: number;
  maxLevel: number;
  inQueue: boolean;
  queueLevel?: number;
}

export interface VillageBuildingStatesResponse {
  villageInfo: {
    id: string;
    name: string;
    coordinates: string;
  };
  buildingLevels: BuildingLevels;
  buildQueue: BuildQueueItem[];
  databaseQueue: Array<{
    id: number;
    buildingId: string;
    buildingName: string;
    targetLevel: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  cachedAt: string;
  isValid: boolean;
  maxLevels: Record<string, number>;
}

export interface AddBuildingToQueueFromCacheResponse {
  queueItem: QueueItem;
  databaseQueue: QueueItem[];
}
