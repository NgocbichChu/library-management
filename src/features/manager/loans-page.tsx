import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  CommonTable,
  type CommonTableColumn,
} from "@/components/common/common-table"
import { AppDialog } from "@/components/common/app-dialog"
import { AppSelect } from "@/components/common/app-select"
import { Field, FieldLabel } from "@/components/ui/field"
import { loansService, type BorrowSlipItem } from "@/services/loans"
import { adminUsersService } from "@/services/admin-users"
import { managerBooksApi, type BackendBookCopy } from "@/api/manager-books"
import type { AdminUserItem } from "@/types/admin-users"

export const LoansPage = () => {
  const [borrowSlips, setBorrowSlips] = useState<BorrowSlipItem[]>([])
  const [readers, setReaders] = useState<AdminUserItem[]>([])
  const [availableCopies, setAvailableCopies] = useState<
    { bookCopyId: number; barcode: string; bookTitle?: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [returningSlip, setReturningSlip] = useState<BorrowSlipItem | null>(null)
  const [viewingSlip, setViewingSlip] = useState<BorrowSlipItem | null>(null)

  // Create form state
  const [selectedReaderId, setSelectedReaderId] = useState<string>("")
  const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([])
  const [borrowDays, setBorrowDays] = useState(14)
  const [borrowNote, setBorrowNote] = useState("")

  const getAvailableCopies = async () => {
    try {
      const copiesRes = await managerBooksApi.getCopies()
      let rawCopies: BackendBookCopy[] = []
      if (Array.isArray(copiesRes)) {
        rawCopies = copiesRes
      } else if (copiesRes && typeof copiesRes === "object") {
        if (
          "data" in copiesRes &&
          copiesRes.data &&
          typeof copiesRes.data === "object" &&
          "items" in copiesRes.data &&
          Array.isArray(copiesRes.data.items)
        ) {
          rawCopies = copiesRes.data.items
        } else if ("items" in copiesRes && Array.isArray(copiesRes.items)) {
          rawCopies = copiesRes.items
        } else if ("data" in copiesRes && Array.isArray(copiesRes.data)) {
          rawCopies = copiesRes.data
        }
      }
      return rawCopies
        .filter(
          (c) => !c.copyStatus || c.copyStatus.toUpperCase() === "AVAILABLE"
        )
        .map((c) => ({
          bookCopyId: c.bookCopyId,
          barcode: c.barcode,
          bookTitle: c.bookTitle
            ? `${c.bookTitle} (Bản sao #${c.bookCopyId}${c.shelfCode ? ` - ${c.shelfCode}` : ""})`
            : `Bản sao #${c.bookCopyId} (${c.shelfCode || "Kệ A"})`,
        }))
    } catch {
      return []
    }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [slipsData, readersData, copiesData] = await Promise.all([
        loansService.getAll({
          status: statusFilter,
          keyword: searchQuery || undefined,
        }),
        adminUsersService.getUsers({ UserType: "READER" }),
        getAvailableCopies(),
      ])
      setBorrowSlips(slipsData)
      setReaders(readersData)
      setAvailableCopies(copiesData)
    } catch {
      toast.error("Không thể tải danh sách phiếu mượn từ DB.")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  useEffect(() => {
    let ignore = false

    Promise.all([
      loansService.getAll({
        status: statusFilter,
        keyword: searchQuery || undefined,
      }),
      adminUsersService.getUsers({ UserType: "READER" }),
      getAvailableCopies(),
    ])
      .then(([slipsData, readersData, copiesData]) => {
        if (!ignore) {
          setBorrowSlips(slipsData)
          setReaders(readersData)
          setAvailableCopies(copiesData)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Không thể tải danh sách phiếu mượn từ DB.")
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [statusFilter, searchQuery])

  const filteredSlips = useMemo(() => {
    return borrowSlips.filter((s) => {
      const matchStatus =
        statusFilter === "all" || s.slipStatus === statusFilter
      const query = searchQuery.toLowerCase()
      const matchQuery =
        searchQuery === "" ||
        s.borrowSlipCode.toLowerCase().includes(query) ||
        s.readerName.toLowerCase().includes(query) ||
        s.readerCode.toLowerCase().includes(query)
      return matchStatus && matchQuery
    })
  }, [borrowSlips, statusFilter, searchQuery])

  const handleOpenCreate = () => {
    const firstReader = readers[0]
    const initialId = firstReader
      ? firstReader.readerId || (firstReader.code?.match(/\d+/) ? parseInt(firstReader.code.match(/\d+/)![0], 10) : 1)
      : 1
    setSelectedReaderId(String(initialId))
    setSelectedCopyIds([])
    setBorrowDays(14)
    setBorrowNote("")
    void getAvailableCopies().then((copies) => setAvailableCopies(copies))
    setIsCreateOpen(true)
  }

  const handleToggleSelectCopy = (copyId: number) => {
    if (selectedCopyIds.includes(copyId)) {
      setSelectedCopyIds(selectedCopyIds.filter((id) => id !== copyId))
    } else {
      if (selectedCopyIds.length >= 5) {
        toast.warning("Mỗi phiếu mượn tối đa 5 cuốn sách.")
        return
      }
      setSelectedCopyIds([...selectedCopyIds, copyId])
    }
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReaderId) {
      toast.error("Vui lòng chọn độc giả mượn sách.")
      return
    }
    if (selectedCopyIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một cuốn sách để mượn.")
      return
    }

    try {
      const borrowDate = new Date()
      const dueDate = new Date(Date.now() + borrowDays * 86400000)

      await loansService.createBorrowSlip({
        policyId: 1,
        readerId: Number(selectedReaderId),
        borrowDate: borrowDate.toISOString(),
        dueDate: dueDate.toISOString(),
        note: borrowNote.trim() || undefined,
        bookCopyIds: selectedCopyIds,
      })
      toast.success("Đã tạo phiếu mượn thành công (kích hoạt SP sp_borrow_books).")
      setIsCreateOpen(false)
      await loadData()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Tạo phiếu mượn thất bại"
      )
    }
  }

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!returningSlip) return

    try {
      const copyIds = returningSlip.details
        .map((d) => d.bookCopyId)
        .filter(Boolean)
      await loansService.returnSlip(returningSlip.id, copyIds)
      toast.success(
        `Đã xác nhận trả sách cho phiếu ${returningSlip.borrowSlipCode}`
      )
      setReturningSlip(null)
      await loadData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Trả sách thất bại")
    }
  }

  const columns: CommonTableColumn<BorrowSlipItem>[] = [
    {
      id: "code",
      header: "Mã phiếu",
      cell: (slip) => (
        <div>
          <span className="font-mono font-semibold text-foreground">
            {slip.borrowSlipCode}
          </span>
          <p className="text-[11px] text-muted-foreground">
            Lập lúc: {new Date(slip.borrowDate).toLocaleDateString("vi-VN")}
          </p>
        </div>
      ),
    },
    {
      id: "reader",
      header: "Độc giả",
      cell: (slip) => (
        <div className="flex items-start gap-2">
          <User className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">
              {slip.readerName}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Mã thẻ: {slip.readerCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "books",
      header: "Sách mượn",
      cell: (slip) => {
        const details = slip.details ?? []
        return details.length > 0 ? (
          <div className="space-y-1">
            {details.map((d) => (
              <div
                key={d.borrowSlipDetailId || d.bookCopyId}
                className="flex items-center gap-1.5 text-xs"
              >
                <BookOpen className="size-3 text-muted-foreground" />
                <span className="line-clamp-1 font-medium">
                  {d.bookTitle}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({d.barcode})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{slip.totalBooks} cuốn</span>
        )
      },
    },
    {
      id: "timeline",
      header: "Hạn trả / Ngày trả",
      cell: (slip) => {
        const isOverdue =
          slip.slipStatus === "OVERDUE" ||
          (slip.slipStatus === "BORROWING" &&
            new Date() > new Date(slip.dueDate))

        return (
          <div className="space-y-0.5 text-xs">
            <p className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3" />
              <span>
                Hạn: {new Date(slip.dueDate).toLocaleDateString("vi-VN")}
              </span>
            </p>
            {slip.returnedAt ? (
              <p className="flex items-center gap-1 font-medium text-emerald-600">
                <CheckCircle2 className="size-3" />
                <span>
                  Trả: {new Date(slip.returnedAt).toLocaleDateString("vi-VN")}
                </span>
              </p>
            ) : isOverdue ? (
              <p className="flex items-center gap-1 font-medium text-destructive">
                <AlertTriangle className="size-3" />
                <span>Đã quá hạn trả</span>
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (slip) => {
        const config = {
          BORROWING: {
            label: "Đang mượn",
            badge: "border-amber-500/30 text-amber-600 bg-amber-500/10",
          },
          RETURNED: {
            label: "Đã hoàn trả",
            badge: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
          },
          OVERDUE: {
            label: "Quá hạn",
            badge: "border-destructive/30 text-destructive bg-destructive/10",
          },
        }[slip.slipStatus] || {
          label: slip.slipStatus,
          badge: "border-zinc-500/30 text-zinc-600 bg-zinc-500/10",
        }

        return (
          <Badge variant="outline" className={`font-medium ${config.badge}`}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right",
      cell: (slip) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingSlip(slip)}
            className="text-xs"
          >
            Chi tiết
          </Button>

          {slip.slipStatus === "BORROWING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReturningSlip(slip)}
              className="h-8 gap-1 border-[#cbd8ce] bg-white px-2.5 text-xs text-[#1f5a45] hover:bg-[#e7eee3] dark:border-border dark:bg-card dark:text-emerald-400"
            >
              <CheckCircle2 className="size-3.5" /> Trả sách
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            Nghiệp vụ Thủ thư
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1f3b2b] dark:text-foreground">
            Quản lý Mượn &amp; Trả sách
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi danh sách phiếu mượn, kiểm soát hạn trả và ghi nhận trả sách từ cơ sở dữ liệu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
            <RefreshCw className="size-3.5" /> Làm mới
          </Button>
          <Button onClick={handleOpenCreate} className="gap-2 bg-[#1f5a45] text-white hover:bg-[#174735]">
            <Plus className="size-4" /> Lập phiếu mượn mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã phiếu, tên độc giả, mã thẻ..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <AppSelect
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full sm:w-44"
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "BORROWING", label: "Đang mượn" },
            { value: "RETURNED", label: "Đã hoàn trả" },
            { value: "OVERDUE", label: "Quá hạn" },
          ]}
        />
      </div>

      {/* Main Table */}
      <CommonTable
        data={filteredSlips}
        columns={columns}
        loading={loading}
        getRowId={(s) => String(s.id)}
        emptyMessage="Không có phiếu mượn nào phù hợp."
        summary={
          <span>
            Tổng cộng <strong>{filteredSlips.length}</strong> phiếu mượn
          </span>
        }
        pagination={{
          page,
          pageSize,
          total: filteredSlips.length,
          onPageChange: setPage,
        }}
      />

      {/* Modal: Lập phiếu mượn */}
      <AppDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Lập phiếu mượn sách mới"
        description="Chọn độc giả và danh sách các cuốn sách vật lý cần mượn."
        className="max-w-xl"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <Field>
            <FieldLabel>Chọn độc giả mượn sách *</FieldLabel>
            <AppSelect
              value={selectedReaderId}
              onChange={setSelectedReaderId}
              options={
                readers.length > 0
                  ? readers.map((r) => {
                      const idVal =
                        r.readerId ||
                        (r.code?.match(/\d+/)
                          ? parseInt(r.code.match(/\d+/)![0], 10)
                          : 1)
                      return {
                        value: String(idVal),
                        label: `${r.fullName || r.username} (${r.code || "DG"})`,
                      }
                    })
                  : [{ value: "1", label: "Độc giả #1" }]
              }
            />
          </Field>

          <Field>
            <FieldLabel>
              Chọn bản sao sách (Đã chọn: {selectedCopyIds.length} cuốn) *
            </FieldLabel>
            <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-1">
              {availableCopies.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2 text-center">
                  Hiện không có bản sao nào sẵn sàng cho mượn trong kho. Vui lòng nhập bản sao tại mục Quản lý sách trước.
                </p>
              ) : (
                availableCopies.map((copy) => {
                  const isSelected = selectedCopyIds.includes(copy.bookCopyId)
                  return (
                    <div
                      key={copy.bookCopyId}
                      onClick={() => handleToggleSelectCopy(copy.bookCopyId)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? "bg-[#edf6ef] text-[#246237] border border-[#cce1d2]"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-3.5" />
                        <span>{copy.bookTitle}</span>
                      </div>
                      <span className="font-mono text-[11px]">
                        {copy.barcode}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Số ngày mượn</FieldLabel>
              <Input
                type="number"
                min={1}
                max={30}
                value={borrowDays}
                onChange={(e) => setBorrowDays(Number(e.target.value) || 14)}
              />
            </Field>

            <Field>
              <FieldLabel>Ghi chú</FieldLabel>
              <Input
                placeholder="Ghi chú thêm nếu có..."
                value={borrowNote}
                onChange={(e) => setBorrowNote(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-[#1f5a45] text-white hover:bg-[#174735]">
              Xác nhận lập phiếu
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Xác nhận trả sách */}
      <AppDialog
        open={Boolean(returningSlip)}
        onOpenChange={(open) => !open && setReturningSlip(null)}
        title={`Xác nhận trả sách - Phiếu ${returningSlip?.borrowSlipCode}`}
        description="Ghi nhận độc giả đã hoàn trả các cuốn sách trong phiếu."
      >
        <form onSubmit={handleSubmitReturn} className="space-y-4">
          <p className="text-sm">
            Bạn có chắc chắn muốn xác nhận trả sách cho phiếu mượn{" "}
            <strong>{returningSlip?.borrowSlipCode}</strong> của độc giả{" "}
            <strong>{returningSlip?.readerName}</strong>?
          </p>
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReturningSlip(null)}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-[#1f5a45] text-white hover:bg-[#174735]">
              Hoàn tất trả sách
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Chi tiết phiếu mượn */}
      <AppDialog
        open={Boolean(viewingSlip)}
        onOpenChange={(open) => !open && setViewingSlip(null)}
        title={`Chi tiết phiếu mượn: ${viewingSlip?.borrowSlipCode}`}
        description="Thông tin chi tiết độc giả và danh sách các cuốn sách mượn."
      >
        {viewingSlip && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 bg-muted/20">
              <div>
                <p className="text-muted-foreground">Độc giả:</p>
                <p className="font-semibold text-foreground">{viewingSlip.readerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mã thẻ:</p>
                <p className="font-mono text-foreground">{viewingSlip.readerCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ngày mượn:</p>
                <p className="font-medium">{new Date(viewingSlip.borrowDate).toLocaleDateString("vi-VN")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hạn trả:</p>
                <p className="font-medium text-amber-600">{new Date(viewingSlip.dueDate).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">Danh sách sách mượn:</p>
              <div className="divide-y border rounded-md">
                {(viewingSlip.details || []).map((b) => (
                  <div key={b.borrowSlipDetailId || b.bookCopyId} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{b.bookTitle}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Mã vạch: {b.barcode}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {b.returnDate ? "Đã trả" : "Đang mượn"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingSlip(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </AppDialog>
    </div>
  )
}

export default LoansPage
