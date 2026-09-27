import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  Lock,
  Pencil,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { AppDialog } from "@/components/common/app-dialog"
import {
  CommonTable,
  type CommonTableColumn,
} from "@/components/common/common-table"
import { UserAvatar } from "@/components/common/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminUsersService } from "@/services/admin-users"
import type {
  AdminUserItem,
  CreateEmployeeRequest,
  UpdateUserRequest,
  UserStatus,
  UserTypeFilter,
} from "@/types/admin-users"

export function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<UserTypeFilter>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Modals state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AdminUserItem | null>(null)

  // Form state: Add Employee
  const [empUsername, setEmpUsername] = useState("")
  const [empPassword, setEmpPassword] = useState("")
  const [empFullName, setEmpFullName] = useState("")
  const [empEmail, setEmpEmail] = useState("")
  const [empPhone, setEmpPhone] = useState("")
  const [empPosition, setEmpPosition] = useState("Thủ thư mượn trả")
  const [submittingEmp, setSubmittingEmp] = useState(false)

  // Form state: Edit User
  const [editFullName, setEditFullName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editStatus, setEditStatus] = useState<UserStatus>("Active")
  const [submittingEdit, setSubmittingEdit] = useState(false)

  const refreshUsers = async () => {
    setLoading(true)
    try {
      const data = await adminUsersService.getUsers({
        UserType: typeFilter,
        Status: statusFilter,
        Keyword: searchQuery,
      })
      setUsers(data)
    } catch {
      toast.error("Không thể tải danh sách người dùng.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    adminUsersService
      .getUsers({
        UserType: typeFilter,
        Status: statusFilter,
        Keyword: searchQuery,
      })
      .then((data) => {
        if (!ignore) {
          setUsers(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Không thể tải danh sách người dùng.")
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [typeFilter, statusFilter, searchQuery])

  // Statistics
  const stats = useMemo(() => {
    const total = users.length
    const adminCount = users.filter(
      (u) => u.roles.includes("ADMIN") || u.userType === "ADMIN"
    ).length
    const employeeCount = users.filter(
      (u) =>
        u.userType === "EMPLOYEE" ||
        u.roles.includes("EMPLOYEE") ||
        u.roles.includes("LIBRARIAN")
    ).length
    const readerCount = users.filter(
      (u) => u.userType === "READER" || u.roles.includes("READER")
    ).length
    return { total, adminCount, employeeCount, readerCount }
  }, [users])

  // Filtered & Paginated
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchType =
        typeFilter === "ALL"
          ? true
          : typeFilter === "ADMIN"
            ? user.roles.includes("ADMIN") || user.userType === "ADMIN"
            : typeFilter === "EMPLOYEE"
              ? user.roles.includes("EMPLOYEE") ||
                user.roles.includes("LIBRARIAN") ||
                user.userType === "EMPLOYEE"
              : user.roles.includes("READER") || user.userType === "READER"

      const matchStatus =
        statusFilter === "ALL" ? true : user.status === statusFilter

      const q = searchQuery.trim().toLowerCase()
      const matchSearch =
        !q ||
        user.username.toLowerCase().includes(q) ||
        (user.fullName && user.fullName.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.code && user.code.toLowerCase().includes(q)) ||
        (user.phoneNumber && user.phoneNumber.includes(q))

      return matchType && matchStatus && matchSearch
    })
  }, [users, typeFilter, statusFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  // Actions
  const handleOpenAddEmployee = () => {
    setEmpUsername("")
    setEmpPassword("")
    setEmpFullName("")
    setEmpEmail("")
    setEmpPhone("")
    setEmpPosition("Thủ thư mượn trả")
    setIsAddEmployeeOpen(true)
  }

  const handleCreateEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empUsername.trim() || !empPassword.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập và mật khẩu.")
      return
    }
    setSubmittingEmp(true)
    try {
      const payload: CreateEmployeeRequest = {
        username: empUsername.trim(),
        password: empPassword,
        fullName: empFullName.trim() || undefined,
        email: empEmail.trim() || undefined,
        phoneNumber: empPhone.trim() || undefined,
        position: empPosition.trim() || undefined,
      }
      await adminUsersService.createEmployee(payload)
      toast.success(`Đã thêm nhân viên "${empUsername.trim()}" thành công.`)
      setIsAddEmployeeOpen(false)
      refreshUsers()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Thêm nhân viên thất bại."
      )
    } finally {
      setSubmittingEmp(false)
    }
  }

  const handleOpenEdit = (user: AdminUserItem) => {
    setEditingUser(user)
    setEditFullName(user.fullName || "")
    setEditEmail(user.email || "")
    setEditPhone(user.phoneNumber || "")
    setEditStatus(user.status)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setSubmittingEdit(true)
    try {
      const payload: UpdateUserRequest = {
        fullName: editFullName.trim() || null,
        email: editEmail.trim() || null,
        phoneNumber: editPhone.trim() || null,
        status: editStatus,
      }
      await adminUsersService.updateUser(editingUser.accountId, payload)
      toast.success("Cập nhật thông tin người dùng thành công.")
      setIsEditOpen(false)
      refreshUsers()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật người dùng thất bại."
      )
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleGrantAdmin = async (user: AdminUserItem) => {
    try {
      const targetId = user.employeeId ?? user.accountId
      await adminUsersService.grantAdmin(targetId)
      toast.success(
        `Đã cấp quyền Quản trị viên (Admin) cho "${user.fullName || user.username}".`
      )
      refreshUsers()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cấp quyền Admin thất bại."
      )
    }
  }

  const handleToggleLock = async (user: AdminUserItem) => {
    const newStatus: UserStatus = user.status === "Active" ? "Locked" : "Active"
    try {
      await adminUsersService.updateUser(user.accountId, { status: newStatus })
      toast.success(
        newStatus === "Active"
          ? `Đã mở khóa tài khoản "${user.username}".`
          : `Đã khóa tài khoản "${user.username}".`
      )
      refreshUsers()
    } catch {
      toast.error("Không thể thay đổi trạng thái tài khoản.")
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await adminUsersService.deleteUser(userToDelete.accountId)
      toast.success(`Đã xóa tài khoản "${userToDelete.username}".`)
      setIsConfirmDeleteOpen(false)
      setUserToDelete(null)
      refreshUsers()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa tài khoản."
      )
    }
  }

  const columns: CommonTableColumn<AdminUserItem>[] = [
    {
      id: "user",
      header: "Người dùng",
      cell: (user) => (
        <div className="flex items-center gap-3 py-1">
          <UserAvatar email={user.email || `${user.username}@library.local`} />
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-[#1f3b2b] dark:text-foreground">
              <span>{user.fullName || user.username}</span>
              {user.roles.includes("ADMIN") ? (
                <ShieldCheck className="size-4 text-[#c27652]" />
              ) : null}
            </div>
            <div className="font-mono text-xs text-[#718077] dark:text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "code",
      header: "Mã định danh / Thẻ",
      cell: (user) => (
        <div>
          <div className="font-mono text-xs font-semibold text-[#24382b] dark:text-foreground">
            {user.code || `ID-${user.accountId}`}
          </div>
          {user.position ? (
            <div className="text-[11px] text-[#526458] dark:text-muted-foreground">
              {user.position}
            </div>
          ) : user.readerType ? (
            <Badge
              variant="outline"
              className={`mt-0.5 text-[10px] ${
                user.readerType === "Student"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-slate-300 bg-slate-50 text-slate-700 dark:border-border dark:bg-muted/40 dark:text-muted-foreground"
              }`}
            >
              {user.readerType === "Student"
                ? "Học sinh - Sinh viên"
                : "Độc giả thường"}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      id: "contact",
      header: "Liên hệ",
      cell: (user) => (
        <div className="text-xs text-[#526458] dark:text-muted-foreground">
          <div>
            {user.email || (
              <span className="text-[#99a79e] italic dark:text-muted-foreground/60">
                Chưa có email
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#718077] dark:text-muted-foreground">
            {user.phoneNumber || (
              <span className="text-[#99a79e] italic dark:text-muted-foreground/60">
                Chưa có SĐT
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "roles",
      header: "Vai trò",
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => {
            const r = role.toUpperCase()
            if (r === "ADMIN") {
              return (
                <Badge
                  key={r}
                  className="bg-[#c27652] text-white hover:bg-[#b06744]"
                >
                  Admin
                </Badge>
              )
            }
            if (r === "LIBRARIAN" || r === "EMPLOYEE") {
              return (
                <Badge
                  key={r}
                  className="bg-[#1f5a45] text-white hover:bg-[#174735]"
                >
                  Thủ thư
                </Badge>
              )
            }
            return (
              <Badge
                key={r}
                variant="outline"
                className="border-[#cbd8ce] bg-[#f7f8f4] text-[#4d5d53] dark:border-border dark:bg-muted/40 dark:text-muted-foreground"
              >
                Độc giả
              </Badge>
            )
          })}
        </div>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (user) => {
        if (user.status === "Active") {
          return (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="mr-1 size-3" /> Hoạt động
            </Badge>
          )
        }
        if (user.status === "Pending") {
          return (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
              Chờ duyệt
            </Badge>
          )
        }
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 dark:border dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300">
            <Lock className="mr-1 size-3" /> Đang khóa
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: <div className="text-right">Thao tác</div>,
      cell: (user) => {
        const isEmployee =
          user.userType === "EMPLOYEE" ||
          user.roles.includes("EMPLOYEE") ||
          user.roles.includes("LIBRARIAN")
        const isAdmin = user.roles.includes("ADMIN")

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Grant admin button if employee without admin */}
            {isEmployee && !isAdmin ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGrantAdmin(user)}
                title="Cấp quyền Admin cho nhân viên này"
                className="h-8 gap-1 border-amber-300 bg-amber-50 px-2 text-xs text-amber-800 hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
              >
                <Shield className="size-3.5" />
                <span className="hidden sm:inline">Cấp Admin</span>
              </Button>
            ) : null}

            {/* Lock / Unlock */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleLock(user)}
              title={user.status === "Active" ? "Khóa tài khoản" : "Mở khóa"}
              className={`size-8 p-0 ${
                user.status === "Active"
                  ? "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800/40 dark:text-amber-300 dark:hover:bg-amber-950/40"
                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              }`}
            >
              {user.status === "Active" ? (
                <Lock className="size-3.5" />
              ) : (
                <Unlock className="size-3.5" />
              )}
            </Button>

            {/* Edit */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenEdit(user)}
              title="Chỉnh sửa người dùng"
              className="size-8 border-[#cbd8ce] p-0 text-[#1f3b2b] hover:bg-[#eef4ee] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
            >
              <Pencil className="size-3.5" />
            </Button>

            {/* Delete */}
            <Button
              size="sm"
              variant="outline"
              disabled={user.username === "admin"}
              onClick={() => {
                setUserToDelete(user)
                setIsConfirmDeleteOpen(true)
              }}
              title={
                user.username === "admin"
                  ? "Không thể xóa Admin chính"
                  : "Xóa tài khoản"
              }
              className="size-8 border-rose-200 p-0 text-rose-600 hover:bg-rose-50 disabled:opacity-30 dark:border-rose-800/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1f3b2b] dark:text-foreground">
            Quản lý Người dùng &amp; Tài khoản
          </h1>
          <p className="text-sm text-[#718077] dark:text-muted-foreground">
            Theo dõi, phân quyền và quản lý tài khoản Quản trị viên, Nhân viên
            và Độc giả thư viện.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAddEmployee}
            className="h-10 gap-1.5 bg-[#1f5a45] text-white shadow-xs hover:bg-[#174735]"
          >
            <UserPlus className="size-4" />
            <span>Thêm nhân viên</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#cbd8ce] bg-[#fbfcfa] p-4 shadow-2xs dark:border-border dark:bg-card">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#617067] uppercase dark:text-muted-foreground">
            <span>Tổng người dùng</span>
            <Users className="size-4 text-[#1f5a45] dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1f3b2b] dark:text-foreground">
            {stats.total}
          </div>
        </div>

        <div className="rounded-xl border border-[#cbd8ce] bg-[#fbfcfa] p-4 shadow-2xs dark:border-border dark:bg-card">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#c27652] uppercase dark:text-orange-400">
            <span>Quản trị viên</span>
            <ShieldCheck className="size-4 text-[#c27652] dark:text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#c27652] dark:text-orange-400">
            {stats.adminCount}
          </div>
        </div>

        <div className="rounded-xl border border-[#cbd8ce] bg-[#fbfcfa] p-4 shadow-2xs dark:border-border dark:bg-card">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#1f5a45] uppercase dark:text-emerald-400">
            <span>Thủ thư / Nhân viên</span>
            <UserCheck className="size-4 text-[#1f5a45] dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1f5a45] dark:text-emerald-400">
            {stats.employeeCount}
          </div>
        </div>

        <div className="rounded-xl border border-[#cbd8ce] bg-[#fbfcfa] p-4 shadow-2xs dark:border-border dark:bg-card">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#526458] uppercase dark:text-muted-foreground">
            <span>Độc giả thư viện</span>
            <Badge
              variant="outline"
              className="border-[#cbd8ce] text-[10px] dark:border-border"
            >
              Reader
            </Badge>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1f3b2b] dark:text-foreground">
            {stats.readerCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#cbd8ce] bg-white p-4 shadow-2xs dark:border-border dark:bg-card">
        {/* Role Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-[#e5ece7] pb-3 dark:border-border">
          {(
            [
              { id: "ALL", label: "Tất cả vai trò", count: stats.total },
              {
                id: "ADMIN",
                label: "Quản trị viên (Admin)",
                count: stats.adminCount,
              },
              {
                id: "EMPLOYEE",
                label: "Thủ thư / Nhân viên",
                count: stats.employeeCount,
              },
              { id: "READER", label: "Độc giả", count: stats.readerCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setTypeFilter(tab.id)
                setCurrentPage(1)
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                typeFilter === tab.id
                  ? "bg-[#1f5a45] text-white"
                  : "bg-[#f7f8f4] text-[#617067] hover:bg-[#eef4ee] hover:text-[#1f3b2b] dark:bg-muted/40 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                  typeFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-[#e5ece7] text-[#617067] dark:bg-muted dark:text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-[#718077] dark:text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm kiếm theo Tên, Username, Email, Số điện thoại hoặc Mã CCCD..."
              className="h-10 border-[#cbd8ce] bg-[#fbfcfa] pl-9 focus-visible:border-[#1f5a45] dark:border-border dark:bg-muted/20 dark:text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) {
                  setStatusFilter(val)
                  setCurrentPage(1)
                }
              }}
            >
              <SelectTrigger className="h-10 w-[160px] border-[#cbd8ce] bg-[#fbfcfa] dark:border-border dark:bg-muted/20 dark:text-foreground">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="Active">Hoạt động</SelectItem>
                <SelectItem value="Locked">Đang khóa</SelectItem>
                <SelectItem value="Pending">Chờ duyệt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <CommonTable<AdminUserItem>
        data={paginatedUsers}
        columns={columns}
        loading={loading}
        getRowId={(user) => user.accountId}
        emptyMessage={
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#718077] dark:text-muted-foreground">
            <Users className="size-10 stroke-[1.5] text-[#99a79e] dark:text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              Không tìm thấy người dùng phù hợp.
            </p>
            <p className="text-xs text-[#99a79e] dark:text-muted-foreground/80">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        }
        pagination={{
          page: currentPage,
          pageSize,
          total: filteredUsers.length,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrevious: currentPage > 1,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Dialog: Thêm mới Nhân viên */}
      <AppDialog
        open={isAddEmployeeOpen}
        onOpenChange={setIsAddEmployeeOpen}
        title="Đăng ký tài khoản Nhân viên / Thủ thư"
        description="Admin đăng ký tài khoản cho nhân viên thư viện mới."
        className="sm:max-w-[500px]"
      >
        <form
          onSubmit={handleCreateEmployeeSubmit}
          className="flex flex-col gap-3.5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
                Tên đăng nhập *
              </label>
              <Input
                required
                value={empUsername}
                onChange={(e) => setEmpUsername(e.target.value)}
                placeholder="VD: thuthu_nam"
                className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
                Mật khẩu ban đầu *
              </label>
              <Input
                required
                type="password"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                placeholder="Mật khẩu đăng nhập"
                className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
              Họ và tên nhân viên
            </label>
            <Input
              value={empFullName}
              onChange={(e) => setEmpFullName(e.target.value)}
              placeholder="VD: Trần Văn Nam"
              className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
                Email làm việc
              </label>
              <Input
                type="email"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
                placeholder="nam.tran@library.local"
                className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={empPhone}
                onChange={(e) => setEmpPhone(e.target.value)}
                placeholder="0987654321"
                className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
              Vị trí / Chức vụ
            </label>
            <Input
              value={empPosition}
              onChange={(e) => setEmpPosition(e.target.value)}
              placeholder="VD: Thủ thư quản lý kho, Nhân viên mượn trả..."
              className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEmployeeOpen(false)}
              className="border-[#cbd8ce] dark:border-border dark:text-foreground dark:hover:bg-muted"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submittingEmp}
              className="bg-[#1f5a45] text-white hover:bg-[#174735]"
            >
              {submittingEmp ? "Đang tạo..." : "Tạo tài khoản Nhân viên"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Dialog: Chỉnh sửa Người dùng */}
      <AppDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Chỉnh sửa thông tin người dùng"
        description={`Cập nhật thông tin tài khoản @${editingUser?.username}`}
        className="sm:max-w-[480px]"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
              Họ và tên
            </label>
            <Input
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@example.com"
                className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="0912345678"
                className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase dark:text-muted-foreground">
              Trạng thái tài khoản
            </label>
            <Select
              value={editStatus}
              onValueChange={(val) => setEditStatus(val as UserStatus)}
            >
              <SelectTrigger className="mt-1 h-9 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Hoạt động (Active)</SelectItem>
                <SelectItem value="Locked">Đang khóa (Locked)</SelectItem>
                <SelectItem value="Pending">Chờ duyệt (Pending)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-[#cbd8ce] dark:border-border dark:text-foreground dark:hover:bg-muted"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submittingEdit}
              className="bg-[#1f5a45] text-white hover:bg-[#174735]"
            >
              {submittingEdit ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Dialog: Xác nhận Xóa */}
      <AppDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Xác nhận xóa tài khoản"
        description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa tài khoản này?"
      >
        <div className="py-2">
          <p className="text-sm text-[#1f3b2b] dark:text-foreground">
            Tài khoản: <strong>@{userToDelete?.username}</strong> (
            {userToDelete?.fullName})
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsConfirmDeleteOpen(false)}
            className="border-[#cbd8ce] dark:border-border dark:text-foreground dark:hover:bg-muted"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleDeleteUser}
            className="bg-rose-600 text-white hover:bg-rose-700"
          >
            Xác nhận Xóa
          </Button>
        </div>
      </AppDialog>
    </div>
  )
}
export default UsersManagementPage
