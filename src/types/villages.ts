export interface Village {
    id: string;
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