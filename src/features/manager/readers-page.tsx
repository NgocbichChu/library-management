import { useState, useMemo } from "react"
import {
  UserPlus,
  Search,
  Edit2,
  Lock,
  Unlock,
  CreditCard,
  GraduationCap,
  Briefcase,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { useLibraryStore } from "@/stores/use-library-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CommonTable, type CommonTableColumn } from "@/components/common/common-table"
import { AppDialog } from "@/components/common/app-dialog"
import { AppSelect } from "@/components/common/app-select"
import { Field, FieldLabel } from "@/components/ui/field"
import type { Reader, ReaderType } from "@/types/library"

export const ReadersPage = () => {
  const { readers, createReader, updateReader, toggleReaderStatus } = useLibraryStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingReader, setEditingReader] = useState<Reader | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    reader_code: "",
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "2002-01-01",
    address: "",
    reader_type: "STUDENT" as ReaderType,
    card_expired_at: "2027-09-01",
  })

  const filteredReaders = useMemo(() => {
    return readers.filter((r) => {
      const matchQuery =
        searchQuery === "" ||
        r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reader_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.phone_number && r.phone_number.includes(searchQuery))
      const matchType = typeFilter === "all" || r.reader_type === typeFilter
      return matchQuery && matchType
    })
  }, [readers, searchQuery, typeFilter])

  const handleOpenAdd = () => {
    const nextNum = readers.length + 1
    setFormData({
      reader_code: `RD${String(nextNum).padStart(3, "0")}`,
      full_name: "",
      email: "",
      phone_number: "",
      date_of_birth: "2003-01-01",
      address: "",
      reader_type: "STUDENT",
      card_expired_at: "2027-09-01",
    })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (reader: Reader) => {
    setEditingReader(reader)
    setFormData({
      reader_code: reader.reader_code,
      full_name: reader.full_name,
      email: reader.email,
      phone_number: reader.phone_number ?? "",
      date_of_birth: reader.date_of_birth ?? "2003-01-01",
      address: reader.address ?? "",
      reader_type: reader.reader_type,
      card_expired_at: reader.card_expired_at ?? "2027-09-01",
    })
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Vui lòng nhập họ tên và email của độc giả.")
      return
    }

    try {
      await createReader({
        reader_code: formData.reader_code.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address.trim() || null,
        reader_type: formData.reader_type,
        card_created_at: new Date().toISOString().split("T")[0],
        card_expired_at: formData.card_expired_at || null,
        reader_status: "ACTIVE",
      })
      toast.success(`Đã đăng ký độc giả thành công: ${formData.full_name}`)
      setIsAddOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Thêm độc giả thất bại")
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReader) return

    try {
      await updateReader(editingReader.reader_id, {
        reader_code: formData.reader_code.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address.trim() || null,
        reader_type: formData.reader_type,
        card_expired_at: formData.card_expired_at || null,
      })
      toast.success("Cập nhật độc giả thành công.")
      setEditingReader(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cập nhật độc giả thất bại")
    }
  }

  const handleToggleStatus = async (reader: Reader) => {
    try {
      const updated = await toggleReaderStatus(reader.reader_id)
      const isLocked = updated.reader_status === "LOCKED"
      toast[isLocked ? "warning" : "success"](
        `Đã ${isLocked ? "khóa" : "mở khóa"} thẻ độc giả: ${reader.full_name}`
      )
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại.")
    }
  }

  const typeOptions = [
    { value: "all", label: "Tất cả đối tượng" },
    { value: "STUDENT", label: "Sinh viên / Học sinh" },
    { value: "TEACHER", label: "Giảng viên / Giáo viên" },
    { value: "NORMAL", label: "Bạn đọc tự do" },
  ]

  const columns: CommonTableColumn<Reader>[] = [
    {
      id: "code",
      header: "Mã độc giả",
      cell: (reader) => (
        <div className="flex items-center gap-2 font-mono font-medium">
          <CreditCard className="size-4 text-primary" />
          <span>{reader.reader_code}</span>
        </div>
      ),
    },
    {
      id: "info",
      header: "Họ và tên / Liên hệ",
      cell: (reader) => (
        <div>
          <p className="font-semibold text-foreground">{reader.full_name}</p>
          <p className="text-xs text-muted-foreground">{reader.email}</p>
          {reader.phone_number ? (
            <p className="text-[11px] text-muted-foreground">SĐT: {reader.phone_number}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: "type",
      header: "Đối tượng",
      cell: (reader) => {
        const config = {
          STUDENT: {
            label: "Sinh viên",
            icon: <GraduationCap className="size-3.5 text-blue-600" />,
            badge: "border-blue-500/30 text-blue-600 bg-blue-500/10",
          },
          TEACHER: {
            label: "Giảng viên",
            icon: <Briefcase className="size-3.5 text-purple-600" />,
            badge: "border-purple-500/30 text-purple-600 bg-purple-500/10",
          },
          NORMAL: {
            label: "Tự do",
            icon: <User className="size-3.5 text-zinc-600" />,
            badge: "border-zinc-500/30 text-zinc-600 bg-zinc-500/10",
          },
        }[reader.reader_type]

        return (
          <Badge variant="outline" className={`gap-1.5 ${config.badge}`}>
            {config.icon}
            <span>{config.label}</span>
          </Badge>
        )
      },
    },
    {
      id: "validity",
      header: "Hạn sử dụng thẻ",
      cell: (reader) => (
        <div className="text-xs">
          <p>
            Cấp:{" "}
            {reader.card_created_at
              ? new Date(reader.card_created_at).toLocaleDateString("vi-VN")
              : "—"}
          </p>
          <p className="text-muted-foreground">
            Hạn:{" "}
            {reader.card_expired_at
              ? new Date(reader.card_expired_at).toLocaleDateString("vi-VN")
              : "Vô thời hạn"}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Trạng thái thẻ",
      cell: (reader) =>
        reader.reader_status === "ACTIVE" ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Đang hoạt động
          </Badge>
        ) : (
          <Badge variant="destructive">Đã khóa thẻ</Badge>
        ),
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right",
      cell: (reader) => {
        const isLocked = reader.reader_status === "LOCKED"
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              title={isLocked ? "Mở khóa thẻ" : "Khóa thẻ độc giả"}
              onClick={() => handleToggleStatus(reader)}
            >
              {isLocked ? (
                <Unlock className="size-4 text-emerald-600" />
              ) : (
                <Lock className="size-4 text-amber-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Sửa thông tin"
              onClick={() => handleOpenEdit(reader)}
            >
              <Edit2 className="size-4 text-blue-600" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý độc giả</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách bạn đọc, cấp mới thẻ thư viện và quản lý tình trạng tài khoản độc giả (reader).
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <UserPlus className="size-4" /> Cấp thẻ độc giả mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, mã thẻ, email, SĐT..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>
        <div className="w-full sm:w-64">
          <AppSelect
            options={typeOptions}
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val)
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Table */}
      <CommonTable
        data={filteredReaders}
        columns={columns}
        getRowId={(r) => r.reader_id}
        emptyMessage="Không tìm thấy độc giả nào."
        summary={
          <span>
            Tổng cộng <strong>{filteredReaders.length}</strong> độc giả
          </span>
        }
        pagination={{
          page,
          pageSize,
          total: filteredReaders.length,
          onPageChange: setPage,
        }}
      />

      {/* Modal: Thêm độc giả mới */}
      <AppDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Cấp thẻ độc giả mới"
        description="Đăng ký tài khoản độc giả (reader) và cấp mã thẻ thư viện."
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Mã thẻ độc giả *</FieldLabel>
              <Input
                required
                value={formData.reader_code}
                onChange={(e) =>
                  setFormData({ ...formData, reader_code: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Đối tượng bạn đọc *</FieldLabel>
              <AppSelect
                options={[
                  { value: "STUDENT", label: "Sinh viên / Học sinh" },
                  { value: "TEACHER", label: "Giảng viên / Giáo viên" },
                  { value: "NORMAL", label: "Bạn đọc tự do" },
                ]}
                value={formData.reader_type}
                onChange={(val) =>
                  setFormData({ ...formData, reader_type: val as ReaderType })
                }
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel>Họ và tên *</FieldLabel>
              <Input
                required
                placeholder="VD: Trần Thị Mai"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Email liên hệ *</FieldLabel>
              <Input
                required
                type="email"
                placeholder="example@library.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Số điện thoại</FieldLabel>
              <Input
                placeholder="0912345678"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Ngày sinh</FieldLabel>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Hạn sử dụng thẻ</FieldLabel>
              <Input
                type="date"
                value={formData.card_expired_at}
                onChange={(e) =>
                  setFormData({ ...formData, card_expired_at: e.target.value })
                }
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel>Địa chỉ / Đơn vị công tác</FieldLabel>
              <Input
                placeholder="Địa chỉ cư trú hoặc khoa / lớp..."
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Hoàn tất cấp thẻ</Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Sửa độc giả */}
      <AppDialog
        open={Boolean(editingReader)}
        onOpenChange={(open) => !open && setEditingReader(null)}
        title="Chỉnh sửa thông tin độc giả"
        description={`Cập nhật hồ sơ bạn đọc: ${editingReader?.full_name ?? ""}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Mã thẻ độc giả *</FieldLabel>
              <Input
                required
                value={formData.reader_code}
                onChange={(e) =>
                  setFormData({ ...formData, reader_code: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Đối tượng</FieldLabel>
              <AppSelect
                options={[
                  { value: "STUDENT", label: "Sinh viên / Học sinh" },
                  { value: "TEACHER", label: "Giảng viên / Giáo viên" },
                  { value: "NORMAL", label: "Bạn đọc tự do" },
                ]}
                value={formData.reader_type}
                onChange={(val) =>
                  setFormData({ ...formData, reader_type: val as ReaderType })
                }
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel>Họ và tên *</FieldLabel>
              <Input
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Email *</FieldLabel>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Số điện thoại</FieldLabel>
              <Input
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Ngày sinh</FieldLabel>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Hạn thẻ</FieldLabel>
              <Input
                type="date"
                value={formData.card_expired_at}
                onChange={(e) =>
                  setFormData({ ...formData, card_expired_at: e.target.value })
                }
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel>Địa chỉ</FieldLabel>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setEditingReader(null)}>
              Hủy
            </Button>
            <Button type="submit">Cập nhật hồ sơ</Button>
          </div>
        </form>
      </AppDialog>
    </div>
  )
}
