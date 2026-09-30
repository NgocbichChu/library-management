import { useEffect, useState } from "react"
import { ChevronDown, Filter, Search } from "lucide-react"
import {
  publicBooksService,
  type PublicBook,
  type PublicBookCategory,
} from "@/services/public-books"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookCard } from "./library-shared"

export function BooksPage() {
  const [books, setBooks] = useState<PublicBook[]>([])
  const [categories, setCategories] = useState<PublicBookCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Tất cả")
  const [publicationYear, setPublicationYear] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<
    | "Mới xuất bản"
    | "Tên sách A - Z"
    | "Tên tác giả A - Z"
    | "Còn nhiều bản nhất"
  >("Mới xuất bản")
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const pageSize = 20

  useEffect(() => {
    let cancelled = false
    publicBooksService
      .getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch(() => {
        // Categories are optional for the public catalogue.
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      setIsLoading(true)
      setError(null)
      publicBooksService
        .search({
          keyword: query.trim() || undefined,
          categoryId: category === "Tất cả" ? undefined : Number(category),
          publicationYear: publicationYear
            ? Number(publicationYear)
            : undefined,
          availableOnly: availableOnly || undefined,
          pageNumber: page,
          pageSize,
          sortBy:
            sortBy === "Mới xuất bản"
              ? "PublicationYear"
              : sortBy === "Tên sách A - Z"
              ? "Title"
              : sortBy === "Tên tác giả A - Z"
                ? "Author"
                : sortBy === "Còn nhiều bản nhất"
                  ? "AvailableCopies"
                  : undefined,
          sortDirection:
            sortBy === "Mới xuất bản" ||
            sortBy === "Còn nhiều bản nhất"
              ? "desc"
              : sortBy === "Tên sách A - Z" || sortBy === "Tên tác giả A - Z"
              ? "asc"
                : undefined,
        })
        .then((result) => {
          if (cancelled) return
          setBooks(result.books)
          setTotalRecords(result.totalRecords)
          setHasNextPage(result.hasNextPage)
          setError(null)
          setIsLoading(false)
        })
        .catch((cause: unknown) => {
          if (cancelled) return
          setBooks([])
          setTotalRecords(0)
          setHasNextPage(false)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải danh sách sách."
          )
          setIsLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [availableOnly, category, page, publicationYear, query, sortBy])

  const activeFilterCount =
    (category !== "Tất cả" ? 1 : 0) +
    (publicationYear ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (sortBy !== "Mới xuất bản" ? 1 : 0)
  const clearFilters = () => {
    setCategory("Tất cả")
    setPublicationYear("")
    setAvailableOnly(false)
    setSortBy("Mới xuất bản")
    setPage(1)
  }
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
          Thư viện trực tuyến
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f3b2b] md:text-5xl dark:text-foreground">
          Tìm cuốn sách tiếp theo
        </h1>
        <p className="mt-4 text-[#718077] dark:text-muted-foreground">
          Tra cứu theo tên sách, tác giả hoặc chủ đề. Bạn có thể xem sách mà
          không cần đăng nhập.
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-3 border-b border-[#dfe5dc] pb-6 md:flex-row dark:border-border">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 size-4 text-[#8b9a8f] dark:text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Tìm tên sách hoặc tác giả..."
            className="h-10 border-[#cbd8ce] bg-white pl-9 dark:border-border dark:bg-card dark:text-foreground"
          />
        </div>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="justify-start border-[#cbd8ce] bg-transparent md:w-48 dark:border-border dark:text-foreground"
              />
            }
          >
            <Filter className="mr-2 size-4" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#1f5a45] text-[11px] text-white">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className="ml-auto size-4" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 border-[#dfe5dc] bg-[#fffefb] p-4 dark:border-border dark:bg-card"
          >
            <PopoverHeader>
              <PopoverTitle className="text-base text-[#1f3b2b] dark:text-foreground">
                Lọc và sắp xếp
              </PopoverTitle>
              <p className="text-xs text-[#718077] dark:text-muted-foreground">
                Thu hẹp danh sách theo nhu cầu của bạn.
              </p>
            </PopoverHeader>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
                Thể loại
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value ?? "Tất cả")
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="mt-2 h-9 w-full border-[#cbd8ce] bg-white dark:border-border dark:bg-muted/40 dark:text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tất cả">Tất cả</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
                Năm xuất bản
                <Input
                  type="number"
                  min="0"
                  value={publicationYear}
                  onChange={(event) => {
                    setPublicationYear(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Ví dụ: 2024"
                  className="mt-2 h-9 border-[#cbd8ce] bg-white dark:border-border dark:bg-muted/40 dark:text-foreground"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#1f3b2b] dark:text-foreground">
                <Checkbox
                  checked={availableOnly}
                  onCheckedChange={(checked) => {
                    setAvailableOnly(checked === true)
                    setPage(1)
                  }}
                />
                Chỉ hiện sách đang có sẵn
              </label>
              <label className="block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
                Sắp xếp theo
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy((value ?? "Mới xuất bản") as typeof sortBy)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="mt-2 h-9 w-full border-[#cbd8ce] bg-white dark:border-border dark:bg-muted/40 dark:text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mới xuất bản">Mới xuất bản</SelectItem>
                    <SelectItem value="Tên sách A - Z">
                      Tên sách A - Z
                    </SelectItem>
                    <SelectItem value="Tên tác giả A - Z">
                      Tên tác giả A - Z
                    </SelectItem>
                    <SelectItem value="Còn nhiều bản nhất">
                      Còn nhiều bản nhất
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-3 dark:border-border">
              <span className="text-xs text-[#718077] dark:text-muted-foreground">
                {totalRecords} kết quả
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="text-[#1f5a45] dark:text-emerald-400"
              >
                Xoá bộ lọc
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setCategory("Tất cả")
            setPage(1)
          }}
          variant={category === "Tất cả" ? "default" : "outline"}
          size="sm"
          className={
            category === "Tất cả"
              ? "bg-[#1f5a45] text-white hover:bg-[#174735]"
              : "border-[#cbd8ce] bg-transparent dark:border-border dark:text-foreground"
          }
        >
          Tất cả
        </Button>
        {categories.map((item) => (
          <Button
            key={item.id}
            onClick={() => {
              setCategory(String(item.id))
              setPage(1)
            }}
            variant={category === String(item.id) ? "default" : "outline"}
            size="sm"
            className={
              category === String(item.id)
                ? "bg-[#1f5a45] text-white hover:bg-[#174735]"
                : "border-[#cbd8ce] bg-transparent dark:border-border dark:text-foreground"
            }
          >
            {item.name}
          </Button>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      {books.length === 0 && (
        <p
          role={error ? "alert" : undefined}
          className="py-20 text-center text-[#718077] dark:text-muted-foreground"
        >
          {isLoading
            ? "Đang tải danh sách sách..."
            : (error ?? "Không tìm thấy sách phù hợp.")}
        </p>
      )}
      {(page > 1 || hasNextPage) && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Trang trước
          </Button>
          <span className="text-sm text-[#718077] dark:text-muted-foreground">
            Trang {page}
          </span>
          <Button
            variant="outline"
            disabled={!hasNextPage}
            onClick={() => setPage((current) => current + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}

