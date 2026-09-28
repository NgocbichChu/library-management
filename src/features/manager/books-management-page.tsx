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
import { useLibraryStore } from "@/stores/use-library-store"
import type {
  BookCopyItem,
  BookTitleItem,
  CreateBookTitleInput,
} from "@/types/manager-books"

export function BooksManagementPage() {
  const { categories: storeCategories, fetchCategories } = useLibraryStore()
  const [books, setBooks] = useState<BookTitleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const generateRandomIsbn = () => {
    const p1 = "978-604"
    const p2 = Math.floor(100 + Math.random() * 900)
    const p3 = Math.floor(1000 + Math.random() * 9000)
    const p4 = Math.floor(1 + Math.random() * 9)
    return `${p1}-${p2}-${p3}-${p4}`
  }

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
    publisher: "",
    publicationYear: "" as unknown as number,
    languageCode: "VIE",
    category: "",
    description: "",
    pageCount: "" as unknown as number,
    price: "" as unknown as number,
    bookStatus: "Active",
  })

  // Form state for Add Copy
  const [newBarcode, setNewBarcode] = useState("")
  const [newShelf, setNewShelf] = useState("Kệ A-01")
  const [newLocation, setNewLocation] = useState("Khu A - Tầng 1")
  const [newPrice, setNewPrice] = useState(85000)
  const [newCondition, setNewCondition] = useState<
    "Good" | "SlightlyDamaged" | "Damaged"
  >("Good")

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
    void fetchCategories()
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
  }, [fetchCategories])

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

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    storeCategories.forEach((c) => c.name && set.add(c.name))
    books.forEach((b) => b.category && set.add(b.category))
    if (formData.category) set.add(formData.category)
    return Array.from(set)
  }, [storeCategories, books, formData.category])

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, statusFilter])

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

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize))
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredBooks.slice(start, start + pageSize)
  }, [filteredBooks, currentPage, pageSize])

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingBook(null)
    setFormData({
      title: "",
      subtitle: "",
      author: "",
      isbn: generateRandomIsbn(),
      publisher: "",
      publicationYear: "" as unknown as number,
      languageCode: "VIE",
      category: "",
      description: "",
      pageCount: "" as unknown as number,
      price: "" as unknown as number,
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
      price: book.price || (book.copies?.[0]?.price ?? 85000),
      bookStatus: book.bookStatus,
    })
    setIsAddEditOpen(true)
  }

  // Submit Add or Edit
  const handleSubmitBook = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentYear = new Date().getFullYear()
    const pubYear = Number(formData.publicationYear)

    if (
      !formData.title?.trim() ||
      !formData.author?.trim() ||
      !formData.isbn?.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ Tên sách, Tác giả và ISBN.")
      return
    }

    if (!formData.category?.trim()) {
      toast.error("Vui lòng chọn thể loại cho sách.")
      return
    }

    if (!pubYear || isNaN(pubYear) || pubYear <= 0) {
      toast.error("Vui lòng nhập năm xuất bản hợp lệ.")
      return
    }

    if (pubYear > currentYear) {
      toast.error(
        `Năm xuất bản không được lớn hơn năm hiện tại (${currentYear}).`
      )
      return
    }

    try {
      if (editingBook) {
        await managerBooksService.update(editingBook.id, {
          ...formData,
          publicationYear: pubYear,
          pageCount: Number(formData.pageCount) || 1,
          price: Number(formData.price) || 0,
        })
        toast.success(`Đã cập nhật đầu sách "${formData.title}"`)
      } else {
        await managerBooksService.create({
          ...formData,
          publicationYear: pubYear,
          pageCount: Number(formData.pageCount) || 1,
          price: Number(formData.price) || 0,
        })
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
    setNewShelf("Kệ A-01")
    setNewLocation("Khu A - Tầng 1")
    setNewPrice(book.price || (book.copies?.[0]?.price ?? 85000))
    setNewCondition("Good")
    setIsCopiesOpen(true)
  }

  // Add Copy
  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookForCopies || !newBarcode.trim()) {
      toast.error("Vui lòng nhập mã vạch.")
      return
    }

    try {
      await managerBooksService.addCopy(selectedBookForCopies.id, {
        barcode: newBarcode.trim(),
        location: newLocation.trim() || "Khu A - Tầng 1",
        shelfCode: newShelf.trim() || "Kệ A-01",
        price: Number(newPrice) || 85000,
        conditionStatus: newCondition,
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

  // Delete Copy
  const handleDeleteCopy = async (copy: BookCopyItem) => {
    if (!selectedBookForCopies) return
    if (copy.copyStatus === "Borrowed") {
      toast.error("Không thể xóa bản sao đang được độc giả mượn.")
      return
    }
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa bản sao có mã vạch "${copy.barcode}"?`
      )
    ) {
      return
    }

    try {
      await managerBooksService.removeCopy(selectedBookForCopies.id, copy.id)
      toast.success("Đã xóa bản sao khỏi kho thành công.")
      const updatedList = await managerBooksService.getAll()
      setBooks(updatedList)
      const freshBook = updatedList.find(
        (b) => b.id === selectedBookForCopies.id
      )
      if (freshBook) setSelectedBookForCopies(freshBook)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa bản sao này."
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
            <p className="truncate font-semibold text-[#1f3b2b] hover:text-[#1f5a45] dark:text-foreground dark:hover:text-emerald-400">
              {item.title}
            </p>
            <p className="truncate text-xs text-[#718077] dark:text-muted-foreground">
              {item.author}
            </p>
            <p className="font-mono text-[10px] text-[#8b9a8f] dark:text-muted-foreground/80">
              {item.isbn}
            </p>
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
            className="border-[#cbd8ce] bg-[#f7f9f6] text-xs font-medium text-[#2f553a] dark:border-border dark:bg-muted/40 dark:text-foreground"
          >
            {item.category}
          </Badge>
          <p className="mt-1 text-xs text-[#718077] dark:text-muted-foreground">
            {item.publisher} ({item.publicationYear}) · {item.pageCount} trang
            {item.price ? ` · ${item.price.toLocaleString("vi-VN")} đ` : ""}
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
            <span className="font-semibold text-[#1f3b2b] dark:text-foreground">
              {item.availableCopies} / {item.totalCopies}
            </span>
            <span className="text-xs text-[#718077] dark:text-muted-foreground">
              sẵn sàng
            </span>
          </div>
          {item.borrowedCopies > 0 && (
            <p className="text-xs font-medium text-[#c27652] dark:text-orange-400">
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
            className="border-[#cce1d2] bg-[#edf6ef] text-[#246237] dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <CheckCircle2 className="mr-1 size-3" /> Đang phục vụ
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-[#dfe5dc] text-[#718077] dark:border-border dark:bg-muted/40 dark:text-muted-foreground"
          >
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
            className="h-8 gap-1 border-[#cbd8ce] bg-white px-2.5 text-xs text-[#1f5a45] hover:bg-[#e7eee3] dark:border-border dark:bg-card dark:text-emerald-400 dark:hover:bg-muted"
            title="Quản lý bản sao"
          >
            <BookCopy className="size-3.5" /> Bản sao ({item.totalCopies})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="size-8 p-0 text-[#718077] hover:text-[#1f5a45] dark:text-muted-foreground dark:hover:text-emerald-400"
            title="Chỉnh sửa thông tin"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteBook(item)}
            className="size-8 p-0 text-[#718077] hover:text-[#b43428] dark:text-muted-foreground dark:hover:text-rose-400"
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
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
            Quản lý Đầu sách &amp; Bản sao
          </h1>
          <p className="mt-1 text-sm text-[#718077] dark:text-muted-foreground">
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
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs dark:border-border dark:bg-card">
          <p className="text-xs text-[#718077] dark:text-muted-foreground">
            Tổng số đầu sách
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#1f3b2b] dark:text-foreground">
            {totalTitles}
          </p>
          <p className="text-[11px] text-[#56675c] dark:text-muted-foreground">
            Đầu mục đã đăng ký
          </p>
        </div>
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs dark:border-border dark:bg-card">
          <p className="text-xs text-[#718077] dark:text-muted-foreground">
            Tổng bản sao vật lý
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#1f3b2b] dark:text-foreground">
            {totalCopiesCount}
          </p>
          <p className="text-[11px] text-[#56675c] dark:text-muted-foreground">
            Cuốn sách đang quản lý
          </p>
        </div>
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs dark:border-border dark:bg-card">
          <p className="text-xs text-[#718077] dark:text-muted-foreground">
            Sẵn sàng cho mượn
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#246237] dark:text-emerald-400">
            {availableCopiesCount}
          </p>
          <p className="text-[11px] text-[#4e9661] dark:text-emerald-400">
            Sách nằm trên kệ
          </p>
        </div>
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs dark:border-border dark:bg-card">
          <p className="text-xs text-[#718077] dark:text-muted-foreground">
            Đang cho độc giả mượn
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#c27652] dark:text-orange-400">
            {borrowedCopiesCount}
          </p>
          <p className="text-[11px] text-[#b05828] dark:text-orange-400">
            Trong các phiếu mượn
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs md:flex-row md:items-center dark:border-border dark:bg-card">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-[#8b9a8f] dark:text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả hoặc ISBN..."
            className="h-9 border-[#cbd8ce] bg-white pl-9 dark:border-border dark:bg-muted/20 dark:text-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val ?? "Tất cả")}
          >
            <SelectTrigger className="h-9 w-40 border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground">
              <Filter className="mr-1 size-3.5 text-[#718077] dark:text-muted-foreground" />
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
            <SelectTrigger className="h-9 w-36 border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground">
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
      <CommonTable
        data={paginatedBooks}
        columns={columns}
        loading={loading}
        pagination={{
          page: currentPage,
          pageSize,
          total: filteredBooks.length,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrevious: currentPage > 1,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          previousPage: currentPage > 1 ? currentPage - 1 : null,
          onPageChange: setCurrentPage,
        }}
        summary={
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Hiển thị{" "}
              <strong>
                {filteredBooks.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
                {Math.min(currentPage * pageSize, filteredBooks.length)}
              </strong>{" "}
              trên tổng số <strong>{filteredBooks.length}</strong> đầu sách
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-muted-foreground">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="rounded border border-[#cbd8ce] bg-white px-2 py-0.5 text-xs text-foreground dark:border-border dark:bg-card"
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
              </select>
            </div>
          </div>
        }
        emptyMessage={
          <div className="py-12 text-center text-sm text-[#718077] dark:text-muted-foreground">
            <BookOpen className="mx-auto mb-2 size-8 text-[#cbd8ce] dark:text-muted-foreground" />
            Không tìm thấy đầu sách nào phù hợp.
          </div>
        }
      />

      {/* Modal: Thêm / Sửa đầu sách */}
      <AppDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        title={
          <div className="flex items-center gap-2 text-lg font-semibold text-[#1f3b2b] dark:text-foreground">
            <BookOpen className="size-5 text-[#1f5a45] dark:text-emerald-400" />
            {editingBook
              ? "Cập nhật đầu sách"
              : "Thêm mới đầu sách vào thư viện"}
          </div>
        }
        description="Nhập thông tin chi tiết đầu mục sách theo chuẩn thư viện Mộc Miên."
        className="max-h-[90vh] w-full overflow-y-auto sm:max-w-xl"
      >
        <form onSubmit={handleSubmitBook} className="mt-3 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Tên sách <span className="text-[#b43428]">*</span>
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ví dụ: Nghệ thuật tư duy rành mạch"
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Tác giả <span className="text-[#b43428]">*</span>
              </label>
              <Input
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Ví dụ: Rolf Dobelli"
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                  Mã ISBN <span className="text-[#b43428]">*</span>
                </label>
                {!editingBook && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isbn: generateRandomIsbn(),
                      }))
                    }
                    className="text-[11px] font-medium text-[#1f5a45] hover:underline dark:text-emerald-400"
                  >
                    Tạo lại mã khác
                  </button>
                )}
              </div>
              <Input
                required
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="Ví dụ: 978-604-1-1234-5"
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Thể loại <span className="text-[#b43428]">*</span>
              </label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val ?? "" })
                }
              >
                <SelectTrigger className="mt-1 w-full border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground">
                  <SelectValue placeholder="Chọn thể loại trong danh mục..." />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Nhà xuất bản
              </label>
              <Input
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                placeholder="Ví dụ: NXB Trẻ, NXB Kim Đồng..."
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Năm xuất bản <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                max={new Date().getFullYear()}
                min={1000}
                value={
                  formData.publicationYear === 0 || !formData.publicationYear
                    ? ""
                    : formData.publicationYear
                }
                onChange={(e) => {
                  const val = e.target.value
                  setFormData({
                    ...formData,
                    publicationYear:
                      val === "" ? ("" as unknown as number) : Number(val),
                  })
                }}
                placeholder={`Ví dụ: ${new Date().getFullYear()}`}
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
              {Number(formData.publicationYear) > new Date().getFullYear() && (
                <p className="mt-1 text-xs text-rose-500">
                  Năm xuất bản không được lớn hơn năm hiện tại (
                  {new Date().getFullYear()}).
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Số trang
              </label>
              <Input
                type="number"
                min={1}
                value={
                  formData.pageCount === 0 || !formData.pageCount
                    ? ""
                    : formData.pageCount
                }
                onChange={(e) => {
                  const val = e.target.value
                  setFormData({
                    ...formData,
                    pageCount:
                      val === "" ? ("" as unknown as number) : Number(val),
                  })
                }}
                placeholder="Ví dụ: 200"
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Giá sách / Giá bìa (VNĐ)
              </label>
              <Input
                type="number"
                min={0}
                value={
                  formData.price === 0 || !formData.price ? "" : formData.price
                }
                onChange={(e) => {
                  const val = e.target.value
                  setFormData({
                    ...formData,
                    price: val === "" ? ("" as unknown as number) : Number(val),
                  })
                }}
                placeholder="Ví dụ: 85000"
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#56675c] dark:text-muted-foreground">
                Tóm tắt / Mô tả nội dung
              </label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả ngắn về chủ đề và nội dung cuốn sách..."
                className="mt-1 border-[#cbd8ce] dark:border-border dark:bg-muted/20 dark:text-foreground"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-[#edf0eb] pt-4 dark:border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEditOpen(false)}
              className="border-[#cbd8ce] dark:border-border"
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
          <div className="flex items-center gap-2 text-lg font-semibold text-[#1f3b2b] dark:text-foreground">
            <Layers className="size-5 text-[#1f5a45] dark:text-emerald-400" />
            <span className="truncate">
              Bản sao:{" "}
              <span className="font-normal text-muted-foreground">
                {selectedBookForCopies?.title}
              </span>
            </span>
          </div>
        }
        description="Quản lý mã vạch barcode, giá trị và vị trí kệ sách của từng cuốn vật lý."
        className="max-h-[90vh] w-full overflow-y-auto sm:max-w-4xl"
      >
        <div className="mt-3 flex flex-col gap-5">
          {/* Quick stats badges */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <Badge variant="outline" className="border-border bg-background">
              Tổng số bản sao:{" "}
              <strong className="ml-1 text-foreground">
                {selectedBookForCopies?.totalCopies || 0}
              </strong>
            </Badge>
            <Badge
              variant="outline"
              className="border-emerald-700/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              Sẵn sàng:{" "}
              <strong className="ml-1">
                {selectedBookForCopies?.availableCopies || 0}
              </strong>
            </Badge>
            <Badge
              variant="outline"
              className="border-amber-700/30 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            >
              Đang mượn:{" "}
              <strong className="ml-1">
                {selectedBookForCopies?.borrowedCopies || 0}
              </strong>
            </Badge>
            <Badge variant="outline" className="border-border bg-background">
              Giá niêm yết:{" "}
              <strong className="ml-1 text-foreground">
                {(selectedBookForCopies?.price || 85000).toLocaleString(
                  "vi-VN"
                )}{" "}
                đ
              </strong>
            </Badge>
          </div>

          {/* List of Copies */}
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-2.5">Mã bản sao</th>
                  <th className="p-2.5">Mã vạch Barcode</th>
                  <th className="p-2.5">Vị trí & Kệ</th>
                  <th className="p-2.5">Giá nhập</th>
                  <th className="p-2.5">Tình trạng</th>
                  <th className="p-2.5">Trạng thái</th>
                  <th className="p-2.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(selectedBookForCopies?.copies || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-muted-foreground"
                    >
                      Chưa có bản sao nào trong kho cho đầu sách này. Vui lòng
                      thêm bản sao bên dưới.
                    </td>
                  </tr>
                ) : (
                  (selectedBookForCopies?.copies || []).map(
                    (copy: BookCopyItem) => (
                      <tr
                        key={copy.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="p-2.5 font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          {copy.id}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] font-semibold text-foreground">
                          {copy.barcode}
                        </td>
                        <td className="p-2.5">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="size-3 text-[#c27652]" />
                            {copy.shelfCode}{" "}
                            {copy.location ? `· ${copy.location}` : ""}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-foreground">
                          {copy.price.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-2.5">
                          {copy.conditionStatus === "Good" && (
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              Tốt
                            </span>
                          )}
                          {copy.conditionStatus === "SlightlyDamaged" && (
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                              Sờn nhẹ
                            </span>
                          )}
                          {copy.conditionStatus === "Damaged" && (
                            <span className="font-medium text-rose-600 dark:text-rose-400">
                              Hư hại
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          {copy.copyStatus === "Available" ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                              Có sẵn
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-orange-300 bg-orange-50 text-[10px] text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/40 dark:text-orange-300"
                            >
                              Đang mượn
                            </Badge>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {copy.copyStatus === "Available" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                              title="Xóa bản sao khỏi kho"
                              onClick={() => handleDeleteCopy(copy)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              Đang mượn
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Add New Copy Form */}
          <form
            onSubmit={handleAddCopy}
            className="rounded-xl border border-dashed border-border bg-muted/20 p-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Plus className="size-4 text-[#1f5a45] dark:text-emerald-400" />
              Thêm bản sao vật lý mới vào kho
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Mã vạch (Barcode) <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 flex gap-1.5">
                  <Input
                    required
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    placeholder="Quét mã vạch..."
                    className="h-8 border-border bg-background font-mono text-xs text-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 border-border px-2 text-[11px]"
                    onClick={() =>
                      setNewBarcode(`893${Date.now().toString().slice(-9)}`)
                    }
                    title="Tạo mã vạch ngẫu nhiên mới"
                  >
                    Tạo mã
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Vị trí kệ sách
                </label>
                <Input
                  value={newShelf}
                  onChange={(e) => setNewShelf(e.target.value)}
                  placeholder="Kệ A-01, Kệ B-02..."
                  className="mt-1 h-8 border-border bg-background text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Khu vực / Tầng
                </label>
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Khu A - Tầng 1..."
                  className="mt-1 h-8 border-border bg-background text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Giá nhập / Định giá (VNĐ)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={newPrice === 0 ? "" : newPrice}
                  onChange={(e) =>
                    setNewPrice(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  placeholder="Ví dụ: 85000"
                  className="mt-1 h-8 border-border bg-background text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Tình trạng vật lý ban đầu
                </label>
                <Select
                  value={newCondition}
                  onValueChange={(val) => {
                    if (val) {
                      setNewCondition(
                        val as "Good" | "SlightlyDamaged" | "Damaged"
                      )
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 h-8 border-border bg-background text-xs text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Tốt (Good)</SelectItem>
                    <SelectItem value="SlightlyDamaged">
                      Sờn nhẹ (Slightly Damaged)
                    </SelectItem>
                    <SelectItem value="Damaged">Hư hại (Damaged)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 w-full bg-[#1f5a45] text-xs text-white hover:bg-[#174735]"
                >
                  <Plus className="mr-1 size-3.5" /> Lưu bản sao vào kho
                </Button>
              </div>
            </div>
          </form>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
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
