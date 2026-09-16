import { authApi } from "@/api/auth"
import { USE_MOCK_API } from "@/api/config"
import type { AuthUser, LoginRequest } from "@/types/auth"

export interface LoginResult {
  user: AuthUser
  token: string
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResult> => {
    // Dedicated manager demo accounts for testing role-based access
    if (
      credentials.username === "thuthu_mai" &&
      credentials.password === "12345678"
    ) {
      return {
        user: {
          id: "101",
          accountId: 101,
          username: "thuthu_mai",
          name: "Mai Thị Phương (Thủ thư)",
          fullName: "Mai Thị Phương",
          roles: ["LIBRARIAN", "EMPLOYEE"],
          email: "thuthu_mai@library.local",
        },
        token: "mock-jwt-librarian-token",
      }
    }

    if (
      credentials.username === "admin_toan" &&
      credentials.password === "12345678"
    ) {
      return {
        user: {
          id: "1",
          accountId: 1,
          username: "admin_toan",
          name: "Nguyễn Toàn (Quản trị viên)",
          fullName: "Nguyễn Toàn",
          roles: ["ADMIN", "LIBRARIAN"],
          email: "admin_toan@library.local",
        },
        token: "mock-jwt-admin-token",
      }
    }

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
