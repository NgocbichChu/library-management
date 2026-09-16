import { apiClient } from "@/api/client"
import type {
  ApiResponse,
  AuthUser,
  LoginRequest,
  LoginResponseData,
} from "@/types/auth"

export const authApi = {
  login: (credentials: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponseData>>("/auth/login", credentials),
  logout: () => apiClient.post<void>("/auth/logout"),
  getCurrentUser: () => apiClient.get<AuthUser>("/auth/me"),
}
