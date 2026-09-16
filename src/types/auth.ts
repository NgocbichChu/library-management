export interface LoginRequest {
  email: string
  password: string
}

export type UserRole = "manager" | "reader"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  employeeCode?: string
  readerCode?: string
  position?: string
  readerType?: string
}

export type AuthStatus = "unauthenticated" | "loading" | "authenticated"
