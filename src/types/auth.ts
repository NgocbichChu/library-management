export interface LoginRequest {
  username: string
  password: string
}

export interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
  errors?: string[]
  traceId?: string
  timestamp?: string
}

export interface LoginResponseData {
  accountId: number
  username: string
  fullName: string | null
  roles: string[]
  accessToken: string
  refreshToken: string | null
  expiresAt: string
}

export interface AuthUser {
  id: string
  accountId: number
  username: string
  name: string
  fullName: string | null
  roles: string[]
  email?: string
}

export type AuthStatus = "unauthenticated" | "loading" | "authenticated"
