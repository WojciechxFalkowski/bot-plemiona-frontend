export type ScheduledAttackType = 'off' | 'fake' | 'nobleman' | 'support'

export type ScheduledAttackStatus = 'pending' | 'scheduled' | 'executing' | 'completed' | 'failed' | 'cancelled' | 'expired'

export interface ScheduledAttack {
  id: number
  serverId: number
  villageId?: string
  targetId: string
  sourceCoordinates: string
  targetCoordinates: string
  attackUrl: string
  attackType: ScheduledAttackType
  sendTimeFrom: Date
  sendTimeTo: Date
  status: ScheduledAttackStatus
  description?: string
  metadata?: Record<string, unknown>
  executedAt?: Date
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

export interface ImportAttackPlanDto {
  serverId: number
  rawPlan: string
  skipDuplicates?: boolean
}

export interface CreateScheduledAttackDto {
  serverId: number
  villageId: string
  targetId: string
  sourceCoordinates: string
  targetCoordinates: string
  attackUrl: string
  attackType: ScheduledAttackType
  sendTimeFrom: Date
  sendTimeTo: Date
  description?: string
  metadata?: Record<string, unknown>
}

export interface UpdateScheduledAttackDto {
  serverId?: number
  villageId?: string
  targetId?: string
  sourceCoordinates?: string
  targetCoordinates?: string
  attackUrl?: string
  attackType?: ScheduledAttackType
  sendTimeFrom?: Date
  sendTimeTo?: Date
  status?: ScheduledAttackStatus
  description?: string
  metadata?: Record<string, unknown>
}
