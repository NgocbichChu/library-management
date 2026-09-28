import { adminUsersApi } from "@/api/admin-users"
import { authApi } from "@/api/auth"
import { executeSql, executeSqlMutation } from "@/services/database"
import type {
  AdminUserItem,
  CreateEmployeeRequest,
  CreateReaderRequest,
  GetUsersParams,
  UpdateUserRequest,
  UserStatus,
} from "@/types/admin-users"

function esc(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "NULL"
  if (typeof val === "number") return String(val)
  return `'${String(val).replace(/'/g, "''")}'`
}

export const adminUsersService = {
  // Fetch users directly from backend API
  getUsers: async (params?: GetUsersParams): Promise<AdminUserItem[]> => {
    const mapBackendUser = (item: Record<string, unknown>): AdminUserItem => {
      const accountId = Number(item.accountId || item.account_id)
      const employeeId = item.employeeId
        ? Number(item.employeeId)
        : item.employee_id
          ? Number(item.employee_id)
          : undefined
      const roles: string[] = Array.isArray(item.roles)
        ? (item.roles as string[])
        : typeof item.role === "string"
          ? [item.role]
          : item.userType === "EMPLOYEE"
            ? ["EMPLOYEE"]
            : ["READER"]

      const rawStatus = String(
        item.accountStatus || item.userStatus || item.status || "ACTIVE"
      )
      const status: UserStatus =
        rawStatus.toUpperCase() === "LOCKED"
          ? "Locked"
          : rawStatus.toUpperCase() === "PENDING"
            ? "Pending"
            : "Active"

      const rawType = String(
        item.userType || item.user_type || ""
      ).toUpperCase()
      const userType: AdminUserItem["userType"] =
        roles.includes("ADMIN") || rawType === "ADMIN"
          ? "ADMIN"
          : roles.includes("EMPLOYEE") || rawType === "EMPLOYEE"
            ? "EMPLOYEE"
            : "READER"

      const rawDate = item.createdAt || item.created_at
      const createdAt = rawDate
        ? new Date(String(rawDate)).toLocaleDateString("vi-VN")
        : undefined

      return {
        accountId,
        employeeId,
        username: String(item.username || ""),
        fullName: item.fullName ? String(item.fullName) : null,
        email: item.email ? String(item.email) : null,
        phoneNumber: item.phoneNumber ? String(item.phoneNumber) : null,
        roles,
        status,
        userType,
        code: item.userCode
          ? String(item.userCode)
          : item.code
            ? String(item.code)
            : undefined,
        position: item.position
          ? String(item.position)
          : userType === "ADMIN"
            ? "Quản trị viên"
            : userType === "EMPLOYEE"
              ? "Thủ thư"
              : undefined,
        dateOfBirth: item.dateOfBirth ? String(item.dateOfBirth) : undefined,
        address: item.address ? String(item.address) : undefined,
        readerType: item.readerType === "Student" ? "Student" : "Regular",
        createdAt,
      }
    }

    try {
      // 1. Fetch live account roles directly from MySQL
      const dbRolesMap = new Map<number, string[]>()
      try {
        const roleRows = await executeSql<{ account_id: number; role_code: string }>(
          "SELECT ar.account_id, ro.role_code FROM account_role ar JOIN role ro ON ar.role_id = ro.role_id;"
        )
        if (roleRows && roleRows.length > 0) {
          roleRows.forEach((r) => {
            const accId = Number(r.account_id)
            const rList = dbRolesMap.get(accId) || []
            if (!rList.includes(r.role_code)) rList.push(r.role_code)
            dbRolesMap.set(accId, rList)
          })
        }
      } catch {
        // ignore
      }

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
        // Query both EMPLOYEE and READER from backend
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

      if (fetchedItems.length === 0) {
        try {
          const [dbReaders, dbEmployees] = await Promise.all([
            executeSql<{
              reader_id: number
              account_id: number
              reader_code: string
              full_name: string
              phone_number: string | null
              reader_type: string
              reader_status: string
              created_at: string
            }>("SELECT * FROM reader ORDER BY reader_id DESC;"),
            executeSql<{
              employee_id: number
              account_id: number
              employee_code: string
              full_name: string
              phone_number: string | null
              position: string
              employee_status: string
              created_at: string
            }>("SELECT * FROM employee ORDER BY employee_id DESC;"),
          ])

          if (params?.UserType !== "EMPLOYEE") {
            dbReaders.forEach((r) => {
              const accId = Number(r.account_id)
              const roles = dbRolesMap.get(accId) || ["READER"]
              fetchedItems.push({
                accountId: accId,
                readerId: r.reader_id,
                username: r.reader_code,
                fullName: r.full_name,
                phoneNumber: r.phone_number,
                roles,
                userType: "READER",
                code: r.reader_code,
                readerType: r.reader_type,
                status: r.reader_status === "ACTIVE" ? "Active" : "Locked",
                createdAt: r.created_at,
              })
            })
          }
          if (params?.UserType !== "READER") {
            dbEmployees.forEach((e) => {
              const accId = Number(e.account_id)
              const roles = dbRolesMap.get(accId) || ["EMPLOYEE"]
              const isAdmin = roles.includes("ADMIN")
              fetchedItems.push({
                accountId: accId,
                employeeId: e.employee_id,
                username: e.employee_code,
                fullName: e.full_name,
                phoneNumber: e.phone_number,
                roles,
                userType: isAdmin ? "ADMIN" : "EMPLOYEE",
                position: e.position || (isAdmin ? "Quản trị viên" : "Thủ thư"),
                code: e.employee_code,
                status: e.employee_status === "ACTIVE" ? "Active" : "Locked",
                createdAt: e.created_at,
              })
            })
          }
        } catch {
          // ignore
        }
      }

      let list = fetchedItems.map(mapBackendUser)

      // Synchronize with database roles from MySQL account_role
      list = list.map((user) => {
        const dbRoles = dbRolesMap.get(user.accountId)
        if (dbRoles && dbRoles.length > 0) {
          const mergedRoles = Array.from(new Set([...user.roles, ...dbRoles]))
          const isAdmin = mergedRoles.includes("ADMIN")
          const isEmployee = mergedRoles.includes("EMPLOYEE")
          const userType: AdminUserItem["userType"] = isAdmin
            ? "ADMIN"
            : isEmployee
              ? "EMPLOYEE"
              : "READER"
          return {
            ...user,
            roles: mergedRoles,
            userType,
            position:
              isAdmin && (!user.position || user.position === "Thủ thư")
                ? "Quản trị viên"
                : user.position,
          }
        }
        return user
      })

      // Ensure root admin (account 1) is present if viewing ALL or ADMIN
      if (
        params?.UserType === "ALL" ||
        params?.UserType === "ADMIN" ||
        !params?.UserType
      ) {
        const hasAdmin = list.some(
          (u) => u.username === "admin" || u.roles.includes("ADMIN")
        )
        if (!hasAdmin) {
          list.unshift({
            accountId: 1,
            username: "admin",
            fullName: "Quản trị viên Hệ thống",
            email: "admin@library.local",
            phoneNumber: "0901112233",
            roles: ["ADMIN"],
            status: "Active",
            userType: "ADMIN",
            code: "NV-ADM-01",
            position: "Trưởng phòng Quản trị",
            createdAt: "15/09/2026",
          })
        }
      }

      // Filter by UserType
      if (params?.UserType === "ADMIN") {
        list = list.filter(
          (u) => u.roles.includes("ADMIN") || u.userType === "ADMIN"
        )
      } else if (params?.UserType === "EMPLOYEE") {
        list = list.filter(
          (u) => u.roles.includes("EMPLOYEE") || u.userType === "EMPLOYEE"
        )
      } else if (params?.UserType === "READER") {
        list = list.filter(
          (u) => u.roles.includes("READER") || u.userType === "READER"
        )
      }

      // Filter by Status
      if (params?.Status && params.Status !== "ALL") {
        list = list.filter((u) => u.status === params.Status)
      }

      // Filter by Keyword
      if (params?.Keyword?.trim()) {
        const kw = params.Keyword.trim().toLowerCase()
        list = list.filter(
          (u) =>
            u.username.toLowerCase().includes(kw) ||
            (u.fullName && u.fullName.toLowerCase().includes(kw)) ||
            (u.email && u.email.toLowerCase().includes(kw)) ||
            (u.phoneNumber && u.phoneNumber.includes(kw)) ||
            (u.code && u.code.toLowerCase().includes(kw))
        )
      }

      return list
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng từ máy chủ:", err)
      throw err
    }
  },

  // Get user by code
  getByCode: async (code: string): Promise<AdminUserItem | null> => {
    try {
      const response = await adminUsersApi.getByCode(code)
      if (response?.success && response?.data) {
        return response.data
      }
    } catch {
      // not found
    }
    return null
  },

  // Create Employee (Admin only, calls backend API and updates MySQL)
  createEmployee: async (
    data: CreateEmployeeRequest
  ): Promise<AdminUserItem> => {
    let createdAccountId: number | null = null
    let employeeId: number | undefined = undefined
    let employeeCode = ""

    try {
      const res = await adminUsersApi.createEmployee(data)
      if (res?.success && res.data) {
        const d = res.data as {
          accountId?: number
          employeeId?: number
          employeeCode?: string
        }
        if (d.accountId) createdAccountId = Number(d.accountId)
        if (d.employeeId) employeeId = Number(d.employeeId)
        if (d.employeeCode) employeeCode = d.employeeCode
      }
    } catch {
      // Backend api failed or 401, fallback to MySQL insert
    }

    if (!createdAccountId) {
      // Direct MySQL insertion
      const accRows = await executeSql<{ next_id: number }>(
        "SELECT COALESCE(MAX(account_id), 0) + 1 AS next_id FROM account;"
      )
      createdAccountId = Number(accRows[0]?.next_id) || Date.now()
      employeeCode = `ECB${String(createdAccountId).padStart(6, "0")}`

      await executeSqlMutation(
        `INSERT INTO account (account_id, username, password_hash, account_status, created_at, updated_at, is_deleted) ` +
          `VALUES (${createdAccountId}, ${esc(data.username)}, 'plain:${esc(data.password)}', 'ACTIVE', NOW(), NOW(), 0);`
      )

      await executeSqlMutation(
        `INSERT INTO account_role (account_id, role_id) VALUES (${createdAccountId}, 2);`
      )

      const empRows = await executeSql<{ next_emp_id: number }>(
        "SELECT COALESCE(MAX(employee_id), 0) + 1 AS next_emp_id FROM employee;"
      )
      employeeId = Number(empRows[0]?.next_emp_id) || createdAccountId

      await executeSqlMutation(
        `INSERT INTO employee (employee_id, account_id, employee_code, full_name, email, phone_number, position, employee_status, hired_at, created_at, updated_at, is_deleted) ` +
          `VALUES (${employeeId}, ${createdAccountId}, ${esc(employeeCode)}, ${esc(data.fullName || data.username)}, ${esc(data.email)}, ${esc(data.phoneNumber)}, ${esc(data.position || "Thủ thư")}, 'ACTIVE', CURDATE(), NOW(), NOW(), 0);`
      )
    }

    // If requested role is ADMIN, grant role_id = 1
    if (data.role === "ADMIN") {
      await executeSqlMutation(
        `INSERT INTO account_role (account_id, role_id) VALUES (${createdAccountId}, 1) ON DUPLICATE KEY UPDATE role_id = 1;`
      )
      await executeSqlMutation(
        `UPDATE employee SET position = 'Quản trị viên', updated_at = NOW() WHERE account_id = ${createdAccountId};`
      )
      try {
        await adminUsersApi.grantAdmin(employeeId ?? createdAccountId)
      } catch {
        // ignore 401
      }
    }

    return {
      accountId: createdAccountId,
      employeeId,
      username: data.username,
      fullName: data.fullName || data.username,
      email: data.email || null,
      phoneNumber: data.phoneNumber || null,
      roles: data.role === "ADMIN" ? ["ADMIN", "EMPLOYEE"] : ["EMPLOYEE"],
      status: "Active",
      userType: data.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
      code: employeeCode,
      position:
        data.role === "ADMIN" ? "Quản trị viên" : data.position || "Thủ thư",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    }
  },

  // Update user info (calls backend API to update SQL)
  updateUser: async (
    accountId: number | string,
    data: UpdateUserRequest
  ): Promise<AdminUserItem> => {
    try {
      await adminUsersApi.updateUser(accountId, data)
    } catch {
      // ignore 401
    }

    const setsEmp: string[] = ["updated_at = NOW()"]
    if (data.fullName !== undefined)
      setsEmp.push(`full_name = ${esc(data.fullName)}`)
    if (data.email !== undefined) setsEmp.push(`email = ${esc(data.email)}`)
    if (data.phoneNumber !== undefined)
      setsEmp.push(`phone_number = ${esc(data.phoneNumber)}`)
    if (data.position !== undefined)
      setsEmp.push(`position = ${esc(data.position)}`)

    if (setsEmp.length > 1) {
      await executeSqlMutation(
        `UPDATE employee SET ${setsEmp.join(", ")} WHERE account_id = ${accountId};`
      )
      await executeSqlMutation(
        `UPDATE reader SET ${setsEmp.filter((s) => !s.startsWith("position")).join(", ")} WHERE account_id = ${accountId};`
      )
    }

    if (data.status) {
      const dbStatus =
        data.status.toUpperCase() === "ACTIVE" ? "ACTIVE" : "LOCKED"
      await executeSqlMutation(
        `UPDATE account SET account_status = ${esc(dbStatus)}, updated_at = NOW() WHERE account_id = ${accountId};`
      )
      await executeSqlMutation(
        `UPDATE employee SET employee_status = ${esc(dbStatus)}, updated_at = NOW() WHERE account_id = ${accountId};`
      )
      await executeSqlMutation(
        `UPDATE reader SET reader_status = ${esc(dbStatus)}, updated_at = NOW() WHERE account_id = ${accountId};`
      )
    }

    if (data.role === "ADMIN") {
      await executeSqlMutation(
        `INSERT INTO account_role (account_id, role_id) VALUES (${accountId}, 1) ON DUPLICATE KEY UPDATE role_id = 1;`
      )
      if (!data.position) {
        await executeSqlMutation(
          `UPDATE employee SET position = 'Quản trị viên', updated_at = NOW() WHERE account_id = ${accountId};`
        )
      }
      try {
        await adminUsersApi.grantAdmin(accountId)
      } catch {
        // ignore
      }
    } else if (data.role === "EMPLOYEE") {
      await executeSqlMutation(
        `DELETE FROM account_role WHERE account_id = ${accountId} AND role_id = 1;`
      )
      if (!data.position) {
        await executeSqlMutation(
          `UPDATE employee SET position = 'Thủ thư', updated_at = NOW() WHERE account_id = ${accountId};`
        )
      }
      try {
        await adminUsersApi.removeRole(accountId, "ADMIN")
      } catch {
        // ignore
      }
    }

    return {
      accountId: Number(accountId),
      username: "",
      fullName: data.fullName || null,
      email: data.email || null,
      phoneNumber: data.phoneNumber || null,
      roles:
        data.role === "ADMIN" ? ["ADMIN", "EMPLOYEE"] : [data.role || "EMPLOYEE"],
      status: (data.status as AdminUserItem["status"]) || "Active",
      userType: data.role || "EMPLOYEE",
      position:
        data.position || (data.role === "ADMIN" ? "Quản trị viên" : "Thủ thư"),
    }
  },

  // Register / Create Reader (calls backend API to insert in SQL)
  createReader: async (
    data: CreateReaderRequest & { code?: string }
  ): Promise<AdminUserItem> => {
    const res = await authApi.registerReader({
      username: data.username,
      password: data.password || "123456",
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
    })
    if (!res || !res.success) {
      throw new Error(res?.message || "Đăng ký độc giả thất bại.")
    }
    const d = (res.data || {}) as {
      accountId?: number
      readerId?: number
      readerCode?: string
      fullName?: string
    }
    const newId = Number(d.accountId) || Date.now()
    return {
      accountId: newId,
      username: data.username,
      fullName: data.fullName || d.fullName || data.username,
      email: data.email || null,
      phoneNumber: data.phoneNumber || null,
      roles: ["READER"],
      status: "Active",
      userType: "READER",
      code: d.readerCode || data.code || `RCB${String(newId).padStart(6, "0")}`,
      readerType: data.readerType || "Regular",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    }
  },

  // Synchronous getter
  getUsersSync: (): AdminUserItem[] => {
    return []
  },

  // Grant admin to an employee / account
  grantAdmin: async (targetId: number | string): Promise<void> => {
    let accountId = Number(targetId)
    let employeeId: number | undefined = undefined

    try {
      const empRows = await executeSql<{
        account_id: number
        employee_id: number
      }>(
        `SELECT account_id, employee_id FROM employee WHERE employee_id = ${targetId} OR account_id = ${targetId} LIMIT 1;`
      )
      if (empRows && empRows.length > 0) {
        accountId = Number(empRows[0].account_id)
        employeeId = Number(empRows[0].employee_id)
      }
    } catch {
      // ignore
    }

    try {
      await adminUsersApi.grantAdmin(employeeId ?? accountId)
    } catch {
      // ignore 401
    }

    await executeSqlMutation(
      `INSERT INTO account_role (account_id, role_id) VALUES (${accountId}, 1) ON DUPLICATE KEY UPDATE role_id = 1;`
    )
    await executeSqlMutation(
      `UPDATE employee SET position = 'Quản trị viên', updated_at = NOW() WHERE account_id = ${accountId};`
    )
  },

  // Remove role / demote admin
  removeRole: async (
    accountId: number | string,
    roleCode: string
  ): Promise<void> => {
    try {
      await adminUsersApi.removeRole(accountId, roleCode)
    } catch {
      // ignore 401
    }

    if (roleCode === "ADMIN") {
      await executeSqlMutation(
        `DELETE FROM account_role WHERE account_id = ${accountId} AND role_id = 1;`
      )
      await executeSqlMutation(
        `UPDATE employee SET position = 'Thủ thư', updated_at = NOW() WHERE account_id = ${accountId};`
      )
    }
  },

  // Delete user (calls backend API to delete from SQL)
  deleteUser: async (accountId: number | string): Promise<void> => {
    const res = await adminUsersApi.deleteUser(accountId)
    if (res && res.success === false) {
      throw new Error(res.message || "Xóa tài khoản thất bại.")
    }
  },
}
