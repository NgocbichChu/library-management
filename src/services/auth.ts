import { authApi } from "@/api/auth"
import { USE_MOCK_API } from "@/api/config"
import type { AuthUser, LoginRequest } from "@/types/auth"

export const authService = {
  login: (credentials: LoginRequest): Promise<AuthUser> => {
    if (!USE_MOCK_API) return authApi.login(credentials)
    const email = credentials.email.trim().toLowerCase()
    return Promise.resolve({
      id: "demo-user",
      name: email.split("@")[0] || "Người dùng",
      email,
    })
  },
  logout: (): Promise<void> =>
    USE_MOCK_API ? Promise.resolve() : authApi.logout(),
}
