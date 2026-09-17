export type UserTypeFilter = "ALL" | "ADMIN" | "EMPLOYEE" | "READER"

export type UserStatus = "Active" | "Locked" | "Pending"

export interface AdminUserItem {
  accountId: number
  employeeId?: number
  username: string
  fullName: string | null
  email: string | null
  phoneNumber: string | null
  roles: string[]
  status: UserStatus
  userType: "ADMIN" | "EMPLOYEE" | "READER"
  code?: string
  position?: string
  dateOfBirth?: string
  address?: string
  readerType?: "Student" | "Regular"
  createdAt?: string
  lastLoginAt?: string
}

export interface GetUsersParams {
  UserType?: string
  Status?: string
  Role?: string
  PageNumber?: number
  PageSize?: number
  Keyword?: string
  SortBy?: string
  SortDirection?: string
  Skip?: number
}

export interface UpdateUserRequest {
  fullName?: string | null
  email?: string | null
  phoneNumber?: string | null
  status?: string | null
}

export interface CreateEmployeeRequest {
  username: string
  password: string
  fullName?: string | null
  email?: string | null
  phoneNumber?: string | null
  position?: string | null
}
