import { adminUsersApi } from "@/api/admin-users"
import type {
  AdminUserItem,
  CreateEmployeeRequest,
  GetUsersParams,
  UpdateUserRequest,
  UserStatus,
} from "@/types/admin-users"

export const adminUsersService = {
  // Fetch users with filters directly from DB
  getUsers: async (params?: GetUsersParams): Promise<AdminUserItem[]> => {
    const mapBackendUser = (item: Record<string, unknown>): AdminUserItem => {
      const accountId = Number(item.accountId || item.account_id || item.id || 0)
      const isEmp =
        item.userType === "EMPLOYEE" ||
        (Array.isArray(item.roles) && item.roles.includes("EMPLOYEE"))
      const userType =
        (item.userType as AdminUserItem["userType"]) ||
        (isEmp ? "EMPLOYEE" : "READER")
      const statusStr = String(
        item.accountStatus || item.userStatus || item.status || "ACTIVE"
      ).toUpperCase()
      const status: UserStatus =
        statusStr === "ACTIVE"
          ? "Active"
          : statusStr === "PENDING"
            ? "Pending"
            : "Locked"
      const roles =
        Array.isArray(item.roles) && item.roles.length > 0
          ? (item.roles as string[])
          : [userType]

      const codeStr = String(item.userCode || item.code || "")
      const codeNumMatch = codeStr.match(/\d+/)
      const parsedIdFromCode = codeNumMatch ? parseInt(codeNumMatch[0], 10) : undefined

      const readerId = item.readerId
        ? Number(item.readerId)
        : !isEmp && parsedIdFromCode && parsedIdFromCode > 0
          ? parsedIdFromCode
          : undefined

      const employeeId = item.employeeId
        ? Number(item.employeeId)
        : isEmp && parsedIdFromCode && parsedIdFromCode > 0
          ? parsedIdFromCode
          : undefined

      return {
        accountId,
        employeeId,
        readerId,
        username: String(item.username || `user_${accountId}`),
        fullName: item.fullName ? String(item.fullName) : null,
        email: item.email ? String(item.email) : null,
        phoneNumber: item.phoneNumber ? String(item.phoneNumber) : null,
        roles,
        status,
        userType,
        code: item.userCode
          ? String(item.userCode)
          : isEmp
            ? `NV-EMP-${accountId}`
            : `DG-${accountId}`,
        position: isEmp
          ? String(item.position || "Nhân viên thư viện")
          : undefined,
        readerType: !isEmp
          ? (item.readerType as "Student" | "Regular") || "Regular"
          : undefined,
        createdAt: item.createdAt
          ? new Date(String(item.createdAt)).toLocaleDateString("vi-VN")
          : undefined,
      }
    }

    try {
      const fetchedItems: Record<string, unknown>[] = []

      // If user specified UserType, query that endpoint
      if (params?.UserType && params.UserType !== "ALL") {
        const res = await adminUsersApi.getUsers(params)
        if (res?.success && res?.data?.items) {
          fetchedItems.push(...res.data.items)
        } else if (Array.isArray(res?.data)) {
          fetchedItems.push(...res.data)
        }
      } else {
        // Query employee and reader separately to avoid backend NullReferenceException on seed admin account
        const [empRes, readerRes] = await Promise.allSettled([
          adminUsersApi.getUsers({ ...params, UserType: "EMPLOYEE" }),
          adminUsersApi.getUsers({ ...params, UserType: "READER" }),
        ])

        if (
          empRes.status === "fulfilled" &&
          empRes.value?.success &&
          empRes.value?.data?.items
        ) {
          fetchedItems.push(...empRes.value.data.items)
        }
        if (
          readerRes.status === "fulfilled" &&
          readerRes.value?.success &&
          readerRes.value?.data?.items
        ) {
          fetchedItems.push(...readerRes.value.data.items)
        }
      }

      const mappedList = fetchedItems.map(mapBackendUser)

      let result = mappedList
      if (params?.UserType && params.UserType !== "ALL") {
        result = result.filter((u) => u.userType === params.UserType)
      }
      if (params?.Status && params.Status !== "ALL") {
        result = result.filter((u) => u.status === params.Status)
      }
      if (params?.Keyword && params.Keyword.trim()) {
        const kw = params.Keyword.trim().toLowerCase()
        result = result.filter(
          (u) =>
            u.username.toLowerCase().includes(kw) ||
            (u.fullName && u.fullName.toLowerCase().includes(kw)) ||
            (u.email && u.email.toLowerCase().includes(kw)) ||
            (u.code && u.code.toLowerCase().includes(kw))
        )
      }

      return result
    } catch (err) {
      console.error("Failed to load users from DB:", err)
      return []
    }
  },

  // Create an employee account
  createEmployee: async (data: CreateEmployeeRequest): Promise<void> => {
    await adminUsersApi.createEmployee(data)
  },

  // Update user profile
  updateUser: async (
    accountId: number,
    data: UpdateUserRequest
  ): Promise<void> => {
    await adminUsersApi.updateUser(accountId, data)
  },

  // Delete user
  deleteUser: async (accountId: number): Promise<void> => {
    await adminUsersApi.deleteUser(accountId)
  },

  // Grant admin role to employee
  grantAdmin: async (employeeId: number): Promise<void> => {
    await adminUsersApi.grantAdmin(employeeId)
  },

  // Toggle lock user status
  toggleUserStatus: async (
    accountId: number,
    currentStatus: UserStatus
  ): Promise<void> => {
    const nextStatus = currentStatus === "Active" ? "Locked" : "Active"
    await adminUsersApi.updateUser(accountId, { status: nextStatus })
  },
}
