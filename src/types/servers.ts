export interface Server {
  id: number
  serverCode: string
  serverName: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  cookies?: ServerCookies
}

export interface ServerCookies {
  id: number
  serverId: number
  cookiesData: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateServerDto {
  id: number
  serverCode: string
  serverName: string
  isActive?: boolean
}

export interface UpdateServerDto {
  serverCode?: string
  serverName?: string
  isActive?: boolean
}

export interface UpdateServerCookiesDto {
  cookiesData: string
}

export interface ServerResponseDto {
  id: number
  serverCode: string
  serverName: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  cookies?: ServerCookies
}
