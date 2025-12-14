export interface PlemionaCookie {
  name: string
  path: string
  value: string
  domain: string
}

export interface PlemionaCookieResponse {
  id: number
  name: string
  path: string
  value: string
  domain: string
  createdAt: Date
  updatedAt: Date
}

export interface UpdatePlemionaCookiesDto {
  cookies: PlemionaCookie[]
}
