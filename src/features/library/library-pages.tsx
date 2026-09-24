import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  CreditCard,
  Filter,
  Heart,
  KeyRound,
  Library,
  LogOut,
  MapPin,
  Pencil,
  Save,
  Search,
  Sparkles,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import {
  publicBooksService,
  type PublicBook,
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

const fallbackBooks: PublicBook[] = [
  {
    id: "nam-phia-sau",
    title: "Năm phía sau",
    author: "Erling Kagge",
    category: "Khám phá",
    description:
      "Một cuốn sách nhỏ về nghệ thuật tìm thấy khoảng lặng và những điều thật sự quan trọng trong đời sống hiện đại.",
    color: "#d9e6d1",
    available: 4,
  },
  {
    id: "nha-gia-kim",
    title: "Nhà giả kim",
    author: "Paulo Coelho",
    category: "Văn học",
    description:
      "Hành trình theo đuổi kho báu và lắng nghe tiếng gọi của ước mơ, một câu chuyện đã truyền cảm hứng cho hàng triệu độc giả.",
    color: "#ead7b4",
    available: 2,
  },
  {
    id: "su-im-lang",
    title: "Sức mạnh của sự im lặng",
    author: "Susan Cain",
    category: "Tâm lý",
    description:
      "Một góc nhìn sâu sắc về sức mạnh của những người hướng nội trong một thế giới luôn ưa chuộng sự ồn ào.",
    color: "#cbdde0",
    available: 6,
  },
  {
    id: "tuoi-tre-dang-gia",
    title: "Tuổi trẻ đáng giá bao nhiêu",
    author: "Rosie Nguyễn",
    category: "Phát triển bản thân",
    description:
      "Những gợi ý gần gũi để sống, học tập và làm việc có chủ đích hơn trong những năm tháng tuổi trẻ.",
    color: "#e6c8c2",
    available: 0,
  },
  {
    id: "muoi-nguoi-da-den",
    title: "Mười người da đen nhỏ",
    author: "Agatha Christie",
    category: "Trinh thám",
    description:
      "Một vụ án bí ẩn trên hòn đảo biệt lập, nơi từng người một biến mất theo một bài đồng dao đáng sợ.",
    color: "#d8d1df",
    available: 3,
  },
  {
    id: "thiet-ke-cuoc-doi",
    title: "Thiết kế cuộc đời",
    author: "Bill Burnett",
    category: "Kỹ năng",
    description:
      "Tư duy thiết kế giúp bạn thử nghiệm nhiều hướng đi và chủ động tạo ra một cuộc đời phù hợp.",
    color: "#d4dec1",
    available: 5,
  },
]

function usePublicBooks() {
  const [books, setBooks] = useState<PublicBook[]>(fallbackBooks)

  useEffect(() => {
    let cancelled = false
    publicBooksService
      .getAll()
      .then((data) => {
        if (!cancelled && data.length > 0) setBooks(data)
      })
      .catch(() => {
        // Keep the sample catalogue visible when the API is unavailable.
      })

    return () => {
      cancelled = true
    }
  }, [])

  return books
}

function BookCover({
  book,
  large = false,
}: {
  book: PublicBook
  large?: boolean
}) {
  return (
    <div
      className={`relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[3px] p-5 shadow-[8px_10px_0_rgba(23,35,29,0.08)] ${large ? "h-96 w-64" : "h-64 w-44"}`}
      style={{ backgroundColor: book.color }}
    >
      <div className="flex justify-between text-[10px] font-bold tracking-[0.22em] text-[#385145] uppercase">
        <span>Mộc Miên</span>
        <span>MM.01</span>
      </div>
      <div>
        <div className="mb-3 h-px w-9 bg-[#385145]" />
        <h3
          className={`${large ? "text-3xl" : "text-xl"} max-w-[10ch] leading-[1.05] font-semibold text-[#24382b]`}
        >
          {book.title}
        </h3>
        <p className="mt-3 text-xs text-[#385145]">{book.author}</p>
      </div>
      <BookOpen className="absolute -right-5 -bottom-5 size-28 rotate-12 text-[#385145]/10" />
    </div>
  )
}

function BookCard({ book }: { book: PublicBook }) {
  const navigate = useNavigate()
  return (
    <article className="group flex flex-col items-start">
      <Link to={`/books/${book.id}`} className="mb-4 w-full">
        <BookCover book={book} />
      </Link>
      <p className="mb-1 text-xs font-medium tracking-[0.14em] text-[#7b8b7f] uppercase">
        {book.category}
      </p>
      <Link
        to={`/books/${book.id}`}
        className="font-semibold hover:text-[#1f5a45]"
      >
        {book.title}
      </Link>
      <p className="mt-1 text-sm text-[#718077]">{book.author}</p>
      <Button
        variant="link"
        className="mt-2 h-auto p-0 text-[#1f5a45]"
        onClick={() => navigate(`/books/${book.id}`)}
      >
        Xem chi tiết <ArrowRight className="ml-1 size-3" />
      </Button>
    </article>
  )
}

export function HomePage() {
  const books = usePublicBooks()

  return (
    <div>
      <section className="border-b border-[#dfe5dc] bg-[#e7eee3] px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-[#6e826f] uppercase">
              <Sparkles className="size-4" /> Không gian đọc của bạn
            </p>
            <h1 className="max-w-2xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-[#1f3b2b] md:text-7xl">
              Mỗi cuốn sách mở ra một{" "}
              <span className="text-[#c27652]">góc nhìn mới.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#617067]">
              Khám phá bộ sưu tập được chọn lọc, mượn sách dễ dàng và giữ lại
              những câu chuyện bạn yêu thích.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/books"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1f5a45] px-2.5 text-sm font-medium text-white hover:bg-[#174735]"
              >
                Khám phá kho sách <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#b9cbbb] px-2.5 text-sm font-medium hover:bg-[#dce8d9]"
              >
                Tìm hiểu thư viện
              </Link>
            </div>
          </div>
          <div className="relative flex min-h-80 items-center justify-center">
            <div className="absolute h-64 w-64 rounded-full border border-[#b8cdb8]" />
            <div className="absolute h-80 w-80 rounded-full border border-[#c8d8c5]" />
            <div className="relative rotate-[-5deg]">
              <BookCover book={books[0]} large />
            </div>
            <div className="absolute bottom-5 left-4 rotate-[8deg] md:left-12">
              <BookCover book={books[1] ?? books[0]} />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
              Được yêu thích
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Gợi ý cho hôm nay
            </h2>
          </div>
          <Link
            to="/books"
            className="hidden items-center gap-1 text-sm font-semibold text-[#1f5a45] sm:flex"
          >
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-6 border-y border-[#dfe5dc] py-10 sm:grid-cols-3">
          <div>
            <Clock3 className="mb-4 size-5 text-[#c27652]" />
            <h3 className="font-semibold">Mượn trong 3 phút</h3>
            <p className="mt-2 text-sm leading-6 text-[#718077]">
              Tìm sách, đặt mượn và nhận tại quầy gần bạn.
            </p>
          </div>
          <div>
            <Library className="mb-4 size-5 text-[#c27652]" />
            <h3 className="font-semibold">Hơn 2.000 đầu sách</h3>
            <p className="mt-2 text-sm leading-6 text-[#718077]">
              Từ văn học, kỹ năng đến những chuyến du hành khám phá.
            </p>
          </div>
          <div>
            <MapPin className="mb-4 size-5 text-[#c27652]" />
            <h3 className="font-semibold">Một nơi để trở về</h3>
            <p className="mt-2 text-sm leading-6 text-[#718077]">
              Không gian yên tĩnh cho việc đọc, học và kết nối.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function BooksPage() {
  const books = usePublicBooks()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Tất cả")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<
    "featured" | "title" | "author" | "available"
  >("featured")
  const categories = ["Tất cả", ...new Set(books.map((book) => book.category))]
  const filteredBooks = useMemo(() => {
    const result = books.filter(
      (book) =>
        (category === "Tất cả" || book.category === category) &&
        (!availableOnly || book.available > 0) &&
        `${book.title} ${book.author}`
          .toLowerCase()
          .includes(query.toLowerCase())
    )

    return [...result].sort((first, second) => {
      if (sortBy === "title")
        return first.title.localeCompare(second.title, "vi")
      if (sortBy === "author")
        return first.author.localeCompare(second.author, "vi")
      if (sortBy === "available") return second.available - first.available
      return books.indexOf(first) - books.indexOf(second)
    })
  }, [availableOnly, books, category, query, sortBy])
  const activeFilterCount =
    (category !== "Tất cả" ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (sortBy !== "featured" ? 1 : 0)
  const clearFilters = () => {
    setCategory("Tất cả")
    setAvailableOnly(false)
    setSortBy("featured")
  }
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
          Thư viện trực tuyến
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Tìm cuốn sách tiếp theo
        </h1>
        <p className="mt-4 text-[#718077]">
          Tra cứu theo tên sách, tác giả hoặc chủ đề. Bạn có thể xem sách mà
          không cần đăng nhập.
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-3 border-b border-[#dfe5dc] pb-6 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 size-4 text-[#8b9a8f]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên sách hoặc tác giả..."
            className="h-10 border-[#cbd8ce] bg-white pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="justify-start border-[#cbd8ce] bg-transparent md:w-48"
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
            className="w-80 border-[#dfe5dc] bg-[#fffefb] p-4"
          >
            <PopoverHeader>
              <PopoverTitle className="text-base">Lọc và sắp xếp</PopoverTitle>
              <p className="text-xs text-[#718077]">
                Thu hẹp danh sách theo nhu cầu của bạn.
              </p>
            </PopoverHeader>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium">
                Thể loại
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value ?? "Tất cả")}
                >
                  <SelectTrigger className="mt-2 h-9 w-full border-[#cbd8ce] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={availableOnly}
                  onCheckedChange={(checked) =>
                    setAvailableOnly(checked === true)
                  }
                />
                Chỉ hiện sách đang có sẵn
              </label>
              <label className="block text-sm font-medium">
                Sắp xếp theo
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy((value ?? "featured") as typeof sortBy)
                  }
                >
                  <SelectTrigger className="mt-2 h-9 w-full border-[#cbd8ce] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Nổi bật</SelectItem>
                    <SelectItem value="title">Tên sách A - Z</SelectItem>
                    <SelectItem value="author">Tên tác giả A - Z</SelectItem>
                    <SelectItem value="available">
                      Còn nhiều bản nhất
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-3">
              <span className="text-xs text-[#718077]">
                {filteredBooks.length} kết quả
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="text-[#1f5a45]"
              >
                Xoá bộ lọc
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((item) => (
          <Button
            key={item}
            onClick={() => setCategory(item)}
            variant={category === item ? "default" : "outline"}
            size="sm"
            className={
              category === item
                ? "bg-[#1f5a45] text-white hover:bg-[#174735]"
                : "border-[#cbd8ce] bg-transparent"
            }
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      {filteredBooks.length === 0 && (
        <p className="py-20 text-center text-[#718077]">
          Không tìm thấy sách phù hợp.
        </p>
      )}
    </div>
  )
}

export function BookDetailPage() {
  const books = usePublicBooks()
  const { id } = useParams()
  const book = books.find((item) => item.id === id) ?? books[0]
  const { user } = useAuth()
  const navigate = useNavigate()
  const borrow = () =>
    navigate(user ? `/borrow/${book.id}` : "/login", {
      state: { from: `/borrow/${book.id}` },
    })
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <Link to="/books" className="text-sm font-medium text-[#1f5a45]">
        ← Quay lại kho sách
      </Link>
      <div className="mt-10 grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
        <BookCover book={book} large />
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            {book.category}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {book.title}
          </h1>
          <p className="mt-3 text-lg text-[#718077]">{book.author}</p>
          <p className="mt-8 max-w-xl leading-8 text-[#56675c]">
            {book.description}
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-[#617067]">
            <span
              className={`size-2 rounded-full ${book.available ? "bg-[#4e9661]" : "bg-[#c27652]"}`}
            />
            {book.available
              ? `${book.available} bản đang có sẵn`
              : "Hiện đang được mượn hết"}
          </div>
          <Button
            onClick={borrow}
            disabled={!book.available}
            size="lg"
            className="mt-8 bg-[#1f5a45] text-white hover:bg-[#174735]"
          >
            {user ? "Tiến hành mượn" : "Đăng nhập để mượn"}{" "}
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <button className="ml-4 inline-flex items-center gap-2 text-sm text-[#617067]">
            <Heart className="size-4" /> Lưu sách
          </button>
        </div>
      </div>
    </div>
  )
}

export function BorrowPage() {
  const books = usePublicBooks()
  const { id } = useParams()
  const book = books.find((item) => item.id === id) ?? books[0]
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
        Phiếu mượn sách
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Sẵn sàng mang sách về nhà?
      </h1>
      <div className="mt-10 flex flex-col gap-6 border-y border-[#dfe5dc] py-8 sm:flex-row sm:items-center">
        <BookCover book={book} />
        <div>
          <p className="text-xl font-semibold">{book.title}</p>
          <p className="mt-1 text-[#718077]">{book.author}</p>
          <div className="mt-6 space-y-3 text-sm text-[#617067]">
            <p className="flex gap-2">
              <Check className="size-4 text-[#4e9661]" /> Thời hạn mượn: 14 ngày
            </p>
            <p className="flex gap-2">
              <Check className="size-4 text-[#4e9661]" /> Nhận sách tại quầy Mộc
              Miên
            </p>
            <p className="flex gap-2">
              <Check className="size-4 text-[#4e9661]" /> Không có phí đặt trước
            </p>
          </div>
        </div>
      </div>
      <Button
        size="lg"
        className="mt-8 bg-[#1f5a45] text-white hover:bg-[#174735]"
      >
        Xác nhận yêu cầu mượn <ArrowRight className="ml-2 size-4" />
      </Button>
    </div>
  )
}

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<
    "overview" | "history" | "details" | "security"
  >("overview")
  const displayName =
    user?.fullName || user?.name || user?.username || "Người dùng"
  const [profile, setProfile] = useState({
    name: displayName,
    phone: "090 123 4567",
    identityNumber: "079203001234",
    studentId: "SV20240018",
    address: "Thành phố Hồ Chí Minh",
  })
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const navigationItems = [
    { id: "overview" as const, label: "Tổng quan", icon: UserRound },
    { id: "history" as const, label: "Lịch sử mượn trả", icon: BookOpen },
    { id: "details" as const, label: "Thông tin cá nhân", icon: Pencil },
    { id: "security" as const, label: "Bảo mật tài khoản", icon: KeyRound },
  ]

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
        Tài khoản của tôi
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Xin chào, {displayName}
      </h1>
      <p className="mt-3 max-w-2xl text-[#718077]">
        Quản lý thẻ thư viện, theo dõi những cuốn sách đang mượn và cập nhật
        thông tin cá nhân của bạn.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-[250px_1fr]">
        <aside className="h-fit border-y border-[#dfe5dc] py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#d9e6d1] text-[#1f5a45]">
              <UserRound />
            </div>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-[#718077]">
                {user?.roles?.includes("READER")
                  ? "Độc giả thư viện"
                  : (user?.roles?.[0] ?? "Thành viên")}{" "}
                · Đang hoạt động
              </p>
            </div>
          </div>
          <div className="mt-7 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeView === item.id ? "bg-[#e7eee3] text-[#1f5a45]" : "text-[#718077] hover:bg-[#f0f4ed] hover:text-[#1f5a45]"}`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
          <Button
            variant="ghost"
            className="mt-7 gap-2 px-3 text-[#c27652] hover:text-[#a95e3d]"
            onClick={async () => {
              await logout()
              navigate("/")
            }}
          >
            <LogOut className="size-4" /> Đăng xuất
          </Button>
        </aside>
        <section className="min-w-0">
          {activeView === "overview" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="border border-[#dfe5dc] bg-white p-5">
                  <p className="text-sm text-[#718077]">Đang mượn</p>
                  <p className="mt-3 text-3xl font-semibold">0 / 5</p>
                  <p className="mt-2 text-xs text-[#4e9661]">
                    Còn hạn mức mượn
                  </p>
                </div>
                <div className="border border-[#dfe5dc] bg-white p-5">
                  <p className="text-sm text-[#718077]">Đã hoàn thành</p>
                  <p className="mt-3 text-3xl font-semibold">12</p>
                  <p className="mt-2 text-xs text-[#718077]">
                    Cuốn sách đã đọc
                  </p>
                </div>
                <div className="border border-[#dfe5dc] bg-white p-5">
                  <p className="text-sm text-[#718077]">Khoản phạt</p>
                  <p className="mt-3 text-3xl font-semibold">0 đ</p>
                  <p className="mt-2 text-xs text-[#4e9661]">
                    Không có khoản cần thanh toán
                  </p>
                </div>
              </div>
              <div className="border border-[#dfe5dc] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.12em] text-[#c27652] uppercase">
                      Thẻ thư viện
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Thẻ độc giả điện tử
                    </h2>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e7eee3] px-3 py-1 text-xs font-medium text-[#4e9661]">
                    <ShieldCheck className="size-3.5" /> Đang hoạt động
                  </span>
                </div>
                <div className="mt-6 grid gap-5 border-t border-[#edf0eb] pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-[#718077]">Mã độc giả</p>
                    <p className="mt-1 font-medium">
                      MM-
                      {user?.accountId
                        ? String(user.accountId).padStart(4, "0")
                        : (user?.id ?? "0002")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#718077]">Nhóm độc giả</p>
                    <p className="mt-1 font-medium">
                      {user?.roles?.includes("READER")
                        ? "Độc giả"
                        : user?.roles?.join(", ") || "Học sinh - sinh viên"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#718077]">Có hiệu lực đến</p>
                    <p className="mt-1 font-medium">31/12/2026</p>
                  </div>
                </div>
              </div>
              <div className="border border-[#dfe5dc] bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Sách đang mượn</h2>
                  <button
                    type="button"
                    onClick={() => setActiveView("history")}
                    className="text-sm font-medium text-[#1f5a45]"
                  >
                    Xem lịch sử
                  </button>
                </div>
                <div className="mt-6 flex flex-col items-center justify-center border-t border-dashed border-[#dfe5dc] py-10 text-center text-sm text-[#718077]">
                  <BookOpen className="mb-3 size-6 text-[#b9cbbb]" />
                  Bạn chưa có sách đang mượn.
                  <Link to="/books" className="mt-3 font-medium text-[#1f5a45]">
                    Khám phá kho sách <ArrowRight className="inline size-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          {activeView === "history" && (
            <div className="border border-[#dfe5dc] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Lịch sử mượn trả</h2>
                  <p className="mt-1 text-sm text-[#718077]">
                    Theo dõi toàn bộ các giao dịch của bạn.
                  </p>
                </div>
                <BookOpen className="size-5 text-[#c27652]" />
              </div>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-140 text-left text-sm">
                  <thead className="border-y border-[#edf0eb] text-xs text-[#718077]">
                    <tr>
                      <th className="px-3 py-3 font-medium">Sách</th>
                      <th className="px-3 py-3 font-medium">Ngày mượn</th>
                      <th className="px-3 py-3 font-medium">Ngày trả</th>
                      <th className="px-3 py-3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-14 text-center text-[#718077]"
                      >
                        Chưa có giao dịch mượn trả nào.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeView === "details" && (
            <form
              className="border border-[#dfe5dc] bg-white p-6"
              onSubmit={(event) => {
                event.preventDefault()
                setProfileSaved(true)
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                  <p className="mt-1 text-sm text-[#718077]">
                    Thông tin này được dùng khi làm thủ tục tại quầy.
                  </p>
                </div>
                <CreditCard className="size-5 text-[#c27652]" />
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ["name", "Họ và tên"],
                    ["phone", "Số điện thoại"],
                    ["identityNumber", "Số CCCD"],
                    ["studentId", "Mã sinh viên / học sinh"],
                    ["address", "Địa chỉ"],
                  ] as const
                ).map(([field, label]) => (
                  <label
                    key={field}
                    className={field === "address" ? "sm:col-span-2" : ""}
                  >
                    <span className="mb-2 block text-sm font-medium">
                      {label}
                    </span>
                    <Input
                      value={profile[field]}
                      onChange={(event) => {
                        setProfileSaved(false)
                        setProfile((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }}
                      className="border-[#cbd8ce] bg-[#fbfcfa]"
                    />
                  </label>
                ))}
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium">
                    Tên đăng nhập / Email
                  </span>
                  <Input
                    value={user?.username ?? user?.email ?? ""}
                    readOnly
                    className="border-[#cbd8ce] bg-[#eef2ea] text-[#718077]"
                  />
                </label>
              </div>
              <div className="mt-8 flex items-center gap-4 border-t border-[#edf0eb] pt-5">
                <Button
                  type="submit"
                  className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]"
                >
                  <Save className="size-4" /> Lưu thay đổi
                </Button>
                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-[#4e9661]">
                    <Check className="size-4" /> Đã cập nhật thông tin
                  </span>
                )}
              </div>
            </form>
          )}
          {activeView === "security" && (
            <div className="space-y-5">
              <form
                className="border border-[#dfe5dc] bg-white p-6"
                onSubmit={(event) => {
                  event.preventDefault()
                  setPasswordSaved(true)
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
                    <p className="mt-1 text-sm text-[#718077]">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản.
                    </p>
                  </div>
                  <KeyRound className="size-5 text-[#c27652]" />
                </div>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-medium">
                      Mật khẩu hiện tại
                    </span>
                    <Input
                      type="password"
                      required
                      className="border-[#cbd8ce] bg-[#fbfcfa]"
                    />
                  </label>
                  <div />
                  <label>
                    <span className="mb-2 block text-sm font-medium">
                      Mật khẩu mới
                    </span>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      className="border-[#cbd8ce] bg-[#fbfcfa]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-medium">
                      Xác nhận mật khẩu mới
                    </span>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      className="border-[#cbd8ce] bg-[#fbfcfa]"
                    />
                  </label>
                </div>
                <div className="mt-8 flex items-center gap-4 border-t border-[#edf0eb] pt-5">
                  <Button
                    type="submit"
                    className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]"
                  >
                    <Save className="size-4" /> Cập nhật mật khẩu
                  </Button>
                  {passwordSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-[#4e9661]">
                      <Check className="size-4" /> Mật khẩu đã được cập nhật
                    </span>
                  )}
                </div>
              </form>
              <div className="flex gap-3 border border-[#ead9d1] bg-[#fffaf7] p-5 text-sm text-[#8b6657]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>
                  Không chia sẻ mật khẩu hoặc mã xác thực với bất kỳ ai, kể cả
                  người tự nhận là nhân viên thư viện.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
        Về Mộc Miên
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">
        Một thư viện được xây quanh thói quen đọc.
      </h1>
      <p className="mt-8 text-lg leading-8 text-[#617067]">
        Mộc Miên là không gian đọc dành cho mọi người. Chúng mình tin rằng việc
        tìm kiếm và mượn một cuốn sách nên nhẹ nhàng, rõ ràng và có chút niềm
        vui.
      </p>
    </div>
  )
}
