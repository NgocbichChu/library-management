import { adminUsersApi } from "@/api/admin-users"
import type {
  AdminUserItem,
  CreateEmployeeRequest,
  GetUsersParams,
  UpdateUserRequest,
  UserStatus,
} from "@/types/admin-users"

const INITIAL_USERS: AdminUserItem[] = [
  {
    accountId: 1,
    username: "admin",
    fullName: "Nguyễn Toàn (Quản trị viên)",
    email: "admin@library.local",
    phoneNumber: "0901112233",
    roles: ["ADMIN"],
    status: "Active",
    userType: "ADMIN",
    code: "NV-ADM-01",
    position: "Trưởng phòng Quản trị Thư viện",
    createdAt: "01/01/2024",
  },
  {
    accountId: 101,
    username: "thuthu",
    fullName: "Mai Thị Phương (Thủ thư chính)",
    email: "thuthu@library.local",
    phoneNumber: "0988776655",
    roles: ["LIBRARIAN", "EMPLOYEE"],
    status: "Active",
    userType: "EMPLOYEE",
    code: "NV-LIB-02",
    position: "Thủ thư phụ trách kho sách & mượn trả",
    createdAt: "15/01/2024",
  },
  {
    accountId: 102,
    username: "thuthu_dung",
    fullName: "Trần Anh Dũng (Nhân viên thư viện)",
    email: "dung.tran@library.local",
    phoneNumber: "0977223344",
    roles: ["EMPLOYEE"],
    status: "Active",
    userType: "EMPLOYEE",
    code: "NV-LIB-03",
    position: "Nhân viên tiếp nhận độc giả và cấp thẻ",
    createdAt: "01/03/2024",
  },
  {
    accountId: 201,
    username: "docgia_an",
    fullName: "Lê Hoàng An (Sinh viên)",
    email: "an.le@student.edu.vn",
    phoneNumber: "0912345678",
    roles: ["READER"],
    status: "Active",
    userType: "READER",
    code: "079201004567",
    readerType: "Student",
    address: "Ký túc xá Khu B, ĐHQG TP.HCM",
    createdAt: "10/02/2024",
  },
  {
    accountId: 202,
    username: "docgia_bich",
    fullName: "Ngô Thị Bích (Độc giả ngoài)",
    email: "bich.ngo@gmail.com",
    phoneNumber: "0934567890",
    roles: ["READER"],
    status: "Active",
    userType: "READER",
    code: "079203009876",
    readerType: "Regular",
    address: "123 Cách Mạng Tháng 8, Q.3, TP.HCM",
    createdAt: "12/03/2024",
  },
  {
    accountId: 203,
    username: "docgia_khoa",
    fullName: "Võ Đăng Khoa (Sinh viên)",
    email: "khoa.vo@student.edu.vn",
    phoneNumber: "0966778899",
    roles: ["READER"],
    status: "Pending",
    userType: "READER",
    code: "079202001122",
    readerType: "Student",
    address: "Khu B6, ĐH Bách Khoa",
    createdAt: "15/09/2024",
  },
]

let usersStore: AdminUserItem[] = [...INITIAL_USERS]

export const adminUsersService = {
  // Fetch users with filters
  getUsers: async (params?: GetUsersParams): Promise<AdminUserItem[]> => {
    const mapBackendUser = (item: Record<string, unknown>): AdminUserItem => {
      const accountId = Number(item.accountId || item.account_id)
      const isEmp =
        item.userType === "EMPLOYEE" ||
        (Array.isArray(item.roles) && item.roles.includes("EMPLOYEE"))
      const userType =
        (item.userType as AdminUserItem["userType"]) ||
        (isEmp ? "EMPLOYEE" : "READER")
      const statusStr = String(
        item.accountStatus || item.userStatus || "ACTIVE"
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

      return {
        accountId,
        employeeId: item.employeeId ? Number(item.employeeId) : undefined,
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
          ? String(item.position || "Thủ thư thư viện")
          : undefined,
        readerType: !isEmp
          ? (item.readerType as "Student" | "Regular") || "Student"
          : undefined,
        createdAt: item.createdAt
          ? new Date(String(item.createdAt)).toLocaleDateString("vi-VN")
          : undefined,
      }
    }

    try {
      const fetchedItems: Record<string, unknown>[] = []

      if (params?.UserType === "EMPLOYEE") {
        const res = await adminUsersApi.getUsers({
          ...params,
          UserType: "EMPLOYEE",
        })
        if (res?.success && res?.data?.items) {
          fetchedItems.push(...res.data.items)
        }
      } else if (params?.UserType === "READER") {
        const res = await adminUsersApi.getUsers({
          ...params,
          UserType: "READER",
        })
        if (res?.success && res?.data?.items) {
          fetchedItems.push(...res.data.items)
        }
      } else {
        // Query both EMPLOYEE and READER from backend to avoid 500 when UserType is missing
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

      if (fetchedItems.length > 0) {
        const mappedList = fetchedItems.map(mapBackendUser)

        // Ensure default admin user is present if viewing ALL or ADMIN
        if (
          params?.UserType === "ALL" ||
          params?.UserType === "ADMIN" ||
          !params?.UserType
        ) {
          const hasAdmin = mappedList.some(
            (u) => u.username === "admin" || u.roles.includes("ADMIN")
          )
          if (!hasAdmin) {
            mappedList.unshift(usersStore[0])
          }
        }

        let result = mappedList
        if (params?.UserType === "ADMIN") {
          result = result.filter(
            (u) => u.roles.includes("ADMIN") || u.userType === "ADMIN"
          )
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
              (u.code && u.code.toLowerCase().includes(kw)) ||
              (u.phoneNumber && u.phoneNumber.includes(kw))
          )
        }
        return result
      }
    } catch {
      // Fallback
    }

    // Filter local store
    let filtered = [...usersStore]
    if (params?.UserType && params.UserType !== "ALL") {
      filtered = filtered.filter((u) => u.userType === params.UserType)
    }
    if (params?.Status && params.Status !== "ALL") {
      filtered = filtered.filter((u) => u.status === params.Status)
    }
    if (params?.Keyword && params.Keyword.trim()) {
      const kw = params.Keyword.trim().toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(kw) ||
          (u.fullName && u.fullName.toLowerCase().includes(kw)) ||
          (u.email && u.email.toLowerCase().includes(kw)) ||
          (u.code && u.code.toLowerCase().includes(kw)) ||
          (u.phoneNumber && u.phoneNumber.includes(kw))
      )
    }
    return filtered
  },

  // Get user by code (CCCD or Employee code)
  getByCode: async (code: string): Promise<AdminUserItem | null> => {
    try {
      const response = await adminUsersApi.getByCode(code)
      if (response?.success && response?.data) {
        return response.data
      }
    } catch {
      // Fallback
    }
    return usersStore.find((u) => u.code === code) || null
  },

  // Create Employee (Admin only)
  createEmployee: async (
    data: CreateEmployeeRequest
  ): Promise<AdminUserItem> => {
    try {
      await adminUsersApi.createEmployee(data)
    } catch {
      // Fallback
    }

    const newId = Date.now()
    const newEmployee: AdminUserItem = {
      accountId: newId,
      username: data.username,
      fullName: data.fullName || data.username,
      email: data.email || null,
      phoneNumber: data.phoneNumber || null,
      roles: ["EMPLOYEE"],
      status: "Active",
      userType: "EMPLOYEE",
      code: `NV-EMP-${String(newId).slice(-4)}`,
      position: data.position || "Nhân viên thư viện",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    }

    usersStore = [newEmployee, ...usersStore]
    return newEmployee
  },

  // Update user info
  updateUser: async (
    accountId: number | string,
    data: UpdateUserRequest
  ): Promise<AdminUserItem> => {
    try {
      await adminUsersApi.updateUser(accountId, data)
    } catch {
      // Fallback
    }

    const idNum = Number(accountId)
    usersStore = usersStore.map((u) => {
      if (u.accountId === idNum) {
        return {
          ...u,
          fullName: data.fullName !== undefined ? data.fullName : u.fullName,
          email: data.email !== undefined ? data.email : u.email,
          phoneNumber:
            data.phoneNumber !== undefined ? data.phoneNumber : u.phoneNumber,
          status:
            data.status !== undefined
              ? (data.status as AdminUserItem["status"])
              : u.status,
        }
      }
      return u
    })

    const updated = usersStore.find((u) => u.accountId === idNum)
    if (!updated) throw new Error("Không tìm thấy người dùng.")
    return updated
  },

  // Grant admin to an employee
  grantAdmin: async (employeeId: number | string): Promise<void> => {
    try {
      await adminUsersApi.grantAdmin(employeeId)
    } catch {
      // Fallback
    }

    const idNum = Number(employeeId)
    usersStore = usersStore.map((u) => {
      if (u.accountId === idNum) {
        const roles = Array.from(new Set([...u.roles, "ADMIN"]))
        return { ...u, roles, userType: "ADMIN" }
      }
      return u
    })
  },

  // Remove role
  removeRole: async (
    accountId: number | string,
    roleCode: string
  ): Promise<void> => {
    try {
      await adminUsersApi.removeRole(accountId, roleCode)
    } catch {
      // Fallback
    }

    const idNum = Number(accountId)
    usersStore = usersStore.map((u) => {
      if (u.accountId === idNum) {
        const roles = u.roles.filter((r) => r !== roleCode)
        return { ...u, roles }
      }
      return u
    })
  },

  // Delete user
  deleteUser: async (accountId: number | string): Promise<void> => {
    const idNum = Number(accountId)
    const user = usersStore.find((u) => u.accountId === idNum)
    if (!user) throw new Error("Người dùng không tồn tại.")

    // Prevent deleting main admin
    if (user.username === "admin") {
      throw new Error("Không thể xóa tài khoản Quản trị viên mặc định.")
    }

    try {
      await adminUsersApi.deleteUser(accountId)
    } catch {
      // Fallback
    }

    usersStore = usersStore.filter((u) => u.accountId !== idNum)
  },
}
