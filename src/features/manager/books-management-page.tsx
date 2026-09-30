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
import { categoriesService } from "@/services/categories"
import { managerBooksService } from "@/services/manager-books"
import type { CategoryDto } from "@/api/categories"
import type {
  BookCopyItem,
  BookTitleItem,
  CreateBookTitleInput,
} from "@/types/manager-books"

export function BooksManagementPage() {
  const [books, setBooks] = useState<BookTitleItem[]>([])
  const [categoriesList, setCategoriesList] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookTitleItem | null>(null)
  const [isCopiesOpen, setIsCopiesOpen] = useState(false)
  const [selectedBookForCopies, setSelectedBookForCopies] =
    useState<BookTitleItem | null>(null)
  const [copiesList, setCopiesList] = useState<BookCopyItem[]>([])
  const [copiesLoading, setCopiesLoading] = useState(false)

  // Form state for Add/Edit
  const [formData, setFormData] = useState<CreateBookTitleInput>({
    title: "",
    subtitle: "",
    author: "",
    isbn: "",
    publisher: "NXB Trẻ",
    publicationYear: 2024,
    languageCode: "VIE",
    categoryId: 1,
    category: "Văn học",
    description: "",
    pageCount: 200,
    bookStatus: "Active",
  })

  // Form state for Add Copy
  const [newBarcode, setNewBarcode] = useState("")
  const [newShelf, setNewShelf] = useState("Kệ A-01")
  const [newLocation, setNewLocation] = useState("Khu A - Tầng 1")
  const [newPrice, setNewPrice] = useState(85000)

  // Load books and categories
  const refreshBooks = async () => {
    setLoading(true)
    try {
      const data = await managerBooksService.getAll(searchQuery || undefined)
      setBooks(data)
    } catch {
      toast.error("Không thể tải danh sách sách từ cơ sở dữ liệu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    // Fetch categories
    categoriesService
      .getAll()
      .then((cats) => {
        if (!ignore && cats.length > 0) {
          setCategoriesList(cats)
        }
      })
      .catch(() => {
        // Fallback default
      })

    // Fetch books
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
          toast.error("Không thể tải danh sách sách từ cơ sở dữ liệu.")
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

  // Category filter options
  const filterCategories = useMemo(() => {
    const namesFromApi = categoriesList.map((c) => c.categoryName)
    const namesFromBooks = books.map((b) => b.category)
    const unique = Array.from(new Set([...namesFromApi, ...namesFromBooks]))
    return ["Tất cả", ...unique]
  }, [categoriesList, books])

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
        statusFilter === "Tất cả" ||
        (statusFilter === "Active"
          ? book.bookStatus === "Active" || book.bookStatus === "ACTIVE"
          : book.bookStatus !== "Active" && book.bookStatus !== "ACTIVE")
      return matchQuery && matchCat && matchStatus
    })
  }, [books, searchQuery, categoryFilter, statusFilter])

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingBook(null)
    const defaultCat = categoriesList[0]
    setFormData({
      title: "",
      subtitle: "",
      author: "",
      isbn: `978-604-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1 + Math.random() * 9)}`,
      publisher: "NXB Trẻ",
      publicationYear: 2024,
      languageCode: "VIE",
      categoryId: defaultCat ? defaultCat.categoryId : 1,
      category: defaultCat ? defaultCat.categoryName : "Văn học",
      description: "",
      pageCount: 220,
      bookStatus: "Active",
    })
    setIsAddEditOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (book: BookTitleItem) => {
    const matchedCat =
      categoriesList.find((c) => c.categoryId === book.categoryId) ||
      categoriesList.find(
        (c) =>
          c.categoryName.toLowerCase() === (book.category || "").toLowerCase()
      ) ||
      categoriesList[0]

    setEditingBook(book)
    setFormData({
      title: book.title,
      subtitle: book.subtitle || "",
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      languageCode: book.languageCode,
      categoryId: matchedCat ? matchedCat.categoryId : book.categoryId || 1,
      category: matchedCat ? matchedCat.categoryName : book.category,
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
        setIsAddEditOpen(false)
        await refreshBooks()
      } else {
        const createdBook = await managerBooksService.create(formData)
        toast.success(`Đã thêm mới đầu sách "${formData.title}" thành công`)
        setIsAddEditOpen(false)
        // Ensure new book is placed at ROW 1 (index 0) immediately!
        setBooks((prev) => [createdBook, ...prev])
        setCurrentPage(1)
        // Also refresh background to synchronize with DB IDs
        void managerBooksService.getAll().then((data) => setBooks(data))
      }
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
      setBooks((prev) => prev.filter((b) => b.id !== book.id))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa đầu sách này."
      )
    }
  }

  // Open Copies Dialog
  const handleOpenCopies = async (book: BookTitleItem) => {
    setSelectedBookForCopies(book)
    setNewBarcode(`893${Date.now().toString().slice(-9)}`)
    setNewShelf("Kệ A-01")
    setNewLocation("Khu A - Tầng 1")
    setNewPrice(85000)
    setIsCopiesOpen(true)
    setCopiesLoading(true)

    try {
      const copies = await managerBooksService.getCopies(book.id)
      setCopiesList(copies)
    } catch {
      setCopiesList([])
    } finally {
      setCopiesLoading(false)
    }
  }

  // Add Copy
  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookForCopies || !newBarcode) return

    try {
      const addedCopy = await managerBooksService.addCopy(
        selectedBookForCopies.id,
        {
          barcode: newBarcode,
          location: newLocation,
          shelfCode: newShelf,
          price: newPrice,
          copyStatus: "AVAILABLE",
          conditionStatus: "Good",
        }
      )
      toast.success("Đã thêm bản sao mới vào kho thành công.")
      const updatedCopies = [addedCopy, ...copiesList]
      setCopiesList(updatedCopies)

      // Update book copies count in state
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBookForCopies.id
            ? {
                ...b,
                totalCopies: b.totalCopies + 1,
                availableCopies: b.availableCopies + 1,
              }
            : b
        )
      )
      setSelectedBookForCopies((prev) =>
        prev
          ? {
              ...prev,
              totalCopies: prev.totalCopies + 1,
              availableCopies: prev.availableCopies + 1,
            }
          : null
      )

      setNewBarcode(`893${Date.now().toString().slice(-9)}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể thêm bản sao."
      )
    }
  }

  // Delete Copy
  const handleDeleteCopy = async (copyId: string | number) => {
    if (!selectedBookForCopies) return
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản sao này?")) return

    try {
      await managerBooksService.deleteCopy(copyId)
      toast.success("Đã xóa bản sao thành công.")
      const updated = copiesList.filter((c) => c.id !== copyId)
      setCopiesList(updated)

      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBookForCopies.id
            ? {
                ...b,
                totalCopies: Math.max(0, b.totalCopies - 1),
                availableCopies: Math.max(0, b.availableCopies - 1),
              }
            : b
        )
      )
      setSelectedBookForCopies((prev) =>
        prev
          ? {
              ...prev,
              totalCopies: Math.max(0, prev.totalCopies - 1),
              availableCopies: Math.max(0, prev.availableCopies - 1),
            }
          : null
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa bản sao.")
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
          </p>
        </div>
      ),
    },
    {
      id: "inventory",
      header: "Bản sao trong kho",
      cell: (item) => (
        <div>
          {item.totalCopies === 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#718077] dark:text-muted-foreground">
                0 / 0 bản sao
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400">
                (Chưa nhập kho)
              </span>
            </div>
          ) : (
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
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (item) =>
        item.bookStatus === "Active" || item.bookStatus === "ACTIVE" ? (
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
            Nghiệp vụ Quản trị Thư viện
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
            Quản lý Đầu sách &amp; Bản sao
          </h1>
          <p className="mt-1 text-sm text-[#718077] dark:text-muted-foreground">
            Quản lý thông tin đầu sách, danh mục thể loại, mã vạch barcode và vị trí
            lưu trữ trong kho.
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
            Đầu mục đã đăng ký trong DB
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
            Cuốn sách trong kho
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
          {/* Dynamic Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val ?? "Tất cả")}
          >
            <SelectTrigger className="h-9 w-44 border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground">
              <Filter className="mr-1 size-3.5 text-[#718077] dark:text-muted-foreground" />
              <SelectValue placeholder="Thể loại">
                {categoryFilter === "Tất cả" ? "Tất cả thể loại" : categoryFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filterCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "Tất cả")}
          >
            <SelectTrigger className="h-9 w-36 border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground">
              <SelectValue placeholder="Trạng thái">
                {statusFilter === "Active"
                  ? "Đang phục vụ"
                  : statusFilter === "Discontinued"
                    ? "Ngừng lưu hành"
                    : "Tất cả trạng thái"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tất cả">Tất cả trạng thái</SelectItem>
              <SelectItem value="Active">Đang phục vụ</SelectItem>
              <SelectItem value="Discontinued">Ngừng lưu hành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table: Newest books appear at Row 1 */}
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
          <div className="flex items-center gap-2 pr-8 text-lg font-semibold text-[#1f3b2b] dark:text-foreground">
            <BookOpen className="size-5 shrink-0 text-[#1f5a45] dark:text-emerald-400" />
            <span>
              {editingBook
                ? "Cập nhật đầu sách"
                : "Thêm mới đầu sách vào thư viện"}
            </span>
          </div>
        }
        description="Nhập thông tin chi tiết đầu mục sách. Sách mới tạo sẽ xuất hiện ngay ở dòng đầu tiên."
        className="w-full sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto"
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

            {/* Dynamic Dropdown for Category */}
            <div>
              <label className="text-xs font-semibold text-[#56675c]">
                Thể loại sách <span className="text-[#b43428]">*</span>
              </label>
              {(() => {
                const currentCat =
                  categoriesList.find(
                    (c) => c.categoryId === formData.categoryId
                  ) ||
                  categoriesList.find(
                    (c) =>
                      c.categoryName.toLowerCase() ===
                      (formData.category || "").toLowerCase()
                  ) ||
                  categoriesList[0]
                const currentVal = currentCat
                  ? String(currentCat.categoryId)
                  : undefined
                const displayLabel = currentCat
                  ? `${currentCat.categoryName} (${currentCat.categoryCode})`
                  : "Chọn thể loại sách..."

                return (
                  <Select
                    value={currentVal}
                    onValueChange={(val) => {
                      const numVal = Number(val)
                      const matched = categoriesList.find(
                        (c) => c.categoryId === numVal
                      )
                      setFormData({
                        ...formData,
                        categoryId: numVal,
                        category: matched ? matched.categoryName : "Văn học",
                      })
                    }}
                  >
                    <SelectTrigger className="mt-1 h-9 w-full border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground">
                      <SelectValue placeholder="Chọn thể loại sách...">
                        {displayLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesList.map((cat) => (
                        <SelectItem
                          key={cat.categoryId}
                          value={String(cat.categoryId)}
                        >
                          {cat.categoryName} ({cat.categoryCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              })()}
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
          <div className="flex items-center gap-2 pr-8 text-lg font-semibold text-[#1f3b2b] dark:text-foreground">
            <Layers className="size-5 shrink-0 text-[#1f5a45] dark:text-emerald-400" />
            <span className="truncate">
              Bản sao cuốn sách: {selectedBookForCopies?.title}
            </span>
          </div>
        }
        description="Quản lý mã vạch barcode, giá trị và vị trí kệ sách của từng cuốn vật lý trong kho."
        className="w-full sm:max-w-4xl md:max-w-5xl max-h-[92vh] overflow-y-auto"
      >
        <div className="mt-3 flex flex-col gap-6">
          {/* List of Copies */}
          <div className="overflow-x-auto rounded-lg border border-[#dfe5dc] dark:border-border dark:bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#edf0eb] bg-[#f7f9f6] font-semibold text-[#718077] dark:border-border dark:bg-muted/40 dark:text-muted-foreground">
                <tr>
                  <th className="p-3 whitespace-nowrap">Mã bản sao</th>
                  <th className="p-3 whitespace-nowrap">Mã vạch Barcode</th>
                  <th className="p-3 whitespace-nowrap">Vị trí lưu trữ</th>
                  <th className="p-3 whitespace-nowrap">Giá nhập</th>
                  <th className="p-3 whitespace-nowrap">Tình trạng</th>
                  <th className="p-3 whitespace-nowrap">Trạng thái</th>
                  <th className="p-3 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3ee] dark:divide-border/60">
                {copiesLoading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Đang tải danh sách bản sao từ DB...
                    </td>
                  </tr>
                ) : copiesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Chưa có bản sao nào trong kho. Hãy nhập bản sao vật lý bên dưới.
                    </td>
                  </tr>
                ) : (
                  copiesList.map((copy: BookCopyItem) => (
                    <tr
                      key={copy.id}
                      className="hover:bg-[#fbfcfb] dark:hover:bg-muted/30"
                    >
                      <td className="p-3 font-mono text-[11px] font-medium text-[#1f5a45] dark:text-emerald-400 whitespace-nowrap">
                        {copy.id}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#17231d] dark:text-foreground whitespace-nowrap">
                        {copy.barcode}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-[#385145] dark:text-muted-foreground">
                          <MapPin className="size-3.5 text-[#c27652] shrink-0" />
                          {copy.shelfCode} ({copy.location})
                        </span>
                      </td>
                      <td className="p-3 font-medium text-foreground whitespace-nowrap">
                        {copy.price.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {copy.conditionStatus === "Good" && (
                          <span className="text-[#246237] dark:text-emerald-400">
                            Tốt
                          </span>
                        )}
                        {copy.conditionStatus === "SlightlyDamaged" && (
                          <span className="text-[#b05828] dark:text-orange-400">
                            Sờn nhẹ
                          </span>
                        )}
                        {copy.conditionStatus === "Damaged" && (
                          <span className="text-[#b83828] dark:text-rose-400">
                            Hư hại
                          </span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {copy.copyStatus === "Available" ? (
                          <Badge
                            variant="outline"
                            className="border-[#cce1d2] bg-[#edf6ef] text-[11px] text-[#246237] dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            Có sẵn
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-[#f3d9ca] bg-[#fdf3ec] text-[11px] text-[#b05828] dark:border-orange-800/40 dark:bg-orange-950/40 dark:text-orange-300"
                          >
                            Đang mượn
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCopy(copy.id)}
                          className="size-8 p-0 text-muted-foreground hover:text-rose-500"
                          title="Xóa bản sao"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add New Copy Form */}
          <form
            onSubmit={handleAddCopy}
            className="rounded-xl border border-dashed border-[#cbd8ce] bg-[#f7f9f6] p-4 dark:border-border dark:bg-muted/20"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1f3b2b] dark:text-foreground">
              <Plus className="size-4 text-[#1f5a45] dark:text-emerald-400" />{" "}
              Nhập bản sao vật lý mới vào kho SQL Server
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[11px] text-[#718077] dark:text-muted-foreground">
                  Mã vạch Barcode *
                </label>
                <Input
                  required
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  className="h-8 border-[#cbd8ce] bg-white font-mono text-xs dark:border-border dark:bg-muted/20 dark:text-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#718077] dark:text-muted-foreground">
                  Vị trí kệ sách
                </label>
                <Input
                  value={newShelf}
                  onChange={(e) => setNewShelf(e.target.value)}
                  placeholder="Kệ A-01..."
                  className="h-8 border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#718077] dark:text-muted-foreground">
                  Khu vực lưu trữ
                </label>
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Khu A - Tầng 1..."
                  className="h-8 border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#718077] dark:text-muted-foreground">
                  Giá nhập (VNĐ)
                </label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value) || 0)}
                  className="h-8 border-[#cbd8ce] bg-white text-xs dark:border-border dark:bg-muted/20 dark:text-foreground"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="h-8 bg-[#1f5a45] text-xs text-white hover:bg-[#174735]"
              >
                + Lưu bản sao vào kho
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-2 rounded-lg border border-[#dfe5dc] bg-white p-3 text-xs text-[#718077] dark:border-border dark:bg-card dark:text-muted-foreground">
            <AlertCircle className="size-4 shrink-0 text-[#c27652]" />
            <span>
              Bản sao khi nhập kho thành công sẽ có trạng thái <strong>Sẵn sàng (AVAILABLE)</strong> và tăng ngay lập tức số lượng bản sao trong kho của đầu sách.
            </span>
          </div>
        </div>
      </AppDialog>
    </div>
  )
}

export default BooksManagementPage
