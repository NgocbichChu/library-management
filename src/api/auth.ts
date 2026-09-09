import { apiClient } from "@/api/client"
import type { AuthUser, LoginRequest } from "@/types/auth"

// Proposed endpoints: adjust paths and response mapping to your backend contract.
// This starter assumes cookie authentication and a direct AuthUser response.
export const authApi = {
  login: (credentials: LoginRequest) =>
    apiClient.post<AuthUser>("/auth/login", credentials),
  logout: () => apiClient.post<void>("/auth/logout"),
  getCurrentUser: () => apiClient.get<AuthUser>("/auth/me"),
}
