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
  createdAt: Date;
  updatedAt: Date;
}
