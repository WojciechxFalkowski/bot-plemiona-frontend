export interface Village {
    id: string;
    serverId: number;
    name: string;
    coordinates: string;
    isAutoBuildEnabled: boolean;
    isAutoScavengingEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface VillageToggleResponse {
    id: string;
    isAutoBuildEnabled?: boolean;
    isAutoScavengingEnabled?: boolean;
}
