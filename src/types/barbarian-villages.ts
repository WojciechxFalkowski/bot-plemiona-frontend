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

export type CreateBarbarianVillageMethod = 'manual' | 'url'
