import { create } from "zustand"
import { persist } from "zustand/middleware"
import { setStoredToken } from "@/api/client"
import { authService } from "@/services/auth"
import { withLoading } from "@/stores/use-loading-store"
import type { AuthStatus, AuthUser, LoginRequest } from "@/types/auth"

interface AuthState {
  user: AuthUser | null
  token: string | null
  status: AuthStatus
  error: string | null
  isLoggingOut: boolean
  login: (credentials: LoginRequest) => Promise<AuthUser>
  logout: () => Promise<void>
  clearError: () => void
}

// Ignore late responses after logout or a newer login attempt.
let operationId = 0

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: "unauthenticated",
      error: null,
      isLoggingOut: false,
      clearError: () => set({ error: null }),
      login: async (credentials) => {
        const currentId = ++operationId
        set({
          user: null,
          token: null,
          status: "loading",
          error: null,
          isLoggingOut: false,
        })
        return withLoading(async () => {
          try {
            const { user, token } = await authService.login(credentials)
            if (currentId !== operationId)
              throw new Error("Yêu cầu đăng nhập đã bị hủy.")
            setStoredToken(token)
            set({ user, token, status: "authenticated", error: null })
            return user
          } catch (error) {
            if (currentId === operationId) {
              let userFacingMessage = "Đăng nhập thất bại. Vui lòng thử lại."
              if (error instanceof Error) {
                if (error.message.includes("Invalid username or password")) {
                  userFacingMessage =
                    "Tên đăng nhập hoặc mật khẩu không chính xác."
                } else if (error.message) {
                  userFacingMessage = error.message
                }
              }
              setStoredToken(null)
              set({
                user: null,
                token: null,
                status: "unauthenticated",
                error: userFacingMessage,
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
              setStoredToken(null)
              set({
                user: null,
                token: null,
                status: "unauthenticated",
                isLoggingOut: false,
              })
            }
          }
        })
      },
    }),
    {
      name: "library_auth_session",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        status: state.status,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setStoredToken(state.token)
        } else {
          setStoredToken(null)
        }
      },
    }
  )
)
