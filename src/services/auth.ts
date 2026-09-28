import { authApi } from "@/api/auth"
import type {
  AuthUser,
  CreateEmployeeInput,
  LoginRequest,
  RegisterReaderInput,
} from "@/types/auth"

export interface LoginResult {
  user: AuthUser
  token: string
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResult> => {
    const response = await authApi.login(credentials)
    if (response?.success && response?.data) {
      const data = response.data
      const user: AuthUser = {
        id: String(data.accountId),
        accountId: data.accountId,
        username: data.username,
        name: data.fullName || data.username,
        fullName: data.fullName,
        roles:
          Array.isArray(data.roles) && data.roles.length > 0
            ? data.roles
            : ["READER"],
      }
      return { user, token: data.accessToken }
    }
    throw new Error(response?.message || "Đăng nhập không thành công.")
  },

  registerReader: async (input: RegisterReaderInput): Promise<void> => {
    const res = await authApi.registerReader({
      username: input.username,
      password: input.password,
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      address: input.address,
    })
    if (!res || !res.success) {
      throw new Error(res?.message || "Không thể đăng ký tài khoản độc giả.")
    }
  },

  createEmployee: async (input: CreateEmployeeInput): Promise<void> => {
    const res = await authApi.createEmployee({
      username: input.username,
      password: input.password,
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      position: input.position || "Thủ thư",
    })
    if (!res || !res.success) {
      throw new Error(res?.message || "Không thể tạo tài khoản nhân viên.")
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.logout()
    } catch {
      // Ignore errors on logout
    }
  },
}
