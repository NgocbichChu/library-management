export interface LoginRequest {
  email: string
  password: string
}
export interface AuthUser {
  id: string
  name: string
  email: string
}
export type AuthStatus = "unauthenticated" | "loading" | "authenticated"
