import { useEffect, useState } from "react"
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Layers,
  Plus,
  Users,
} from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { managerBooksService } from "@/services/manager-books"
import { adminUsersService } from "@/services/admin-users"
import { loansService, type BorrowSlipItem } from "@/services/loans"
import type { BookTitleItem } from "@/types/manager-books"

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName =
    user?.fullName || user?.name || user?.username || "Thủ thư"

  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState<BookTitleItem[]>([])
  const [readersCount, setReadersCount] = useState(0)
  const [recentLoans, setRecentLoans] = useState<BorrowSlipItem[]>([])

  useEffect(() => {
    let ignore = false
    async function loadStats() {
      try {
        const [booksData, readersData, loansData] = await Promise.all([
          managerBooksService.getAll(),
          adminUsersService.getUsers({ UserType: "READER" }),
          loansService.getAll({ pageSize: 5 }),
        ])
        if (!ignore) {
          setBooks(booksData)
          setReadersCount(readersData.length)
          setRecentLoans(loansData.slice(0, 5))
        }
      } catch (err) {
        console.error("Dashboard stats error:", err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void loadStats()
    return () => {
      ignore = true
    }
  }, [])

  const totalTitles = books.length
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0)
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0)
  const borrowedCopies = books.reduce((acc, b) => acc + b.borrowedCopies, 0)
  const activeLoansCount = recentLoans.filter((l) => l.slipStatus === "BORROWING").length

  const stats = [
    {
      title: "Tổng đầu sách",
      value: loading ? "..." : String(totalTitles),
      subtext: `${totalCopies} bản sao trong kho`,
      icon: BookOpen,
      color: "text-[#1f5a45] dark:text-emerald-400",
      bg: "bg-[#e7eee3] dark:bg-emerald-950/40",
    },
    {
      title: "Độc giả trong hệ thống",
      value: loading ? "..." : String(readersCount),
      subtext: "Đã đăng ký tài khoản DB",
      icon: Users,
      color: "text-[#c27652] dark:text-orange-400",
      bg: "bg-[#faeee7] dark:bg-orange-950/40",
    },
    {
      title: "Bản sao sẵn sàng",
      value: loading ? "..." : String(availableCopies),
      subtext: "Sẵn sàng cho độc giả mượn",
      icon: Layers,
      color: "text-[#246237] dark:text-emerald-400",
      bg: "bg-[#edf6ef] dark:bg-emerald-950/40",
    },
    {
      title: "Sách đang cho mượn",
      value: loading ? "..." : String(borrowedCopies || activeLoansCount),
      subtext: "Đang lưu hành ngoài thư viện",
      icon: ArrowLeftRight,
      color: "text-[#3b6b88] dark:text-sky-400",
      bg: "bg-[#e5f0f6] dark:bg-sky-950/40",
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#cbd8ce] bg-gradient-to-br from-[#edf4ea] to-[#f7f9f6] p-6 sm:flex-row sm:items-center sm:justify-between dark:border-border dark:from-muted/40 dark:to-muted/10">
        <div>
          <span className="rounded-full bg-[#1f5a45] px-2.5 py-0.5 text-[11px] font-medium text-white">
            Hệ thống Quản lý Thư viện BookMI
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1f3b2b] sm:text-3xl dark:text-foreground">
            Xin chào, {displayName}!
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#56675c] dark:text-muted-foreground">
            Chào mừng bạn đến với trang quản trị thư viện. Toàn bộ dữ liệu dưới đây
            được kết nối và đồng bộ trực tiếp từ cơ sở dữ liệu SQL Server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => navigate("/dashboard/books")}
            className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]"
          >
            <Plus className="size-4" /> Thêm sách mới
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/loans")}
            className="border-[#cbd8ce] bg-white text-[#1f3b2b] hover:bg-[#e7eee3] dark:border-border dark:bg-card dark:text-foreground"
          >
            Lập phiếu mượn
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xs dark:border-border dark:bg-card"
            >
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
              >
                <Icon className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#718077] dark:text-muted-foreground">
                  {item.title}
                </p>
                <p className="text-2xl font-bold tracking-tight text-[#1f3b2b] dark:text-foreground">
                  {item.value}
                </p>
                <p className="truncate text-[11px] text-[#56675c] dark:text-muted-foreground">
                  {item.subtext}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid: Recent Loans & Recent Books */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Loans */}
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-5 shadow-xs lg:col-span-2 dark:border-border dark:bg-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#edf0eb] dark:border-border">
            <div>
              <h2 className="text-base font-semibold text-[#1f3b2b] dark:text-foreground">
                Lượt mượn sách gần đây
              </h2>
              <p className="text-xs text-[#718077] dark:text-muted-foreground">
                Các phiếu mượn mới nhất ghi nhận từ cơ sở dữ liệu
              </p>
            </div>
            <Link
              to="/dashboard/loans"
              className="text-xs font-medium text-[#1f5a45] hover:underline dark:text-emerald-400"
            >
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#f0f3ee] dark:divide-border/60">
            {recentLoans.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Chưa có dữ liệu phiếu mượn trong database.
              </p>
            ) : (
              recentLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#1f5a45] dark:text-emerald-400">
                        {loan.borrowSlipCode}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {loan.readerName}
                      </span>
                    </div>
                    <p className="text-xs text-[#718077] dark:text-muted-foreground">
                      Mượn: {new Date(loan.borrowDate).toLocaleDateString("vi-VN")} · Hạn trả:{" "}
                      {new Date(loan.dueDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    {loan.slipStatus === "BORROWING" && (
                      <Badge
                        variant="outline"
                        className="border-[#f3d9ca] bg-[#fdf3ec] text-[#b05828] text-[10px]"
                      >
                        <Clock3 className="mr-1 size-3" /> Đang mượn
                      </Badge>
                    )}
                    {loan.slipStatus === "RETURNED" && (
                      <Badge
                        variant="outline"
                        className="border-[#cce1d2] bg-[#edf6ef] text-[#246237] text-[10px]"
                      >
                        <CheckCircle2 className="mr-1 size-3" /> Đã hoàn trả
                      </Badge>
                    )}
                    {loan.slipStatus === "OVERDUE" && (
                      <Badge
                        variant="outline"
                        className="border-rose-300 bg-rose-50 text-rose-600 text-[10px]"
                      >
                        Quá hạn
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Books */}
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-5 shadow-xs dark:border-border dark:bg-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#edf0eb] dark:border-border">
            <div>
              <h2 className="text-base font-semibold text-[#1f3b2b] dark:text-foreground">
                Đầu sách mới cập nhật
              </h2>
              <p className="text-xs text-[#718077] dark:text-muted-foreground">
                Sách mới nhất trong hệ thống
              </p>
            </div>
            <Link
              to="/dashboard/books"
              className="text-xs font-medium text-[#1f5a45] hover:underline dark:text-emerald-400"
            >
              Quản lý &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#f0f3ee] dark:divide-border/60">
            {books.slice(0, 5).map((book) => (
              <div key={book.id} className="py-3">
                <p className="truncate text-xs font-semibold text-[#1f3b2b] dark:text-foreground">
                  {book.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#718077] dark:text-muted-foreground">
                  <span>{book.author}</span>
                  <span className="font-medium text-[#246237] dark:text-emerald-400">
                    {book.availableCopies} / {book.totalCopies} sẵn sàng
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#edf0eb] dark:border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/books")}
              className="w-full text-xs"
            >
              Xem toàn bộ kho sách ({books.length} đầu sách)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverviewPage
