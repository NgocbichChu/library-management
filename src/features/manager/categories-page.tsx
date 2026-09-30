import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Tag, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CommonTable,
  type CommonTableColumn,
} from "@/components/common/common-table"
import { AppDialog } from "@/components/common/app-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { categoriesService } from "@/services/categories"
import type { CategoryDto } from "@/api/categories"

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(
    null
  )
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(
    null
  )

  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [page, setPage] = useState(1)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await categoriesService.getAll()
      setCategories(data)
    } catch {
      toast.error("Không thể tải danh mục từ cơ sở dữ liệu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    categoriesService
      .getAll()
      .then((data) => {
        if (!ignore) {
          setCategories(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Không thể tải danh mục từ cơ sở dữ liệu.")
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleOpenAdd = () => {
    setCode(`CAT-${Math.floor(100 + Math.random() * 900)}`)
    setName("")
    setDescription("")
    setIsAddOpen(true)
  }

  const handleOpenEdit = (cat: CategoryDto) => {
    setEditingCategory(cat)
    setCode(cat.categoryCode || "")
    setName(cat.categoryName)
    setDescription(cat.description || "")
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục.")
      return
    }

    try {
      await categoriesService.create({
        categoryCode: code.trim() || undefined,
        categoryName: name.trim(),
        description: description.trim() || undefined,
      })
      toast.success(`Đã tạo danh mục: ${name}`)
      setIsAddOpen(false)
      await loadCategories()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Thêm danh mục thất bại")
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      await categoriesService.update(editingCategory.categoryId, {
        categoryCode: code.trim() || undefined,
        categoryName: name.trim(),
        description: description.trim() || undefined,
      })
      toast.success("Đã cập nhật danh mục thành công.")
      setEditingCategory(null)
      await loadCategories()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật danh mục thất bại"
      )
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    try {
      await categoriesService.delete(deletingCategory.categoryId)
      toast.success(`Đã xóa danh mục: ${deletingCategory.categoryName}`)
      setDeletingCategory(null)
      await loadCategories()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa danh mục."
      )
    }
  }

  const columns: CommonTableColumn<CategoryDto>[] = [
    {
      id: "code",
      header: "Mã thể loại",
      cell: (cat) => (
        <span className="font-mono text-xs font-semibold text-[#1f5a45] dark:text-emerald-400">
          {cat.categoryCode || `CAT-${cat.categoryId}`}
        </span>
      ),
    },
    {
      id: "name",
      header: "Tên thể loại",
      cell: (cat) => (
        <div className="flex items-center gap-2.5">
          <Tag className="size-4 text-primary" />
          <span className="font-semibold text-foreground">{cat.categoryName}</span>
        </div>
      ),
    },
    {
      id: "description",
      header: "Mô tả",
      cell: (cat) => (
        <span className="line-clamp-1 text-sm text-muted-foreground">
          {cat.description || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (cat) => (
        <span className="text-xs text-muted-foreground">
          {cat.categoryStatus || "ACTIVE"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right",
      cell: (cat) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Sửa danh mục"
            onClick={() => handleOpenEdit(cat)}
          >
            <Edit2 className="size-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xóa danh mục"
            onClick={() => setDeletingCategory(cat)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            Quản trị Thư viện
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1f3b2b] dark:text-foreground">
            Danh mục &amp; Thể loại sách
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các thể loại sách lưu hành trong thư viện từ cơ sở dữ liệu SQL Server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCategories} className="gap-1.5 text-xs">
            <RefreshCw className="size-3.5" /> Tải lại
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]">
            <Plus className="size-4" /> Thêm thể loại mới
          </Button>
        </div>
      </div>

      <CommonTable
        data={categories}
        columns={columns}
        loading={loading}
        getRowId={(c) => String(c.categoryId)}
        emptyMessage="Chưa có danh mục nào trong database."
        summary={
          <span>
            Tổng cộng <strong>{categories.length}</strong> thể loại trong hệ thống
          </span>
        }
        pagination={{
          page,
          pageSize: 10,
          total: categories.length,
          onPageChange: setPage,
        }}
      />

      {/* Modal: Thêm danh mục */}
      <AppDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Thêm thể loại sách mới"
        description="Nhập mã thể loại, tên thể loại và ghi chú phân loại vào database."
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <Field>
            <FieldLabel>Mã thể loại</FieldLabel>
            <Input
              placeholder="VD: CAT-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Tên thể loại *</FieldLabel>
            <Input
              required
              placeholder="VD: Khoa học công nghệ, Kinh tế..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <Input
              placeholder="Mô tả nhóm sách thuộc thể loại này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-[#1f5a45] text-white hover:bg-[#174735]">
              Lưu thể loại
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Sửa danh mục */}
      <AppDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        title="Chỉnh sửa thể loại sách"
        description={`Cập nhật thông tin cho thể loại: ${editingCategory?.categoryName ?? ""}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <Field>
            <FieldLabel>Mã thể loại</FieldLabel>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Tên thể loại *</FieldLabel>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingCategory(null)}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-[#1f5a45] text-white hover:bg-[#174735]">
              Cập nhật thay đổi
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Xác nhận xóa danh mục */}
      <AppDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Xác nhận xóa thể loại"
        description={`Bạn có chắc muốn xóa thể loại "${deletingCategory?.categoryName}" khỏi cơ sở dữ liệu?`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setDeletingCategory(null)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Xóa thể loại
          </Button>
        </div>
      </AppDialog>
    </div>
  )
}

export default CategoriesPage
