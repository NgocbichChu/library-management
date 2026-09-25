import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  DollarSign,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName =
    user?.fullName || user?.name || user?.username || "Thủ thư"

  const stats = [
    {
      title: "Tổng đầu sách",
      value: "128",
      subtext: "1.420 bản sao trong kho",
      icon: BookOpen,
      color: "text-[#1f5a45] dark:text-emerald-400",
      bg: "bg-[#e7eee3] dark:bg-emerald-950/40",
    },
    {
      title: "Độc giả đang hoạt động",
      value: "856",
      subtext: "620 độc giả nhóm HSSV",
      icon: Users,
      color: "text-[#c27652] dark:text-orange-400",
      bg: "bg-[#faeee7] dark:bg-orange-950/40",
    },
    {
      title: "Lượt mượn đang diễn ra",
      value: "42",
      subtext: "38 đúng hạn · 4 quá hạn",
      icon: ArrowLeftRight,
      color: "text-[#3b6b88] dark:text-sky-400",
      bg: "bg-[#e5f0f6] dark:bg-sky-950/40",
    },
    {
      title: "Tiền phạt đã thu",
      value: "140.000 đ",
      subtext: "Còn nợ 40.000 đ",
      icon: DollarSign,
      color: "text-[#8b6657] dark:text-amber-400",
      bg: "bg-[#f5ede7] dark:bg-amber-950/40",
    },
  ]

  const recentLoans = [
    {
      id: "PM-2026-0041",
      reader: "Lê Minh Tuấn",
      readerCode: "SV20240018",
      isStudent: true,
      bookTitle: "Nhà giả kim",
      borrowDate: "10/09/2026",
      dueDate: "24/09/2026",
      status: "Borrowing",
      statusText: "Đang mượn",
    },
    {
      id: "PM-2026-0040",
      reader: "Nguyễn Thị Ngọc",
      readerCode: "079203004512",
      isStudent: false,
      bookTitle: "Năm phía sau",
      borrowDate: "02/09/2026",
      dueDate: "16/09/2026",
      status: "DueToday",
      statusText: "Đến hạn hôm nay",
    },
    {
      id: "PM-2026-0039",
      reader: "Trần Bảo Nam",
      readerCode: "SV20230114",
      isStudent: true,
      bookTitle: "Mười người da đen nhỏ",
      borrowDate: "28/08/2026",
      dueDate: "11/09/2026",
      status: "Overdue",
      statusText: "Quá hạn 5 ngày",
    },
    {
      id: "PM-2026-0038",
      reader: "Phạm Hà Vy",
      readerCode: "SV20240502",
      isStudent: true,
      bookTitle: "Thiết kế cuộc đời",
      borrowDate: "01/09/2026",
      dueDate: "15/09/2026",
      status: "Returned",
      statusText: "Đã trả xong",
    },
  ]

  const topBooks = [
    { title: "Nhà giả kim", author: "Paulo Coelho", borrows: 94, available: 2 },
    {
      title: "Sức mạnh của sự im lặng",
      author: "Susan Cain",
      borrows: 78,
      available: 6,
    },
    {
      title: "Năm phía sau",
      author: "Erling Kagge",
      borrows: 65,
      available: 4,
    },
    {
      title: "Thiết kế cuộc đời",
      author: "Bill Burnett",
      borrows: 52,
      available: 5,
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            Phân hệ Quản lý Thư viện
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
            Xin chào, {displayName}
          </h1>
          <p className="mt-1 text-sm text-[#718077] dark:text-muted-foreground">
            Theo dõi trạng thái sách, độc giả và các giao dịch mượn trả hôm nay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => navigate("/dashboard/books")}
            className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]"
          >
            <Plus className="size-4" /> Thêm đầu sách
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/loans")}
            className="border-[#cbd8ce] bg-white text-[#1f3b2b] hover:bg-[#f7f8f4] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
          >
            <ArrowLeftRight className="size-4" /> Lập phiếu mượn
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex items-start justify-between rounded-xl border border-[#dfe5dc] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-border dark:bg-card"
            >
              <div>
                <p className="text-xs font-medium text-[#718077] dark:text-muted-foreground">
                  {item.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#1f3b2b] dark:text-foreground">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-[#56675c] dark:text-muted-foreground">
                  {item.subtext}
                </p>
              </div>
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout: Recent Loans & Side Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Borrow Slips */}
        <div className="rounded-xl border border-[#dfe5dc] bg-white p-6 shadow-xs lg:col-span-2 dark:border-border dark:bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1f3b2b] dark:text-foreground">
                Giao dịch mượn trả gần nhất
              </h2>
              <p className="text-xs text-[#718077] dark:text-muted-foreground">
                Theo dõi phiếu mượn mới tạo và xử lý trả sách quá hạn
              </p>
            </div>
            <Link
              to="/dashboard/loans"
              className="text-xs font-semibold text-[#1f5a45] hover:underline dark:text-emerald-400"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#edf0eb] text-xs font-semibold text-[#718077] dark:border-border dark:text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold tracking-wider uppercase">
                    Mã phiếu
                  </th>
                  <th className="pb-3 font-semibold tracking-wider uppercase">
                    Độc giả
                  </th>
                  <th className="pb-3 font-semibold tracking-wider uppercase">
                    Tựa sách
                  </th>
                  <th className="pb-3 font-semibold tracking-wider uppercase">
                    Hạn trả
                  </th>
                  <th className="pb-3 font-semibold tracking-wider uppercase">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3ee] dark:divide-border/60">
                {recentLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-[#fbfcfb] dark:hover:bg-muted/30"
                  >
                    <td className="py-3.5 font-mono text-xs font-medium text-[#1f5a45] dark:text-emerald-400">
                      {loan.id}
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-[#17231d] dark:text-foreground">
                        {loan.reader}
                      </p>
                      <p className="text-[11px] text-[#718077] dark:text-muted-foreground">
                        {loan.isStudent ? "Thẻ HSSV" : "CCCD"}:{" "}
                        {loan.readerCode}
                      </p>
                    </td>
                    <td className="py-3.5 text-sm text-[#385145] dark:text-foreground/90">
                      {loan.bookTitle}
                    </td>
                    <td className="py-3.5 text-xs text-[#56675c] dark:text-muted-foreground">
                      {loan.dueDate}
                    </td>
                    <td className="py-3.5">
                      {loan.status === "Borrowing" && (
                        <Badge
                          variant="outline"
                          className="border-[#cbd8ce] bg-[#eef4ec] text-[#2e5e3a] dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          <Clock3 className="mr-1 size-3" /> Đang mượn
                        </Badge>
                      )}
                      {loan.status === "DueToday" && (
                        <Badge
                          variant="outline"
                          className="border-[#f3d9ca] bg-[#fdf3ec] text-[#b05828] dark:border-orange-800/40 dark:bg-orange-950/40 dark:text-orange-300"
                        >
                          Hạn hôm nay
                        </Badge>
                      )}
                      {loan.status === "Overdue" && (
                        <Badge
                          variant="outline"
                          className="border-[#f5d0cb] bg-[#fdf0ee] text-[#b83828] dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300"
                        >
                          Quá hạn
                        </Badge>
                      )}
                      {loan.status === "Returned" && (
                        <Badge
                          variant="outline"
                          className="border-[#cbd8ce] bg-white text-[#718077] dark:border-border dark:bg-muted/40 dark:text-muted-foreground"
                        >
                          <CheckCircle2 className="mr-1 size-3 text-[#4e9661] dark:text-emerald-400" />{" "}
                          Đã trả
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Top Books & Policy Widget */}
        <div className="flex flex-col gap-6">
          {/* Top Books Card */}
          <div className="rounded-xl border border-[#dfe5dc] bg-white p-6 shadow-xs dark:border-border dark:bg-card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1f3b2b] dark:text-foreground">
                Top sách mượn nhiều
              </h2>
              <TrendingUp className="size-4 text-[#c27652]" />
            </div>
            <div className="mt-4 divide-y divide-[#f0f3ee] dark:divide-border/60">
              {topBooks.map((b, i) => (
                <div
                  key={b.title}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#f0f4ed] text-xs font-bold text-[#1f5a45] dark:bg-emerald-950/50 dark:text-emerald-300">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#17231d] dark:text-foreground">
                        {b.title}
                      </p>
                      <p className="text-xs text-[#718077] dark:text-muted-foreground">
                        {b.author}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#1f3b2b] dark:text-foreground">
                      {b.borrows} lượt
                    </span>
                    <p className="text-[10px] text-[#4e9661] dark:text-emerald-400">
                      Còn {b.available} cuốn
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Policy Info Card */}
          <div className="rounded-xl border border-[#dfe5dc] bg-[#f7f9f6] p-5 text-xs text-[#56675c] dark:border-border dark:bg-muted/20 dark:text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-[#1f5a45] dark:text-emerald-400">
              <ShieldCheck className="size-4" /> Chính sách Thư viện hiện hành
            </div>
            <ul className="mt-3 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <span className="font-bold text-[#1f5a45] dark:text-emerald-400">
                  •
                </span>
                <span>
                  Hạn mức mượn tối đa: <strong>5 cuốn / 14 ngày</strong>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#1f5a45] dark:text-emerald-400">
                  •
                </span>
                <span>
                  Tiền phạt quá hạn gốc: <strong>5.000 đ / ngày</strong>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#1f5a45] dark:text-emerald-400">
                  •
                </span>
                <span>
                  Ưu đãi nhóm HSSV: <strong>Giảm 50% tiền phạt</strong> khi xuất
                  trình thẻ HSSV hợp lệ.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverviewPage
