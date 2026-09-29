import { useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CreditCard,
  Heart,
  KeyRound,
  LogOut,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookCover } from "./library-shared"
import { usePublicBooks } from "./library-data"
export function BookDetailPage() {
  const { books, isLoading, error } = usePublicBooks()
  const { id } = useParams()
  const book = books.find((item) => item.id === id)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!book) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-20 text-center text-[#718077] dark:text-muted-foreground">
        {isLoading
          ? "Đang tải thông tin sách..."
          : (error ?? "Không tìm thấy sách.")}
      </div>
    )
  }

  const borrow = () =>
    navigate(user ? `/borrow/${book.id}` : "/login", {
      state: { from: `/borrow/${book.id}` },
    })
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <Link
        to="/books"
        className="text-sm font-medium text-[#1f5a45] dark:text-emerald-400"
      >
        ← Quay lại kho sách
      </Link>
      <div className="mt-10 grid gap-12 md:grid-cols-[280px_1fr] md:items-start">
        <BookCover book={book} large />
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            {book.category}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f3b2b] md:text-5xl dark:text-foreground">
            {book.title}
          </h1>
          <p className="mt-3 text-lg text-[#718077] dark:text-muted-foreground">
            {book.author}
          </p>
          <p className="mt-8 max-w-xl leading-8 text-[#56675c] dark:text-muted-foreground">
            {book.description}
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-[#617067] dark:text-muted-foreground">
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
          <button className="ml-4 inline-flex items-center gap-2 text-sm text-[#617067] dark:text-muted-foreground">
            <Heart className="size-4" /> Lưu sách
          </button>
        </div>
      </div>
    </div>
  )
}

export function BorrowPage() {
  const { books, isLoading, error } = usePublicBooks()
  const { id } = useParams()
  const book = books.find((item) => item.id === id)

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center text-[#718077] dark:text-muted-foreground">
        {isLoading
          ? "Đang tải thông tin sách..."
          : (error ?? "Không tìm thấy sách.")}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
        Phiếu mượn sách
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
        Sẵn sàng mang sách về nhà?
      </h1>
      <div className="mt-10 flex flex-col gap-6 border-y border-[#dfe5dc] py-8 sm:flex-row sm:items-center dark:border-border">
        <BookCover book={book} />
        <div>
          <p className="text-xl font-semibold text-[#1f3b2b] dark:text-foreground">
            {book.title}
          </p>
          <p className="mt-1 text-[#718077] dark:text-muted-foreground">
            {book.author}
          </p>
          <div className="mt-6 space-y-3 text-sm text-[#617067] dark:text-muted-foreground">
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
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
        Xin chào, {displayName}
      </h1>
      <p className="mt-3 max-w-2xl text-[#718077] dark:text-muted-foreground">
        Quản lý thẻ thư viện, theo dõi những cuốn sách đang mượn và cập nhật
        thông tin cá nhân của bạn.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-[250px_1fr]">
        <aside className="h-fit border-y border-[#dfe5dc] py-5 dark:border-border">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#d9e6d1] text-[#1f5a45] dark:bg-emerald-950/50 dark:text-emerald-300">
              <UserRound />
            </div>
            <div>
              <p className="font-semibold text-[#1f3b2b] dark:text-foreground">
                {displayName}
              </p>
              <p className="text-sm text-[#718077] dark:text-muted-foreground">
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
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeView === item.id ? "bg-[#e7eee3] text-[#1f5a45] dark:bg-emerald-950/50 dark:text-emerald-300" : "text-[#718077] hover:bg-[#f0f4ed] hover:text-[#1f5a45] dark:text-muted-foreground dark:hover:bg-muted/40 dark:hover:text-foreground"}`}
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
                <div className="border border-[#dfe5dc] bg-white p-5 dark:border-border dark:bg-card">
                  <p className="text-sm text-[#718077] dark:text-muted-foreground">
                    Đang mượn
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#1f3b2b] dark:text-foreground">
                    0 / 5
                  </p>
                  <p className="mt-2 text-xs text-[#4e9661] dark:text-emerald-400">
                    Còn hạn mức mượn
                  </p>
                </div>
                <div className="border border-[#dfe5dc] bg-white p-5 dark:border-border dark:bg-card">
                  <p className="text-sm text-[#718077] dark:text-muted-foreground">
                    Đã hoàn thành
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#1f3b2b] dark:text-foreground">
                    12
                  </p>
                  <p className="mt-2 text-xs text-[#718077] dark:text-muted-foreground">
                    Cuốn sách đã đọc
                  </p>
                </div>
                <div className="border border-[#dfe5dc] bg-white p-5 dark:border-border dark:bg-card">
                  <p className="text-sm text-[#718077] dark:text-muted-foreground">
                    Khoản phạt
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#1f3b2b] dark:text-foreground">
                    0 đ
                  </p>
                  <p className="mt-2 text-xs text-[#4e9661] dark:text-emerald-400">
                    Không có khoản cần thanh toán
                  </p>
                </div>
              </div>
              <div className="border border-[#dfe5dc] bg-white p-6 dark:border-border dark:bg-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.12em] text-[#c27652] uppercase">
                      Thẻ thư viện
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-[#1f3b2b] dark:text-foreground">
                      Thẻ độc giả điện tử
                    </h2>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e7eee3] px-3 py-1 text-xs font-medium text-[#4e9661] dark:bg-emerald-950/40 dark:text-emerald-300">
                    <ShieldCheck className="size-3.5" /> Đang hoạt động
                  </span>
                </div>
                <div className="mt-6 grid gap-5 border-t border-[#edf0eb] pt-5 sm:grid-cols-3 dark:border-border">
                  <div>
                    <p className="text-xs text-[#718077] dark:text-muted-foreground">
                      Mã độc giả
                    </p>
                    <p className="mt-1 font-medium text-[#1f3b2b] dark:text-foreground">
                      MM-
                      {user?.accountId
                        ? String(user.accountId).padStart(4, "0")
                        : (user?.id ?? "0002")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#718077] dark:text-muted-foreground">
                      Nhóm độc giả
                    </p>
                    <p className="mt-1 font-medium text-[#1f3b2b] dark:text-foreground">
                      {user?.roles?.includes("READER")
                        ? "Độc giả"
                        : user?.roles?.join(", ") || "Học sinh - sinh viên"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#718077] dark:text-muted-foreground">
                      Có hiệu lực đến
                    </p>
                    <p className="mt-1 font-medium text-[#1f3b2b] dark:text-foreground">
                      31/12/2026
                    </p>
                  </div>
                </div>
              </div>
              <div className="border border-[#dfe5dc] bg-white p-6 dark:border-border dark:bg-card">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[#1f3b2b] dark:text-foreground">
                    Sách đang mượn
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveView("history")}
                    className="text-sm font-medium text-[#1f5a45] dark:text-emerald-400"
                  >
                    Xem lịch sử
                  </button>
                </div>
                <div className="mt-6 flex flex-col items-center justify-center border-t border-dashed border-[#dfe5dc] py-10 text-center text-sm text-[#718077] dark:border-border dark:text-muted-foreground">
                  <BookOpen className="mb-3 size-6 text-[#b9cbbb] dark:text-muted-foreground" />
                  Bạn chưa có sách đang mượn.
                  <Link
                    to="/books"
                    className="mt-3 font-medium text-[#1f5a45] dark:text-emerald-400"
                  >
                    Khám phá kho sách <ArrowRight className="inline size-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          {activeView === "history" && (
            <div className="border border-[#dfe5dc] bg-white p-6 dark:border-border dark:bg-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#1f3b2b] dark:text-foreground">
                    Lịch sử mượn trả
                  </h2>
                  <p className="mt-1 text-sm text-[#718077] dark:text-muted-foreground">
                    Theo dõi toàn bộ các giao dịch của bạn.
                  </p>
                </div>
                <BookOpen className="size-5 text-[#c27652]" />
              </div>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-140 text-left text-sm">
                  <thead className="border-y border-[#edf0eb] text-xs text-[#718077] dark:border-border dark:text-muted-foreground">
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
                        className="px-3 py-14 text-center text-[#718077] dark:text-muted-foreground"
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
              className="border border-[#dfe5dc] bg-white p-6 dark:border-border dark:bg-card"
              onSubmit={(event) => {
                event.preventDefault()
                setProfileSaved(true)
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#1f3b2b] dark:text-foreground">
                    Thông tin cá nhân
                  </h2>
                  <p className="mt-1 text-sm text-[#718077] dark:text-muted-foreground">
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
                    <span className="mb-2 block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
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
                      className="border-[#cbd8ce] bg-[#fbfcfa] dark:border-border dark:bg-muted/30 dark:text-foreground"
                    />
                  </label>
                ))}
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
                    Tên đăng nhập / Email
                  </span>
                  <Input
                    value={user?.username ?? user?.email ?? ""}
                    readOnly
                    className="border-[#cbd8ce] bg-[#eef2ea] text-[#718077] dark:border-border dark:bg-muted/50 dark:text-muted-foreground"
                  />
                </label>
              </div>
              <div className="mt-8 flex items-center gap-4 border-t border-[#edf0eb] pt-5 dark:border-border">
                <Button
                  type="submit"
                  className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]"
                >
                  <Save className="size-4" /> Lưu thay đổi
                </Button>
                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-[#4e9661] dark:text-emerald-400">
                    <Check className="size-4" /> Đã cập nhật thông tin
                  </span>
                )}
              </div>
            </form>
          )}
          {activeView === "security" && (
            <div className="space-y-5">
              <form
                className="border border-[#dfe5dc] bg-white p-6 dark:border-border dark:bg-card"
                onSubmit={(event) => {
                  event.preventDefault()
                  setPasswordSaved(true)
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#1f3b2b] dark:text-foreground">
                      Đổi mật khẩu
                    </h2>
                    <p className="mt-1 text-sm text-[#718077] dark:text-muted-foreground">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản.
                    </p>
                  </div>
                  <KeyRound className="size-5 text-[#c27652]" />
                </div>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
                      Mật khẩu hiện tại
                    </span>
                    <Input
                      type="password"
                      required
                      className="border-[#cbd8ce] bg-[#fbfcfa] dark:border-border dark:bg-muted/30 dark:text-foreground"
                    />
                  </label>
                  <div />
                  <label>
                    <span className="mb-2 block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
                      Mật khẩu mới
                    </span>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      className="border-[#cbd8ce] bg-[#fbfcfa] dark:border-border dark:bg-muted/30 dark:text-foreground"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-medium text-[#1f3b2b] dark:text-foreground">
                      Xác nhận mật khẩu mới
                    </span>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      className="border-[#cbd8ce] bg-[#fbfcfa] dark:border-border dark:bg-muted/30 dark:text-foreground"
                    />
                  </label>
                </div>
                <div className="mt-8 flex items-center gap-4 border-t border-[#edf0eb] pt-5 dark:border-border">
                  <Button
                    type="submit"
                    className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]"
                  >
                    <Save className="size-4" /> Cập nhật mật khẩu
                  </Button>
                  {passwordSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-[#4e9661] dark:text-emerald-400">
                      <Check className="size-4" /> Mật khẩu đã được cập nhật
                    </span>
                  )}
                </div>
              </form>
              <div className="flex gap-3 border border-[#ead9d1] bg-[#fffaf7] p-5 text-sm text-[#8b6657] dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
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

