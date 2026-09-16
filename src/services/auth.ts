import { authApi } from "@/api/auth"
import { USE_MOCK_API } from "@/api/config"
import type { AuthUser, LoginRequest } from "@/types/auth"

export interface LoginResult {
  user: AuthUser
  token: string
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResult> => {
    if (!USE_MOCK_API) {
      const response = await authApi.login(credentials)
      if (!response.success || !response.data) {
        throw new Error(response.message || "Đăng nhập không thành công.")
      }
      const data = response.data
      const user: AuthUser = {
        id: String(data.accountId),
        accountId: data.accountId,
        username: data.username,
        name: data.fullName || data.username,
        fullName: data.fullName,
        roles: Array.isArray(data.roles) ? data.roles : [],
      }
      return { user, token: data.accessToken }
    }

    const username = credentials.username.trim()
    return Promise.resolve({
      user: {
        id: "2",
        accountId: 2,
        username,
        name: username,
        fullName: null,
        roles: ["READER"],
      },
      token: "mock-access-token",
    })
  },
  logout: async (): Promise<void> => {
    if (!USE_MOCK_API) {
      try {
        await authApi.logout()
      } catch {
        // Backend might not have a logout endpoint; client-side clear is sufficient.
      }
    }
  },
}
