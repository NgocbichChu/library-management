import { create } from "zustand"
import { authService } from "@/services/auth"
import { withLoading } from "@/stores/use-loading-store"
import type { AuthStatus, AuthUser, LoginRequest } from "@/types/auth"

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  isLoggingOut: boolean
  login: (credentials: LoginRequest) => Promise<AuthUser>
  logout: () => Promise<void>
  clearError: () => void
}

// Ignore late responses after logout or a newer login attempt.
let operationId = 0

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "unauthenticated",
  error: null,
  isLoggingOut: false,
  clearError: () => set({ error: null }),
  login: async (credentials) => {
    const currentId = ++operationId
    set({ user: null, status: "loading", error: null, isLoggingOut: false })
    return withLoading(async () => {
      try {
        const user = await authService.login(credentials)
        if (currentId !== operationId)
          throw new Error("Yêu cầu đăng nhập đã bị hủy.")
        set({ user, status: "authenticated" })
        return user
      } catch (error) {
        if (currentId === operationId) {
          set({
            user: null,
            status: "unauthenticated",
            error: "Đăng nhập thất bại. Vui lòng thử lại.",
          })
        }
        throw error
      }
    })
  },
  logout: async () => {
    const currentId = ++operationId
    set({ isLoggingOut: true, error: null })
    await withLoading(async () => {
      try {
        await authService.logout()
      } finally {
        if (currentId === operationId) {
          set({ user: null, status: "unauthenticated", isLoggingOut: false })
        }
      }
    })
  },
}))
