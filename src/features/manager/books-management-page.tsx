import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BookCopy,
  BookOpen,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { AppDialog } from "@/components/common/app-dialog"
import {
  CommonTable,
  type CommonTableColumn,
} from "@/components/common/common-table"
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
import { Textarea } from "@/components/ui/textarea"
import { managerBooksService } from "@/services/manager-books"
import type {
  BookCopyItem,
  BookTitleItem,
  CreateBookTitleInput,
} from "@/types/manager-books"

export function BooksManagementPage() {
  const [books, setBooks] = useState<BookTitleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookTitleItem | null>(null)
  const [isCopiesOpen, setIsCopiesOpen] = useState(false)
  const [selectedBookForCopies, setSelectedBookForCopies] =
    useState<BookTitleItem | null>(null)

  // Form state for Add/Edit
  const [formData, setFormData] = useState<CreateBookTitleInput>({
    title: "",
    subtitle: "",
    author: "",
    isbn: "",
    publisher: "NXB Trẻ",
    publicationYear: 2024,
    languageCode: "VIE",
    category: "Văn học",
    description: "",
    pageCount: 200,
    bookStatus: "Active",
  })

  // Form state for Add Copy
  const [newBarcode, setNewBarcode] = useState("")
  const [newShelf, setNewShelf] = useState("Kệ A-01")
  const [newPrice, setNewPrice] = useState(85000)

  // Refresh books on user action
  const refreshBooks = async () => {
    setLoading(true)
    try {
      const data = await managerBooksService.getAll()
      setBooks(data)
    } catch {
      toast.error("Không thể tải danh sách sách.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    managerBooksService
      .getAll()
      .then((data) => {
        if (!ignore) {
          setBooks(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Không thể tải danh sách sách.")
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  // Metrics
  const totalTitles = books.length
  const totalCopiesCount = books.reduce((acc, b) => acc + b.totalCopies, 0)
  const availableCopiesCount = books.reduce(
    (acc, b) => acc + b.availableCopies,
    0
  )
  const borrowedCopiesCount = books.reduce(
    (acc, b) => acc + b.borrowedCopies,
    0
  )

  const categories = useMemo(() => {
    const list = ["Tất cả", ...new Set(books.map((b) => b.category))]
    return list
  }, [books])

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchQuery =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery)
      const matchCat =
        categoryFilter === "Tất cả" || book.category === categoryFilter
      const matchStatus =
        statusFilter === "Tất cả" || book.bookStatus === statusFilter
      return matchQuery && matchCat && matchStatus
    })
  }, [books, searchQuery, categoryFilter, statusFilter])

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingBook(null)
    setFormData({
      title: "",
      subtitle: "",
      author: "",
      isbn: `978-604-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1 + Math.random() * 9)}`,
      publisher: "NXB Trẻ",
      publicationYear: 2024,
      languageCode: "VIE",
      category: "Văn học",
      description: "",
      pageCount: 220,
      bookStatus: "Active",
    })
    setIsAddEditOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (book: BookTitleItem) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      subtitle: book.subtitle || "",
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      languageCode: book.languageCode,
      category: book.category,
      description: book.description,
      pageCount: book.pageCount,
      bookStatus: book.bookStatus,
    })
    setIsAddEditOpen(true)
  }

  // Submit Add or Edit
  const handleSubmitBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.author || !formData.isbn) {
      toast.error("Vui lòng điền đầy đủ Tên sách, Tác giả và ISBN.")
      return
    }

    try {
      if (editingBook) {
        await managerBooksService.update(editingBook.id, formData)
        toast.success(`Đã cập nhật đầu sách "${formData.title}"`)
      } else {
        await managerBooksService.create(formData)
        toast.success(`Đã thêm mới đầu sách "${formData.title}"`)
      }
      setIsAddEditOpen(false)
      refreshBooks()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Thao tác không thành công."
      )
    }
  }

  // Delete Book
  const handleDeleteBook = async (book: BookTitleItem) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa đầu sách "${book.title}" khỏi thư viện?`
      )
    ) {
      return
    }

    try {
      await managerBooksService.delete(book.id)
      toast.success(`Đã xóa đầu sách "${book.title}"`)
      refreshBooks()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa đầu sách này."
      )
    }
  }

  // Open Copies Dialog
  const handleOpenCopies = (book: BookTitleItem) => {
    setSelectedBookForCopies(book)
    setNewBarcode(`893${Date.now().toString().slice(-9)}`)
    setIsCopiesOpen(true)
  }

  // Add Copy
  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookForCopies || !newBarcode) return

    try {
      await managerBooksService.addCopy(selectedBookForCopies.id, {
        barcode: newBarcode,
        location: "Khu A - Tầng 1",
        shelfCode: newShelf,
        price: newPrice,
        conditionStatus: "Good",
      })
      toast.success("Đã thêm bản sao mới thành công.")
      const updatedList = await managerBooksService.getAll()
      setBooks(updatedList)
      const freshBook = updatedList.find(
        (b) => b.id === selectedBookForCopies.id
      )
      if (freshBook) setSelectedBookForCopies(freshBook)
      setNewBarcode(`893${Date.now().toString().slice(-9)}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể thêm bản sao."
      )
    }
  }

  // Columns definition
  const columns: CommonTableColumn<BookTitleItem>[] = [
    {
      id: "book",
      header: "Đầu sách",
      cell: (item) => (
        <div className="flex items-center gap-3 py-1">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-md font-serif text-xs font-bold text-[#1f3b2b] shadow-xs"
            style={{ backgroundColor: item.color || "#d9e6d1" }}
          >
            {item.title.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#1f3b2b] hover:text-[#1f5a45]">
              {item.title}
            </p>
            <p className="truncate text-xs text-[#718077]">{item.author}</p>
            <p className="font-mono text-[10px] text-[#8b9a8f]">{item.isbn}</p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Thể loại & Xuất bản",
      cell: (item) => (
        <div>
          <Badge
            variant="outline"
            className="border-[#cbd8ce] bg-[#f7f9f6] text-xs font-medium text-[#2f553a]"
          >
            {item.category}
          </Badge>
          <p className="mt-1 text-xs text-[#718077]">
            {item.publisher} ({item.publicationYear}) · {item.pageCount} trang
          </p>
        </div>
      ),
    },
    {
      id: "inventory",
      header: "Bản sao trong kho",
      cell: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1f3b2b]">
              {item.availableCopies} / {item.totalCopies}
            </span>
            <span className="text-xs text-[#718077]">sẵn sàng</span>
          </div>
          {item.borrowedCopies > 0 && (
            <p className="text-xs font-medium text-[#c27652]">
              Đang mượn: {item.borrowedCopies} cuốn
            </p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (item) =>
        item.bookStatus === "Active" ? (
          <Badge
            variant="outline"
            className="border-[#cce1d2] bg-[#edf6ef] text-[#246237]"
          >
            <CheckCircle2 className="mr-1 size-3" /> Đang phục vụ
          </Badge>
        ) : (
          <Badge variant="outline" className="border-[#dfe5dc] text-[#718077]">
            Ngừng lưu hành
          </Badge>
        ),
    },
    {
      id: "actions",
      header: <div className="text-right">Thao tác</div>,
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenCopies(item)}
            className="h-8 gap-1 border-[#cbd8ce] bg-white px-2.5 text-xs text-[#1f5a45] hover:bg-[#e7eee3]"
            title="Quản lý bản sao"
          >
            <BookCopy className="size-3.5" /> Bản sao ({item.totalCopies})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="size-8 p-0 text-[#718077] hover:text-[#1f5a45]"
            title="Chỉnh sửa thông tin"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteBook(item)}
            className="size-8 p-0 text-[#718077] hover:text-[#b43428]"
            title="Xóa đầu sách"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            Nghiệp vụ Quản lý Thư viện
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#1f3b2b]">
            Quản lý Đầu sách &amp; Bản sao
          </h1>
          <p className="mt-1 text-sm text-[#718077]">
            Quản lý thông tin đầu sách, theo dõi mã vạch barcode và vị trí kệ
            sách trong kho.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]"
        >
          <Plus className="size-4" /> Thêm đầu sách mới
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs">
          <p className="text-xs text-[#718077]">Tổng số đầu sách</p>
          <p className="mt-1 text-2xl font-semibold text-[#1f3b2b]">
            {totalTitles}
          </p>
          <p className="text-[11px] text-[#56675c]">Đầu mục đã đăng ký</p>
        </div>
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs">
          <p className="text-xs text-[#718077]">Tổng bản sao vật lý</p>
          <p className="mt-1 text-2xl font-semibold text-[#1f3b2b]">
            {totalCopiesCount}
          </p>
          <p className="text-[11px] text-[#56675c]">Cuốn sách đang quản lý</p>
        </div>
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs">
          <p className="text-xs text-[#718077]">Sẵn sàng cho mượn</p>
          <p className="mt-1 text-2xl font-semibold text-[#246237]">
            {availableCopiesCount}
          </p>
          <p className="text-[11px] text-[#4e9661]">Sách nằm trên kệ</p>
        </div>
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs">
          <p className="text-xs text-[#718077]">Đang cho độc giả mượn</p>
          <p className="mt-1 text-2xl font-semibold text-[#c27652]">
            {borrowedCopiesCount}
          </p>
          <p className="text-[11px] text-[#b05828]">Trong các phiếu mượn</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-[#8b9a8f]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả hoặc ISBN..."
            className="h-9 border-[#cbd8ce] bg-white pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val ?? "Tất cả")}
          >
            <SelectTrigger className="h-9 w-40 border-[#cbd8ce] bg-white text-xs">
              <Filter className="mr-1 size-3.5 text-[#718077]" />
              <SelectValue placeholder="Thể loại" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "Tất cả")}
          >
            <SelectTrigger className="h-9 w-36 border-[#cbd8ce] bg-white text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tất cả">Tất cả trạng thái</SelectItem>
              <SelectItem value="Active">Đang phục vụ</SelectItem>
              <SelectItem value="Discontinued">Ngừng lưu hành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-[#dfe5dc] bg-white shadow-xs">
        <CommonTable
          data={filteredBooks}
          columns={columns}
          loading={loading}
          pagination={{
            page: currentPage,
            pageSize,
            total: filteredBooks.length,
            onPageChange: setCurrentPage,
          }}
          emptyMessage={
            <div className="py-12 text-center text-sm text-[#718077]">
              <BookOpen className="mx-auto mb-2 size-8 text-[#cbd8ce]" />
              Không tìm thấy đầu sách nào phù hợp.
            </div>
          }
        />
      </div>

      {/* Modal: Thêm / Sửa đầu sách */}
      <AppDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        title={
          <div className="flex items-center gap-2 text-lg font-semibold text-[#1f3b2b]">
            <BookOpen className="size-5 text-[#1f5a45]" />
            {editingBook
              ? "Cập nhật đầu sách"
              : "Thêm mới đầu sách vào thư viện"}
          </div>
        }
        description="Nhập thông tin chi tiết đầu mục sách theo chuẩn thư viện Mộc Miên."
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmitBook} className="mt-3 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#56675c]">
                Tên sách <span className="text-[#b43428]">*</span>
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ví dụ: Nghệ thuật tư duy rành mạch"
                className="mt-1 border-[#cbd8ce]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c]">
                Tác giả <span className="text-[#b43428]">*</span>
              </label>
              <Input
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Ví dụ: Rolf Dobelli"
                className="mt-1 border-[#cbd8ce]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c]">
                Mã ISBN <span className="text-[#b43428]">*</span>
              </label>
              <Input
                required
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="978-604-..."
                className="mt-1 border-[#cbd8ce]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c]">
                Thể loại
              </label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Kỹ năng, Văn học..."
                className="mt-1 border-[#cbd8ce]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c]">
                Nhà xuất bản
              </label>
              <Input
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                placeholder="NXB Trẻ..."
                className="mt-1 border-[#cbd8ce]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c]">
                Năm xuất bản
              </label>
              <Input
                type="number"
                value={formData.publicationYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publicationYear: Number(e.target.value) || 2024,
                  })
                }
                className="mt-1 border-[#cbd8ce]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c]">
                Số trang
              </label>
              <Input
                type="number"
                value={formData.pageCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pageCount: Number(e.target.value) || 200,
                  })
                }
                className="mt-1 border-[#cbd8ce]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#56675c]">
                Tóm tắt / Mô tả nội dung
              </label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả ngắn về chủ đề và nội dung cuốn sách..."
                className="mt-1 border-[#cbd8ce]"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-[#edf0eb] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEditOpen(false)}
              className="border-[#cbd8ce]"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="bg-[#1f5a45] text-white hover:bg-[#174735]"
            >
              {editingBook ? "Lưu thay đổi" : "Tạo đầu sách"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Quản lý các bản sao vật lý (Copies) */}
      <AppDialog
        open={isCopiesOpen}
        onOpenChange={setIsCopiesOpen}
        title={
          <div className="flex items-center gap-2 text-lg font-semibold text-[#1f3b2b]">
            <Layers className="size-5 text-[#1f5a45]" />
            Bản sao cuốn sách: {selectedBookForCopies?.title}
          </div>
        }
        description="Quản lý mã vạch barcode, giá trị và vị trí kệ sách của từng cuốn vật lý."
        className="max-w-3xl"
      >
        <div className="mt-3 flex flex-col gap-6">
          {/* List of Copies */}
          <div className="overflow-x-auto rounded-lg border border-[#dfe5dc]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#edf0eb] bg-[#f7f9f6] font-semibold text-[#718077]">
                <tr>
                  <th className="p-2.5">Mã bản sao</th>
                  <th className="p-2.5">Mã vạch Barcode</th>
                  <th className="p-2.5">Vị trí lưu trữ</th>
                  <th className="p-2.5">Giá nhập</th>
                  <th className="p-2.5">Tình trạng</th>
                  <th className="p-2.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3ee]">
                {(selectedBookForCopies?.copies || []).map(
                  (copy: BookCopyItem) => (
                    <tr key={copy.id} className="hover:bg-[#fbfcfb]">
                      <td className="p-2.5 font-mono text-[11px] font-medium text-[#1f5a45]">
                        {copy.id}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#17231d]">
                        {copy.barcode}
                      </td>
                      <td className="p-2.5">
                        <span className="flex items-center gap-1 text-[#385145]">
                          <MapPin className="size-3 text-[#c27652]" />
                          {copy.shelfCode} ({copy.location})
                        </span>
                      </td>
                      <td className="p-2.5 font-medium">
                        {copy.price.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-2.5">
                        {copy.conditionStatus === "Good" && (
                          <span className="text-[#246237]">Tốt</span>
                        )}
                        {copy.conditionStatus === "SlightlyDamaged" && (
                          <span className="text-[#b05828]">Sờn nhẹ</span>
                        )}
                        {copy.conditionStatus === "Damaged" && (
                          <span className="text-[#b83828]">Hư hại</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {copy.copyStatus === "Available" ? (
                          <Badge
                            variant="outline"
                            className="border-[#cce1d2] bg-[#edf6ef] text-[10px] text-[#246237]"
                          >
                            Có sẵn
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-[#f3d9ca] bg-[#fdf3ec] text-[10px] text-[#b05828]"
                          >
                            Đang mượn
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Add New Copy Form */}
          <form
            onSubmit={handleAddCopy}
            className="rounded-xl border border-dashed border-[#cbd8ce] bg-[#f7f9f6] p-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1f3b2b]">
              <Plus className="size-4 text-[#1f5a45]" /> Thêm bản sao vật lý mới
              vào kho
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] text-[#718077]">Mã vạch</label>
                <Input
                  required
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  className="h-8 border-[#cbd8ce] bg-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#718077]">Vị trí kệ</label>
                <Input
                  value={newShelf}
                  onChange={(e) => setNewShelf(e.target.value)}
                  placeholder="Kệ A-01..."
                  className="h-8 border-[#cbd8ce] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#718077]">
                  Giá nhập (VNĐ)
                </label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value) || 0)}
                  className="h-8 border-[#cbd8ce] bg-white text-xs"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="h-8 bg-[#1f5a45] text-xs text-white hover:bg-[#174735]"
              >
                + Lưu bản sao
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-2 rounded-lg border border-[#dfe5dc] bg-white p-3 text-xs text-[#718077]">
            <AlertCircle className="size-4 shrink-0 text-[#c27652]" />
            <span>
              Theo quy định thư viện, mỗi cuốn sách vật lý khi nhập kho đều được
              dán mã vạch barcode duy nhất để thủ thư quét khi mượn/trả.
            </span>
          </div>
        </div>
      </AppDialog>
    </div>
  )
}

export default BooksManagementPage
