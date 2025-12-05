export interface BarbarianVillage {
  target: string
  name: string
  coordinateX: number
  coordinateY: number
  canAttack: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAndUpdateBarbarianVillageDto {
  target: string
  name: string
  coordinateX: number
  coordinateY: number
  canAttack?: boolean
}

export interface CreateBarbarianVillageFromUrlDto {
  url: string
}

export interface CreateBarbarianVillagesBulkFromUrlDto {
  urls: string[]
  serverId: number
  villageId: string
}

export type CreateBarbarianVillageMethod = 'manual' | 'url'
