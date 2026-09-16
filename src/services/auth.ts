import { authApi } from "@/api/auth"
import { USE_MOCK_API } from "@/api/config"
import type { AuthUser, LoginRequest } from "@/types/auth"

export const authService = {
  login: (credentials: LoginRequest): Promise<AuthUser> => {
    if (!USE_MOCK_API) return authApi.login(credentials)
    const email = credentials.email.trim().toLowerCase()
    const isManager =
      email === "manager@library.com" ||
      email.includes("admin") ||
      email.includes("manager") ||
      email.includes("emp") ||
      email.includes("thuthu")

    if (isManager) {
      return Promise.resolve({
        id: "emp-001",
        name: "Nguyễn Văn An",
        email,
        role: "manager",
        employeeCode: "EMP001",
        position: "Thủ thư trưởng / Quản lý",
      })
    }

    return Promise.resolve({
      id: "rd-001",
      name: "Trần Thị Mai",
      email,
      role: "reader",
      readerCode: "RD001",
      readerType: "STUDENT",
    })
  },
  logout: (): Promise<void> =>
    USE_MOCK_API ? Promise.resolve() : authApi.logout(),
}
