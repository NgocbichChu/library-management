import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  BookOpen,
  Calendar,
  CreditCard,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { useLibraryStore } from "@/stores/use-library-store"
import { useAuthStore } from "@/stores/use-auth-store"
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
import type { BorrowSlip, ConditionStatus, Fine } from "@/types/library"

export const LoansPage = () => {
  const user = useAuthStore((state) => state.user)
  const {
    borrowSlips,
    readers,
    copies,
    books,
    policy,
    createBorrowSlip,
    returnBorrowSlip,
    payFine,
  } = useLibraryStore()

  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [returningSlip, setReturningSlip] = useState<BorrowSlip | null>(null)
  const [payingFine, setPayingFine] = useState<Fine | null>(null)
  const [viewingSlip, setViewingSlip] = useState<BorrowSlip | null>(null)

  // Create form state
  const [selectedReaderId, setSelectedReaderId] = useState<string>("")
  const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([])
  const [borrowDays, setBorrowDays] = useState(policy?.max_borrow_days ?? 14)
  const [borrowNote, setBorrowNote] = useState("")

  // Return form state
  const [conditionAfter, setConditionAfter] = useState<ConditionStatus>("GOOD")
  const [returnNote, setReturnNote] = useState("")

  // Available copies for borrowing
  const availableCopies = useMemo(() => {
    return copies.filter((c) => c.copy_status === "AVAILABLE")
  }, [copies])

  const filteredSlips = useMemo(() => {
    return borrowSlips.filter((s) => {
      const matchStatus =
        statusFilter === "all" || s.slip_status === statusFilter
      const query = searchQuery.toLowerCase()
      const matchQuery =
        searchQuery === "" ||
        s.borrow_slip_code.toLowerCase().includes(query) ||
        (s.reader && s.reader.full_name.toLowerCase().includes(query)) ||
        (s.reader && s.reader.reader_code.toLowerCase().includes(query))
      return matchStatus && matchQuery
    })
  }, [borrowSlips, statusFilter, searchQuery])

  const handleOpenCreate = () => {
    const firstActiveReader = readers.find((r) => r.reader_status === "ACTIVE")
    setSelectedReaderId(
      firstActiveReader ? String(firstActiveReader.reader_id) : ""
    )
    setSelectedCopyIds([])
    setBorrowDays(policy?.max_borrow_days ?? 14)
    setBorrowNote("")
    setIsCreateOpen(true)
  }

  const handleToggleSelectCopy = (copyId: number) => {
    if (selectedCopyIds.includes(copyId)) {
      setSelectedCopyIds(selectedCopyIds.filter((id) => id !== copyId))
    } else {
      if (selectedCopyIds.length >= (policy?.max_borrow_books ?? 5)) {
        toast.warning(
          `Chính sách chỉ cho phép mượn tối đa ${policy?.max_borrow_books ?? 5} cuốn một lần.`
        )
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
      const newSlip = await createBorrowSlip({
        readerId: Number(selectedReaderId),
        employeeId: 1, // Current employee ID
        bookCopyIds: selectedCopyIds,
        dueDays: Number(borrowDays),
        note: borrowNote.trim() || undefined,
      })
      toast.success(`Đã tạo thành công phiếu mượn: ${newSlip.borrow_slip_code}`)
      setIsCreateOpen(false)
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
      await returnBorrowSlip({
        slipId: returningSlip.borrow_slip_id,
        conditionAfter,
        note: returnNote.trim() || undefined,
      })
      toast.success(
        `Đã xác nhận trả sách cho phiếu ${returningSlip.borrow_slip_code}`
      )
      setReturningSlip(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Trả sách thất bại")
    }
  }

  const handleConfirmPayFine = async () => {
    if (!payingFine) return
    try {
      await payFine(payingFine.fine_id)
      toast.success(
        `Đã thanh toán đủ khoản phạt ${payingFine.outstanding_amount.toLocaleString("vi-VN")} đ`
      )
      setPayingFine(null)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Thanh toán phạt thất bại"
      )
    }
  }

  const columns: CommonTableColumn<BorrowSlip>[] = [
    {
      id: "code",
      header: "Mã phiếu",
      cell: (slip) => (
        <div>
          <span className="font-mono font-semibold text-foreground">
            {slip.borrow_slip_code}
          </span>
          <p className="text-[11px] text-muted-foreground">
            Lập lúc: {new Date(slip.borrow_date).toLocaleDateString("vi-VN")}
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
              {slip.reader?.full_name ?? "Độc giả"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Mã thẻ: {slip.reader?.reader_code}
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
        return (
          <div className="space-y-1">
            {details.map((d) => (
              <div
                key={d.borrow_slip_detail_id}
                className="flex items-center gap-1.5 text-xs"
              >
                <BookOpen className="size-3 text-muted-foreground" />
                <span className="line-clamp-1 font-medium">
                  {d.book_title?.title ?? "Sách thư viện"}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({d.book_copy?.barcode})
                </span>
              </div>
            ))}
          </div>
        )
      },
    },
    {
      id: "timeline",
      header: "Hạn trả / Ngày trả",
      cell: (slip) => {
        const isOverdue =
          slip.slip_status === "OVERDUE" ||
          (slip.slip_status === "BORROWING" &&
            new Date() > new Date(slip.due_date))

        return (
          <div className="space-y-0.5 text-xs">
            <p className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3" />
              <span>
                Hạn: {new Date(slip.due_date).toLocaleDateString("vi-VN")}
              </span>
            </p>
            {slip.returned_at ? (
              <p className="flex items-center gap-1 font-medium text-emerald-600">
                <CheckCircle2 className="size-3" />
                <span>
                  Trả: {new Date(slip.returned_at).toLocaleDateString("vi-VN")}
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
          CANCELLED: {
            label: "Đã hủy",
            badge: "border-zinc-500/30 text-zinc-600 bg-zinc-500/10",
          },
        }[slip.slip_status]

        // Check if there is an outstanding fine
        const fine = slip.details?.find(
          (d) => d.fine && d.fine.outstanding_amount > 0
        )?.fine

        return (
          <div className="flex flex-col items-start gap-1">
            <Badge variant="outline" className={config.badge}>
              {config.label}
            </Badge>
            {fine && fine.outstanding_amount > 0 ? (
              <Button
                size="icon-xs"
                variant="destructive"
                className="h-5 gap-1 px-1.5 text-[10px]"
                title="Bấm để thu phạt"
                onClick={() => setPayingFine(fine)}
              >
                <Receipt className="size-3" />
                <span>
                  Phạt: {fine.outstanding_amount.toLocaleString("vi-VN")} đ
                </span>
              </Button>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      className: "text-right",
      cell: (slip) => {
        const canReturn =
          slip.slip_status === "BORROWING" || slip.slip_status === "OVERDUE"

        return (
          <div className="flex items-center justify-end gap-1">
            {canReturn ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 border-emerald-600/30 text-xs text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  setReturningSlip(slip)
                  setConditionAfter("GOOD")
                  setReturnNote("")
                }}
              >
                <CheckCircle2 className="size-3.5" /> Trả sách
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => setViewingSlip(slip)}
            >
              Chi tiết
            </Button>
          </div>
        )
      },
    },
  ]

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "BORROWING", label: "Đang mượn" },
    { value: "OVERDUE", label: "Quá hạn" },
    { value: "RETURNED", label: "Đã hoàn trả" },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý mượn trả
          </h1>
          <p className="text-sm text-muted-foreground">
            Lập phiếu mượn sách (borrow_slip), theo dõi hạn trả, thu hồi sách và
            xử lý tiền phạt trễ hạn (fine).
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" /> Lập phiếu mượn sách
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã phiếu, tên độc giả, mã thẻ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>
        <div className="w-full sm:w-60">
          <AppSelect
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Table */}
      <CommonTable
        data={filteredSlips}
        columns={columns}
        getRowId={(s) => s.borrow_slip_id}
        emptyMessage="Không có phiếu mượn nào."
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

      {/* Modal: Tạo phiếu mượn mới */}
      <AppDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Lập phiếu mượn sách mới"
        description="Chọn độc giả hợp lệ và các cuốn sách có sẵn trong kho để xuất phiếu."
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel>Chọn độc giả mượn sách *</FieldLabel>
              <AppSelect
                options={readers
                  .filter((r) => r.reader_status === "ACTIVE")
                  .map((r) => ({
                    value: String(r.reader_id),
                    label: `${r.full_name} (${r.reader_code}) - ${
                      r.reader_type === "STUDENT" ? "Sinh viên" : "Độc giả"
                    }`,
                  }))}
                value={selectedReaderId}
                onChange={setSelectedReaderId}
                placeholder="-- Chọn độc giả --"
              />
            </Field>

            <Field>
              <FieldLabel>Thời hạn mượn (ngày)</FieldLabel>
              <Input
                type="number"
                min={1}
                max={30}
                value={borrowDays}
                onChange={(e) => setBorrowDays(Number(e.target.value))}
              />
            </Field>

            <Field>
              <FieldLabel>Thủ thư lập phiếu</FieldLabel>
              <Input
                disabled
                value={user?.name ?? "Thủ thư trực quầy"}
                className="bg-muted text-muted-foreground"
              />
            </Field>

            {/* Select copies list */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel>
                  Chọn các cuốn sách mượn ({selectedCopyIds.length}/
                  {policy?.max_borrow_books ?? 5} cuốn) *
                </FieldLabel>
                <span className="text-xs text-muted-foreground">
                  Chỉ hiển thị bản sao sẵn sàng
                </span>
              </div>

              <div className="max-h-52 divide-y overflow-y-auto rounded-lg border text-xs">
                {availableCopies.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">
                    Không có cuốn sách nào đang sẵn sàng mượn trong kho.
                  </p>
                ) : (
                  availableCopies.map((copy) => {
                    const book = books.find(
                      (b) => b.book_title_id === copy.book_title_id
                    )
                    const isSelected = selectedCopyIds.includes(
                      copy.book_copy_id
                    )

                    return (
                      <div
                        key={copy.book_copy_id}
                        onClick={() =>
                          handleToggleSelectCopy(copy.book_copy_id)
                        }
                        className={`flex cursor-pointer items-center justify-between p-2.5 transition-colors ${
                          isSelected
                            ? "border-l-4 border-primary bg-primary/10"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="size-4 rounded text-primary"
                          />
                          <div>
                            <p className="font-semibold text-foreground">
                              {book?.title ?? "Đầu sách"}
                            </p>
                            <p className="text-muted-foreground">
                              Mã vạch:{" "}
                              <span className="font-mono">{copy.barcode}</span>{" "}
                              • Kệ: {copy.shelf_code}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {copy.condition_status}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <Field className="col-span-2">
              <FieldLabel>Ghi chú phiếu mượn</FieldLabel>
              <Input
                placeholder="Mục đích mượn, tình trạng đặc biệt..."
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
            <Button type="submit">Xác nhận tạo phiếu</Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Xác nhận trả sách */}
      <AppDialog
        open={Boolean(returningSlip)}
        onOpenChange={(open) => !open && setReturningSlip(null)}
        title={`Xác nhận trả sách - Phiếu ${returningSlip?.borrow_slip_code ?? ""}`}
        description="Kiểm tra tình trạng sách khi bạn đọc hoàn trả lại quầy thủ thư."
      >
        <form onSubmit={handleSubmitReturn} className="space-y-4">
          <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
            <p>
              <strong>Độc giả:</strong> {returningSlip?.reader?.full_name} (
              {returningSlip?.reader?.reader_code})
            </p>
            <p>
              <strong>Hạn trả quy định:</strong>{" "}
              {returningSlip
                ? new Date(returningSlip.due_date).toLocaleDateString("vi-VN")
                : ""}
            </p>
            {returningSlip && new Date() > new Date(returningSlip.due_date) ? (
              <div className="mt-1 flex items-center gap-2 font-semibold text-destructive">
                <AlertTriangle className="size-4" />
                <span>
                  Phiếu này đã quá hạn! Hệ thống sẽ tự động phát sinh tiền phạt
                  theo chính sách.
                </span>
              </div>
            ) : (
              <p className="font-medium text-emerald-600">
                Hoàn trả đúng hạn hợp lệ.
              </p>
            )}
          </div>

          <Field>
            <FieldLabel>Tình trạng sách khi hoàn trả *</FieldLabel>
            <AppSelect
              options={[
                { value: "NEW", label: "Mới như ban đầu" },
                { value: "GOOD", label: "Tốt / Bình thường" },
                { value: "FAIR", label: "Hơi sờn góc bìa" },
                { value: "DAMAGED", label: "Bị rách / Hư hỏng (Áp dụng phạt)" },
              ]}
              value={conditionAfter}
              onChange={(val) => setConditionAfter(val as ConditionStatus)}
            />
          </Field>

          <Field>
            <FieldLabel>Ghi chú khi nhận lại sách</FieldLabel>
            <Input
              placeholder="Ghi chú thêm nếu cần..."
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReturningSlip(null)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Xác nhận nhận lại sách
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Modal: Thu tiền phạt */}
      <AppDialog
        open={Boolean(payingFine)}
        onOpenChange={(open) => !open && setPayingFine(null)}
        title="Thu tiền phạt vi phạm"
        description="Ghi nhận thanh toán tiền phạt vi phạm mượn trả sách."
      >
        <div className="space-y-4">
          <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm">
            <div className="flex justify-between">
              <span>Lý do phạt:</span>
              <span className="font-semibold text-destructive">
                {payingFine?.fine_type === "OVERDUE"
                  ? `Quá hạn ${payingFine.overdue_days} ngày`
                  : payingFine?.fine_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Số tiền phạt:</span>
              <span className="text-base font-bold text-destructive">
                {(payingFine?.outstanding_amount ?? 0).toLocaleString("vi-VN")}{" "}
                đ
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Bấm "Xác nhận đã thu" sau khi bạn đọc đã nộp đủ tiền mặt hoặc chuyển
            khoản tại quầy.
          </p>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" onClick={() => setPayingFine(null)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmPayFine} className="gap-1.5">
              <CreditCard className="size-4" /> Xác nhận đã thu
            </Button>
          </div>
        </div>
      </AppDialog>

      {/* Modal: Chi tiết phiếu mượn */}
      <AppDialog
        open={Boolean(viewingSlip)}
        onOpenChange={(open) => !open && setViewingSlip(null)}
        title={`Chi tiết phiếu mượn: ${viewingSlip?.borrow_slip_code ?? ""}`}
        description="Toàn bộ thông tin phiếu mượn và danh sách sách liên quan."
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Độc giả mượn</p>
              <p className="font-semibold">{viewingSlip?.reader?.full_name}</p>
              <p className="text-xs">{viewingSlip?.reader?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Thủ thư tiếp nhận</p>
              <p className="font-semibold">
                {viewingSlip?.employee?.full_name ?? "Thủ thư"}
              </p>
              <p className="text-xs">{viewingSlip?.employee?.position}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ngày mượn</p>
              <p className="font-medium">
                {viewingSlip
                  ? new Date(viewingSlip.borrow_date).toLocaleString("vi-VN")
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hạn hoàn trả</p>
              <p className="font-medium text-amber-600">
                {viewingSlip
                  ? new Date(viewingSlip.due_date).toLocaleString("vi-VN")
                  : ""}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 font-semibold">Các cuốn sách trong phiếu:</p>
            <div className="divide-y rounded-lg border text-xs">
              {viewingSlip?.details?.map((d) => (
                <div
                  key={d.borrow_slip_detail_id}
                  className="flex justify-between p-2.5"
                >
                  <div>
                    <p className="font-semibold">{d.book_title?.title}</p>
                    <p className="font-mono text-muted-foreground">
                      Mã vạch: {d.book_copy?.barcode} • Vị trí:{" "}
                      {d.book_copy?.shelf_code}
                    </p>
                  </div>
                  <Badge variant="outline">{d.detail_status}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingSlip(null)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </AppDialog>
    </div>
  )
}
