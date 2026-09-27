import { useState } from "react"
import { Plus, Edit2, Trash2, Tag, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { useLibraryStore } from "@/stores/use-library-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CommonTable,
  type CommonTableColumn,
} from "@/components/common/common-table"
import { AppDialog } from "@/components/common/app-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import type { CategoryItem } from "@/types/library"

export const CategoriesPage = () => {
  const { categories, createCategory, updateCategory, deleteCategory } =
    useLibraryStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null
  )
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null
  )

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [page, setPage] = useState(1)

  const handleOpenAdd = () => {
    setName("")
    setDescription("")
    setIsAddOpen(true)
  }

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat)
    setName(cat.name)
    setDescription(cat.description)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục.")
      return
    }

    try {
      await createCategory(name.trim(), description.trim())
      toast.success(`Đã tạo danh mục: ${name}`)
      setIsAddOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Thêm danh mục thất bại")
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      await updateCategory(editingCategory.id, name.trim(), description.trim())
      toast.success("Đã cập nhật danh mục thành công.")
      setEditingCategory(null)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật danh mục thất bại"
      )
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    try {
      await deleteCategory(deletingCategory.id)
      toast.success(`Đã xóa danh mục: ${deletingCategory.name}`)
      setDeletingCategory(null)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa danh mục."
      )
    }
  }

  const columns: CommonTableColumn<CategoryItem>[] = [
    {
      id: "name",
      header: "Tên danh mục",
      cell: (cat) => (
        <div className="flex items-center gap-2.5">
          <Tag className="size-4 text-primary" />
          <span className="font-semibold text-foreground">{cat.name}</span>
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
      id: "bookCount",
      header: "Số lượng đầu sách",
      cell: (cat) => (
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <BookOpen className="size-3.5 text-muted-foreground" />
          <span>{cat.bookCount} đầu sách</span>
        </div>
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh mục sách</h1>
          <p className="text-sm text-muted-foreground">
            Phân loại các đầu sách theo từng thể loại và chuyên ngành trong thư
            viện.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="size-4" /> Thêm danh mục mới
        </Button>
      </div>

      <CommonTable
        data={categories}
        columns={columns}
        getRowId={(c) => c.id}
        emptyMessage="Chưa có danh mục nào."
        summary={
          <span>
            Tổng cộng <strong>{categories.length}</strong> danh mục
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
        title="Thêm danh mục thể loại mới"
        description="Nhập tên danh mục và ghi chú mục đích phân loại."
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <Field>
            <FieldLabel>Tên danh mục *</FieldLabel>
            <Input
              required
              placeholder="VD: Trí Tuệ Nhân Tạo & Khoa Học Dữ Liệu"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <Input
              placeholder="Mô tả nhóm sách thuộc danh mục này..."
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
            <Button type="submit">Lưu danh mục</Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Sửa danh mục */}
      <AppDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        title="Chỉnh sửa danh mục"
        description={`Cập nhật thông tin cho danh mục: ${editingCategory?.name ?? ""}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <Field>
            <FieldLabel>Tên danh mục *</FieldLabel>
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
            <Button type="submit">Cập nhật thay đổi</Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Xác nhận xóa danh mục */}
      <AppDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc muốn xóa danh mục "${deletingCategory?.name}"? Lưu ý rằng không thể xóa nếu danh mục đang chứa sách.`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setDeletingCategory(null)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Xóa danh mục
          </Button>
        </div>
      </AppDialog>
    </div>
  )
}
