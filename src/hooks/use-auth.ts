import { useAuthStore } from "@/stores/use-auth-store"
import type { AuthStatus, AuthUser, LoginRequest } from "@/types/auth"

export interface UseAuthReturn {
  user: AuthUser | null
  token: string | null
  status: AuthStatus
  isAuthenticated: boolean
  roles: string[]
  isAdmin: boolean
  isLibrarian: boolean
  isManager: boolean
  isReader: boolean
  hasRole: (role: string) => boolean
  error: string | null
  isLoggingOut: boolean
  login: (credentials: LoginRequest) => Promise<AuthUser>
  logout: () => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const clearError = useAuthStore((state) => state.clearError)

  const isAuthenticated = Boolean(user && status === "authenticated")
  const roles = user?.roles ?? []
  const hasRole = (role: string) =>
    roles.some((r) => r.toUpperCase() === role.toUpperCase())
  const isAdmin = hasRole("ADMIN")
  const isLibrarian = hasRole("LIBRARIAN") || hasRole("EMPLOYEE")
  const isManager = isAdmin || isLibrarian
  const isReader = hasRole("READER")

  return {
    user,
    token,
    status,
    isAuthenticated,
    roles,
    isAdmin,
    isLibrarian,
    isManager,
    isReader,
    hasRole,
    error,
    isLoggingOut,
    login,
    logout,
    clearError,
  }
}
