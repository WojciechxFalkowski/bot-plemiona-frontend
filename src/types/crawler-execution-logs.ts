export type ExecutionStatus = 'success' | 'error'

export interface CrawlerExecutionLog {
  id: number
  serverId: number
  villageId: string | null
  title: string
  description: string | null
  status: ExecutionStatus
  startedAt: string
  endedAt: string
  createdAt: string
  updatedAt: string
  duration: number
}

export interface ExecutionLogsResponse {
  logs: CrawlerExecutionLog[]
  total: number
  page: number
  limit: number
}

export interface ExecutionLogFilters {
  serverId?: number
  status?: ExecutionStatus
  title?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export type OperationTitle = 
  | 'Construction Queue'
  | 'Scavenging'
  | 'Mini Attacks'
  | 'Player Village Attacks'
  | 'Army Training'

