import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/types/auth"
import type {
  AdminUserItem,
  CreateEmployeeRequest,
  GetUsersParams,
  UpdateUserRequest,
} from "@/types/admin-users"

export const adminUsersApi = {
  // GET /api/admin/users
  getUsers: (params?: GetUsersParams) => {
    const query = new URLSearchParams()
    if (params?.UserType && (params.UserType === "EMPLOYEE" || params.UserType === "READER")) {
      query.set("UserType", params.UserType)
    }
    if (params?.Status && params.Status !== "ALL")
      query.set("Status", params.Status)
    if (params?.Role && params.Role !== "ALL")
      query.set("Role", params.Role)
    if (params?.Keyword) query.set("Keyword", params.Keyword)
    if (params?.PageNumber) query.set("PageNumber", String(params.PageNumber))
    if (params?.PageSize) query.set("PageSize", String(params.PageSize))
    if (params?.SortBy) query.set("SortBy", params.SortBy)
    if (params?.SortDirection)
      query.set("SortDirection", params.SortDirection)

    const queryString = query.toString()
    const path = queryString ? `/admin/users?${queryString}` : "/admin/users"
    return apiClient.get<ApiResponse<{ items?: Record<string, unknown>[]; totalRecords?: number }>>(
      path
    )
  },

  // GET /api/admin/users/code/{code}
  getByCode: (code: string) =>
    apiClient.get<ApiResponse<AdminUserItem>>(`/admin/users/code/${encodeURIComponent(code)}`),

  // PUT /api/admin/users/{accountId}
  updateUser: (accountId: number | string, data: UpdateUserRequest) =>
    apiClient.put<ApiResponse<unknown>>(`/admin/users/${accountId}`, data),

  // DELETE /api/admin/users/{accountId}
  deleteUser: (accountId: number | string) =>
    apiClient.delete<ApiResponse<unknown>>(`/admin/users/${accountId}`),

  // DELETE /api/admin/users/{accountId}/roles/{roleCode}
  removeRole: (accountId: number | string, roleCode: string) =>
    apiClient.delete<ApiResponse<unknown>>(
      `/admin/users/${accountId}/roles/${encodeURIComponent(roleCode)}`
    ),

  // POST /api/admin/users/{employeeId}/grant-admin
  grantAdmin: (employeeId: number | string) =>
    apiClient.post<ApiResponse<unknown>>(`/admin/users/${employeeId}/grant-admin`),

  // POST /api/auth/create-employee
  createEmployee: (data: CreateEmployeeRequest) =>
    apiClient.post<ApiResponse<unknown>>("/auth/create-employee", data),
}
