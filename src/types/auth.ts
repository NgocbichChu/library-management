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
  position?: string
  readerCode?: string
}

export type UserRole = "ADMIN" | "EMPLOYEE" | "LIBRARIAN" | "READER"

export type AuthStatus = "unauthenticated" | "loading" | "authenticated"

export interface RegisterReaderInput {
  username: string
  password: string
  fullName?: string | null
  email?: string | null
  phoneNumber?: string | null
  dateOfBirth?: string | null
  address?: string | null
}

export interface CreateEmployeeInput {
  username: string
  password: string
  fullName?: string | null
  email?: string | null
  phoneNumber?: string | null
  position?: string | null
}
