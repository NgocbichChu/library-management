import { useEffect, useState, useMemo } from "react"
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  Barcode,
  Eye,
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
import type { BookTitle } from "@/types/library"

export const BooksPage = () => {
  const {
    books,
    copies,
    categories,
    isInitialized,
    fetchAll,
    createBook,
    updateBook,
    deleteBook,
    createCopy,
  } = useLibraryStore()

  useEffect(() => {
    if (!isInitialized) {
      void fetchAll()
    }
  }, [isInitialized, fetchAll])

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookTitle | null>(null)
  const [viewingCopiesBook, setViewingCopiesBook] = useState<BookTitle | null>(null)
  const [deletingBook, setDeletingBook] = useState<BookTitle | null>(null)

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    publication_year: new Date().getFullYear(),
    category: "Công nghệ thông tin",
    page_count: 200,
    description: "",
    initialCopies: 2,
  })

  // State for adding a copy
  const [newCopyBarcode, setNewCopyBarcode] = useState("")
  const [newCopyShelf, setNewCopyShelf] = useState("KE-01")
  const [newCopyLocation, setNewCopyLocation] = useState("Khu Tự Nhiên - Tầng 2")

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchQuery =
        searchQuery === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.isbn && b.isbn.includes(searchQuery))
      const matchCat =
        selectedCategory === "all" || b.category === selectedCategory
      return matchQuery && matchCat
    })
  }, [books, searchQuery, selectedCategory])

  const handleOpenAdd = () => {
    setFormData({
      isbn: "",
      title: "",
      author: "",
      publisher: "",
      publication_year: new Date().getFullYear(),
      category: categories[0]?.name ?? "Công nghệ thông tin",
      page_count: 250,
      description: "",
      initialCopies: 2,
    })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (book: BookTitle) => {
    setEditingBook(book)
    setFormData({
      isbn: book.isbn ?? "",
      title: book.title,
      author: book.author,
      publisher: book.publisher ?? "",
      publication_year: book.publication_year ?? new Date().getFullYear(),
      category: book.category,
      page_count: book.page_count ?? 200,
      description: book.description ?? "",
      initialCopies: 0,
    })
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error("Vui lòng nhập đầy đủ tên sách và tác giả.")
      return
    }

    try {
      await createBook(
        {
          isbn: formData.isbn.trim() || null,
          title: formData.title.trim(),
          subtitle: null,
          author: formData.author.trim(),
          publisher: formData.publisher.trim() || null,
          publication_year: Number(formData.publication_year) || null,
          language_code: "vie",
          category: formData.category,
          description: formData.description.trim() || null,
          page_count: Number(formData.page_count) || null,
          cover_image_url:
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
          book_status: "ACTIVE",
        },
        formData.initialCopies
      )
      toast.success(`Đã thêm thành công đầu sách: ${formData.title}`)
      setIsAddOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Thêm sách thất bại")
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBook) return

    try {
      await updateBook(editingBook.book_title_id, {
        isbn: formData.isbn.trim() || null,
        title: formData.title.trim(),
        author: formData.author.trim(),
        publisher: formData.publisher.trim() || null,
        publication_year: Number(formData.publication_year) || null,
        category: formData.category,
        page_count: Number(formData.page_count) || null,
        description: formData.description.trim() || null,
      })
      toast.success("Đã cập nhật thông tin sách thành công.")
      setEditingBook(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cập nhật sách thất bại")
    }
  }

  const handleDelete = async () => {
    if (!deletingBook) return
    try {
      await deleteBook(deletingBook.book_title_id)
      toast.success(`Đã xóa đầu sách: ${deletingBook.title}`)
      setDeletingBook(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa sách.")
    }
  }

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!viewingCopiesBook) return
    const barcode =
      newCopyBarcode.trim() ||
      `BC-${String(viewingCopiesBook.book_title_id).padStart(3, "0")}-${Date.now().toString().slice(-3)}`

    try {
      await createCopy({
        book_title_id: viewingCopiesBook.book_title_id,
        barcode,
        acquisition_date: new Date().toISOString().split("T")[0],
        price: 120000,
        location: newCopyLocation.trim(),
        shelf_code: newCopyShelf.trim(),
        copy_status: "AVAILABLE",
        condition_status: "NEW",
        note: "Bản sao bổ sung",
      })
      toast.success(`Đã tạo thêm bản sao với mã barcode ${barcode}`)
      setNewCopyBarcode("")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo bản sao")
    }
  }

  // Book copies for modal
  const currentBookCopies = useMemo(() => {
    if (!viewingCopiesBook) return []
    return copies.filter((c) => c.book_title_id === viewingCopiesBook.book_title_id)
  }, [copies, viewingCopiesBook])

  const categoryOptions = [
    { value: "all", label: "Tất cả thể loại" },
    ...categories.map((c) => ({ value: c.name, label: c.name })),
  ]

  const columns: CommonTableColumn<BookTitle>[] = [
    {
      id: "title",
      header: "Tựa sách / Tác giả",
      cell: (book) => (
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="size-full p-2 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground line-clamp-1">{book.title}</p>
            <p className="text-xs text-muted-foreground">Tác giả: {book.author}</p>
            {book.isbn ? (
              <p className="text-[11px] font-mono text-muted-foreground/80">
                ISBN: {book.isbn}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Thể loại",
      cell: (book) => (
        <Badge variant="outline" className="font-normal">
          {book.category}
        </Badge>
      ),
    },
    {
      id: "publisher",
      header: "NXB / Năm",
      cell: (book) => (
        <div className="text-xs">
          <p>{book.publisher ?? "—"}</p>
          <p className="text-muted-foreground">{book.publication_year ?? ""}</p>
        </div>
      ),
    },
    {
      id: "copies",
      header: "Bản sao (Sẵn / Tổng)",
      cell: (book) => {
        const avail = book.available_copies_count ?? 0
        const total = book.copies_count ?? 0
        const isOut = avail === 0 && total > 0

        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                isOut ? "text-destructive" : avail > 0 ? "text-emerald-600" : ""
              }`}
            >
              {avail} / {total}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              title="Xem danh sách bản sao vật lý"
              onClick={() => setViewingCopiesBook(book)}
            >
              <Layers className="size-3.5 text-primary" />
            </Button>
          </div>
        )
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (book) => {
        const avail = book.available_copies_count ?? 0
        return avail > 0 ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Còn sách
          </Badge>
        ) : (
          <Badge variant="destructive">Hết sách</Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right",
      cell: (book) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Quản lý bản sao"
            onClick={() => setViewingCopiesBook(book)}
          >
            <Eye className="size-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Sửa đầu sách"
            onClick={() => handleOpenEdit(book)}
          >
            <Edit2 className="size-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Xóa đầu sách"
            onClick={() => setDeletingBook(book)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý sách</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các đầu sách (book_title) và từng bản sao vật lý (book_copy) trong kho thư viện.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="size-4" /> Thêm đầu sách mới
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sách, tác giả, ISBN..."
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
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val)
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Main Table */}
      <CommonTable
        data={filteredBooks}
        columns={columns}
        getRowId={(b) => b.book_title_id}
        emptyMessage="Không tìm thấy sách nào phù hợp."
        summary={
          <span>
            Hiển thị <strong>{filteredBooks.length}</strong> đầu sách
          </span>
        }
        pagination={{
          page,
          pageSize,
          total: filteredBooks.length,
          onPageChange: setPage,
        }}
      />

      {/* Modal: Thêm đầu sách mới */}
      <AppDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Thêm đầu sách mới vào thư viện"
        description="Điền thông tin tác phẩm (book_title). Hệ thống sẽ tự động tạo các bản sao (book_copy) tương ứng."
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel>Tựa sách *</FieldLabel>
              <Input
                required
                placeholder="VD: Cấu Trúc Dữ Liệu & Giải Thuật"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Tác giả *</FieldLabel>
              <Input
                required
                placeholder="VD: Robert C. Martin"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Mã ISBN</FieldLabel>
              <Input
                placeholder="978-604-..."
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Thể loại *</FieldLabel>
              <AppSelect
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
              />
            </Field>

            <Field>
              <FieldLabel>Nhà xuất bản</FieldLabel>
              <Input
                placeholder="NXB Trẻ, NXB Giáo Dục..."
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Năm xuất bản</FieldLabel>
              <Input
                type="number"
                value={formData.publication_year}
                onChange={(e) =>
                  setFormData({ ...formData, publication_year: Number(e.target.value) })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Số bản sao ban đầu (book_copy)</FieldLabel>
              <Input
                type="number"
                min={1}
                max={20}
                value={formData.initialCopies}
                onChange={(e) =>
                  setFormData({ ...formData, initialCopies: Number(e.target.value) })
                }
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel>Tóm tắt / Mô tả nội dung</FieldLabel>
              <Input
                placeholder="Mô tả sơ lược về tác phẩm..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu đầu sách</Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Sửa đầu sách */}
      <AppDialog
        open={Boolean(editingBook)}
        onOpenChange={(open) => !open && setEditingBook(null)}
        title="Chỉnh sửa thông tin đầu sách"
        description={`Cập nhật dữ liệu cho cuốn: ${editingBook?.title ?? ""}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel>Tựa sách *</FieldLabel>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Tác giả *</FieldLabel>
              <Input
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Mã ISBN</FieldLabel>
              <Input
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Thể loại</FieldLabel>
              <AppSelect
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
              />
            </Field>

            <Field>
              <FieldLabel>Nhà xuất bản</FieldLabel>
              <Input
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Năm xuất bản</FieldLabel>
              <Input
                type="number"
                value={formData.publication_year}
                onChange={(e) =>
                  setFormData({ ...formData, publication_year: Number(e.target.value) })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Số trang</FieldLabel>
              <Input
                type="number"
                value={formData.page_count}
                onChange={(e) =>
                  setFormData({ ...formData, page_count: Number(e.target.value) })
                }
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel>Mô tả nội dung</FieldLabel>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setEditingBook(null)}>
              Hủy
            </Button>
            <Button type="submit">Cập nhật thay đổi</Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Quản lý các bản sao vật lý (book_copy) */}
      <AppDialog
        open={Boolean(viewingCopiesBook)}
        onOpenChange={(open) => !open && setViewingCopiesBook(null)}
        title={`Quản lý bản sao (book_copy) - ${viewingCopiesBook?.title ?? ""}`}
        description="Mỗi bản sao vật lý có mã barcode riêng biệt, vị trí kệ sách và tình trạng thực tế."
        className="max-w-2xl"
      >
        <div className="space-y-4">
          {/* List of copies */}
          <div className="max-h-60 overflow-y-auto rounded-lg border divide-y text-sm">
            {currentBookCopies.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">
                Chưa có bản sao nào được ghi nhận.
              </p>
            ) : (
              currentBookCopies.map((copy) => (
                <div
                  key={copy.book_copy_id}
                  className="p-3 flex items-center justify-between hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Barcode className="size-5 text-primary" />
                    <div>
                      <p className="font-mono font-medium">{copy.barcode}</p>
                      <p className="text-xs text-muted-foreground">
                        Kệ: {copy.shelf_code ?? "Chưa gán"} • {copy.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Tình trạng: {copy.condition_status}
                    </Badge>
                    {copy.copy_status === "AVAILABLE" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        Sẵn sàng
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                        Đang mượn
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add a copy form */}
          <form
            onSubmit={handleAddCopy}
            className="rounded-lg border bg-muted/40 p-3 space-y-3"
          >
            <p className="font-semibold text-xs uppercase tracking-wide text-foreground">
              Thêm bản sao vật lý mới
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Barcode (tùy chọn)"
                value={newCopyBarcode}
                onChange={(e) => setNewCopyBarcode(e.target.value)}
                className="text-xs h-8"
              />
              <Input
                placeholder="Mã kệ (VD: KE-02)"
                value={newCopyShelf}
                onChange={(e) => setNewCopyShelf(e.target.value)}
                className="text-xs h-8"
              />
              <Input
                placeholder="Vị trí (VD: Tầng 2)"
                value={newCopyLocation}
                onChange={(e) => setNewCopyLocation(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" type="submit" className="gap-1 text-xs">
                <Plus className="size-3.5" /> Thêm bản sao
              </Button>
            </div>
          </form>

          <div className="flex justify-end pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingCopiesBook(null)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </AppDialog>

      {/* Modal: Xác nhận xóa sách */}
      <AppDialog
        open={Boolean(deletingBook)}
        onOpenChange={(open) => !open && setDeletingBook(null)}
        title="Xác nhận xóa đầu sách"
        description={`Bạn có chắc chắn muốn xóa đầu sách "${deletingBook?.title}"? Hành động này sẽ đồng thời loại bỏ tất cả các bản sao vật lý liên quan.`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setDeletingBook(null)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Xóa vĩnh viễn
          </Button>
        </div>
      </AppDialog>
    </div>
  )
}
