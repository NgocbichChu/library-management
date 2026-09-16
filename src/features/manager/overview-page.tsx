import { useEffect } from "react"
import { useNavigate } from "react-router"
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  PlusCircle,
  Coins,
  Library,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { useLibraryStore } from "@/stores/use-library-store"
import { useAuthStore } from "@/stores/use-auth-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const OverviewPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { stats, borrowSlips, isInitialized, fetchAll } = useLibraryStore()

  useEffect(() => {
    if (!isInitialized) {
      void fetchAll()
    }
  }, [isInitialized, fetchAll])

  const recentSlips = borrowSlips.slice(0, 5)
  const overdueSlips = borrowSlips.filter((s) => s.slip_status === "OVERDUE")

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan quản lý</h1>
          <p className="text-sm text-muted-foreground">
            Xin chào, <span className="font-medium text-foreground">{user?.name}</span> (
            {user?.position ?? "Thủ thư trưởng / Quản lý"}). Theo dõi tình hình thư viện hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate("/dashboard/loans")}
            className="gap-1.5"
          >
            <PlusCircle className="size-4" /> Tạo phiếu mượn
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/dashboard/books")}
            className="gap-1.5"
          >
            <BookOpen className="size-4" /> Quản lý sách
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Đầu sách
            </CardTitle>
            <BookOpen className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTitles ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats?.totalCopies ?? 0} cuốn trong kho
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sẵn sàng mượn
            </CardTitle>
            <Library className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats?.availableCopies ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Bản sao trên các kệ</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Độc giả
            </CardTitle>
            <Users className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReaders ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Thẻ đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Đang mượn
            </CardTitle>
            <ArrowLeftRight className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats?.activeLoans ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Giao dịch trong hạn</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-destructive">
              Quá hạn
            </CardTitle>
            <AlertTriangle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.overdueLoans ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Cần gửi thông báo nhắc</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tiền phạt tồn
            </CardTitle>
            <Coins className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.totalOutstandingFines ?? 0).toLocaleString("vi-VN")} đ
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Chưa thanh toán</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert banner if any */}
      {overdueSlips.length > 0 ? (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-destructive">
                Có {overdueSlips.length} phiếu mượn đã quá hạn cần thu hồi
              </p>
              <p className="text-xs text-muted-foreground">
                Hệ thống đã tính tiền phạt trễ hạn tự động theo quy định chính sách.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => navigate("/dashboard/loans")}
          >
            Xử lý ngay
          </Button>
        </div>
      ) : null}

      {/* Main Sections: Recent loans & Quick shortcuts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent loans table */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Giao dịch mượn trả gần đây</CardTitle>
              <CardDescription>Các lượt mượn và trả sách mới nhất</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/loans")}
            >
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Mã phiếu</th>
                    <th className="py-2.5 px-3">Độc giả</th>
                    <th className="py-2.5 px-3">Hạn trả</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSlips.map((slip) => {
                    const statusConfig = {
                      BORROWING: {
                        label: "Đang mượn",
                        variant: "outline" as const,
                        className: "border-amber-500/30 text-amber-600 bg-amber-500/10",
                      },
                      RETURNED: {
                        label: "Đã trả",
                        variant: "outline" as const,
                        className: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
                      },
                      OVERDUE: {
                        label: "Quá hạn",
                        variant: "destructive" as const,
                        className: "",
                      },
                      CANCELLED: {
                        label: "Đã hủy",
                        variant: "secondary" as const,
                        className: "",
                      },
                    }[slip.slip_status]

                    return (
                      <tr key={slip.borrow_slip_id} className="hover:bg-muted/50">
                        <td className="py-3 px-3 font-mono font-medium">
                          {slip.borrow_slip_code}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium">
                            {slip.reader?.full_name ?? "Độc giả"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {slip.reader?.reader_code}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {new Date(slip.due_date).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={statusConfig.variant}
                            className={statusConfig.className}
                          >
                            {statusConfig.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick action shortcuts & info */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Lối tắt thao tác nhanh</CardTitle>
              <CardDescription>Các chức năng thường dùng hàng ngày</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              <Button
                variant="outline"
                className="justify-start gap-3 h-11"
                onClick={() => navigate("/dashboard/loans")}
              >
                <PlusCircle className="size-4 text-primary" />
                <span>Lập phiếu mượn sách mới</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-3 h-11"
                onClick={() => navigate("/dashboard/books")}
              >
                <BookOpen className="size-4 text-emerald-600" />
                <span>Thêm đầu sách vào kho</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-3 h-11"
                onClick={() => navigate("/dashboard/readers")}
              >
                <Users className="size-4 text-blue-600" />
                <span>Cấp thẻ độc giả mới</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-3 h-11"
                onClick={() => navigate("/dashboard/settings")}
              >
                <Clock className="size-4 text-amber-600" />
                <span>Cấu hình hạn mượn & phạt</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xs bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Thông tin quy định hiện hành
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span>Số sách mượn tối đa:</span>
                <span className="font-semibold text-foreground">5 cuốn / thẻ</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span>Thời hạn mượn:</span>
                <span className="font-semibold text-foreground">14 ngày</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span>Mức phạt quá hạn:</span>
                <span className="font-semibold text-foreground">5.000 đ / ngày</span>
              </div>
              <div className="flex justify-between">
                <span>Ưu đãi sinh viên:</span>
                <span className="font-semibold text-emerald-600">Giảm 20% phí phạt</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
