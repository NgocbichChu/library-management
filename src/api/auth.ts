import { apiClient } from "@/api/client"
import type {
  ApiResponse,
  AuthUser,
  CreateEmployeeInput,
  LoginRequest,
  LoginResponseData,
  RegisterReaderInput,
} from "@/types/auth"

export const authApi = {
  login: (credentials: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponseData>>("/auth/login", credentials),
  registerReader: (data: RegisterReaderInput) =>
    apiClient.post<ApiResponse<unknown>>("/auth/register", data),
  createEmployee: (data: CreateEmployeeInput) =>
    apiClient.post<ApiResponse<unknown>>("/auth/create-employee", data),
  logout: () => apiClient.post<void>("/auth/logout"),
  getCurrentUser: () => apiClient.get<AuthUser>("/auth/me"),
}
