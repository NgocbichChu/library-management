import { useCallback, useEffect, useMemo, useState } from "react"
import { BookOpen, Calendar, History, RefreshCw, Search, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loansService, type BorrowSlipItem } from "@/services/loans"

export function LoanHistoryPage() {
  const [slips, setSlips] = useState<BorrowSlipItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    const allSlips = await loansService.getAll()
    setSlips(allSlips.filter((slip) => slip.slipStatus === "RETURNED"))
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const filteredSlips = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return slips
    return slips.filter(
      (slip) =>
        slip.borrowSlipCode.toLowerCase().includes(query) ||
        slip.readerName.toLowerCase().includes(query) ||
        slip.readerCode.toLowerCase().includes(query) ||
        slip.details.some((detail) => detail.bookTitle.toLowerCase().includes(query))
    )
  }, [search, slips])

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            Nghiệp vụ Thủ thư
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-[#1f3b2b] dark:text-foreground">
            <History className="size-5" /> Lịch sử mượn sách
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Các phiếu được chuyển vào đây sau khi xác nhận trả sách.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadHistory()}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng số phiếu đã trả: <strong>{slips.length}</strong>
        </p>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã phiếu, độc giả hoặc sách..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Mã phiếu</th>
              <th className="px-4 py-3 font-medium">Độc giả</th>
              <th className="px-4 py-3 font-medium">Sách</th>
              <th className="px-4 py-3 font-medium">Ngày mượn</th>
              <th className="px-4 py-3 font-medium">Ngày trả</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Đang tải lịch sử mượn sách...
                </td>
              </tr>
            ) : filteredSlips.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {search ? "Không tìm thấy phiếu phù hợp." : "Chưa có phiếu mượn nào đã trả."}
                </td>
              </tr>
            ) : (
              filteredSlips.map((slip) => (
                <tr key={slip.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono font-medium">
                    {slip.borrowSlipCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{slip.readerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {slip.readerCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {slip.details.length > 0 ? (
                        slip.details.map((detail) => (
                          <p
                            key={detail.borrowSlipDetailId || detail.bookCopyId}
                            className="flex items-center gap-1.5"
                          >
                            <BookOpen className="size-3.5 shrink-0 text-muted-foreground" />
                            {detail.bookTitle}
                          </p>
                        ))
                      ) : (
                        <p>{slip.totalBooks} cuốn</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {new Date(slip.borrowDate).toLocaleDateString("vi-VN")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {slip.returnedAt
                      ? new Date(slip.returnedAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                      Đã trả
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}