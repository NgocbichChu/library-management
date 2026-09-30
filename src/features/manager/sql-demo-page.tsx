import { useEffect, useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock3,
  LoaderCircle,
  X,
} from "lucide-react"
import { Link } from "react-router"
import {
  createApprovedBorrowSlip,
  loadLoanDemoCopies,
  type LoanDemoBookCopy,
} from "@/api/loan-request-demo"
import { Button } from "@/components/ui/button"

type LoanRequest = {
  id: string
  copy: LoanDemoBookCopy
  status: "Chờ duyệt" | "Đã duyệt" | "Từ chối"
}

const imagePlaceholder =
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=85"

const readError = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Có lỗi khi kết nối API."

export function SqlDemoPage() {
  const [copies, setCopies] = useState<LoanDemoBookCopy[]>([])
  const [selectedCopyId, setSelectedCopyId] = useState("")
  const [requests, setRequests] = useState<LoanRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadLoanDemoCopies()
      .then((nextCopies) => {
        if (cancelled) return
        setCopies(nextCopies)
        setSelectedCopyId(String(nextCopies[0]?.book_copy_id ?? ""))
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(readError(cause))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedCopy = copies.find(
    (copy) => String(copy.book_copy_id) === selectedCopyId
  )

  const createRequest = () => {
    if (!selectedCopy) return
    setRequests((current) => [
      {
        id: `REQ-${Date.now()}`,
        copy: selectedCopy,
        status: "Chờ duyệt",
      },
      ...current,
    ])
  }

  const decideRequest = async (request: LoanRequest, approve: boolean) => {
    setError(null)
    if (!approve) {
      setRequests((current) =>
        current.map((item) =>
          item.id === request.id ? { ...item, status: "Từ chối" } : item
        )
      )
      return
    }

    setProcessingId(request.id)
    try {
      const currentCopies = await loadLoanDemoCopies()
      const availableCopy = currentCopies.find(
        (copy) =>
          copy.book_title_id === request.copy.book_title_id &&
          copy.available_copies > 0
      )
      if (!availableCopy) {
        setError("Đầu sách này đã hết bản có thể cho mượn.")
        setCopies(currentCopies)
        return
      }

      const now = new Date()
      const dueDate = new Date(now)
      dueDate.setDate(dueDate.getDate() + availableCopy.max_borrow_days)

      await createApprovedBorrowSlip({
        policyId: availableCopy.policy_id,
        readerId: availableCopy.reader_id,
        borrowDate: now.toISOString(),
        dueDate: dueDate.toISOString(),
        note: `Duyệt yêu cầu mượn ${request.id}`,
        bookCopyIds: [availableCopy.book_copy_id],
      })

      setRequests((current) =>
        current.map((item) =>
          item.id === request.id ? { ...item, status: "Đã duyệt" } : item
        )
      )
      const refreshedCopies = await loadLoanDemoCopies()
      setCopies(refreshedCopies)
      setSelectedCopyId((current) =>
        refreshedCopies.some((copy) => String(copy.book_copy_id) === current)
          ? current
          : String(refreshedCopies[0]?.book_copy_id ?? "")
      )
      setRequests((current) =>
        current.map((item) => {
          if (item.copy.book_title_id !== request.copy.book_title_id) {
            return item
          }
          const latestInventory = refreshedCopies.find(
            (copy) => copy.book_title_id === item.copy.book_title_id
          )
          return {
            ...item,
            status: item.id === request.id ? "Đã duyệt" : item.status,
            copy: {
              ...item.copy,
              available_copies:
                latestInventory?.available_copies ??
                Math.max(item.copy.available_copies - 1, 0),
            },
          }
        })
      )
    } catch (cause: unknown) {
      setError(readError(cause))
      try {
        const refreshedCopies = await loadLoanDemoCopies()
        setCopies(refreshedCopies)
        setRequests((current) =>
          current.map((item) => {
            const latestInventory = refreshedCopies.find(
              (copy) => copy.book_title_id === item.copy.book_title_id
            )
            return latestInventory
              ? {
                  ...item,
                  copy: {
                    ...item.copy,
                    available_copies: latestInventory.available_copies,
                    total_copies: latestInventory.total_copies,
                  },
                }
              : item
          })
        )
      } catch {
        // Keep the original API error visible.
      }
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#eef2eb] text-[#1c2921]">
      <header className="border-b border-[#d8dfd7] bg-[#f9fbf8]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#315842] hover:text-[#193b2b]"
          >
            <ArrowLeft className="size-4" /> Quản lý thư viện
          </Link>
          <span className="text-xs font-semibold text-[#738077]">
            DEMO · MƯỢN SÁCH
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7 sm:py-9">
        <section className="relative isolate flex min-h-44 items-end overflow-hidden bg-[#22392c] px-5 py-5 sm:min-h-52 sm:px-7">
          <img
            src={imagePlaceholder}
            alt="Ảnh minh họa tạm thời cho quy trình yêu cầu mượn sách"
            className="absolute inset-0 -z-10 size-full object-cover opacity-60"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#162b20]/85 via-[#1b3023]/45 to-transparent" />
          <div className="max-w-2xl text-white">
            <p className="text-xs font-semibold uppercase">
              Quy trình mượn sách
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Yêu cầu mượn · Thủ thư duyệt
            </h1>
            <p className="mt-2 text-sm text-white/85">
              Duyệt thành công sẽ tạo phiếu mượn và giảm số bản còn sẵn.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="border-t-2 border-[#315842] bg-[#f9fbf8] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#2d4735]">
              <BookOpen className="size-4" /> Tạo yêu cầu mượn
            </h2>
            <label
              htmlFor="copy-choice"
              className="mt-4 block text-xs font-medium text-[#68756c]"
            >
              Chọn sách còn bản
            </label>
            <select
              id="copy-choice"
              value={selectedCopyId}
              onChange={(event) => setSelectedCopyId(event.target.value)}
              disabled={loading || copies.length === 0}
              className="mt-1.5 h-10 w-full border border-[#d3dcd3] bg-white px-3 text-sm text-[#263b2d] outline-none focus:border-[#63836a]"
            >
              {copies.length === 0 ? (
                <option value="">
                  {loading ? "Đang tải sách..." : "Không còn sách sẵn"}
                </option>
              ) : (
                copies.map((copy) => (
                  <option key={copy.book_copy_id} value={copy.book_copy_id}>
                    {copy.title} · còn {copy.available_copies}/
                    {copy.total_copies}
                  </option>
                ))
              )}
            </select>
            {selectedCopy && (
              <p className="mt-2 text-xs text-[#748077]">
                Độc giả: {selectedCopy.full_name} ({selectedCopy.reader_code})
              </p>
            )}
            <Button
              onClick={createRequest}
              disabled={!selectedCopy || loading}
              className="mt-4 h-9 w-full rounded-none bg-[#315842] text-white hover:bg-[#244832]"
            >
              Tạo yêu cầu
            </Button>
            <p className="mt-3 text-[11px] leading-4 text-[#78837b]">
              Request chờ duyệt được tạo trong demo; duyệt mới gửi phiếu thật.
            </p>
          </div>

          <div className="min-w-0 border-t-2 border-[#b87952] bg-[#f9fbf8] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#2d4735]">
                  Bảng yêu cầu mượn sách
                </h2>
                <p className="mt-1 text-xs text-[#748077]">
                  Duyệt gọi BookMI API và cập nhật tồn kho thật.
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-[#708077]">
                <Clock3 className="size-3.5" /> {requests.length} yêu cầu
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 border-l-2 border-[#b64237] bg-[#fff2ef] px-3 py-2 text-xs text-[#8d332c]"
              >
                {error}
              </p>
            )}

            <div className="mt-4 overflow-x-auto border border-[#e1e7df] bg-white">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="bg-[#f2f5f1] text-[#657268]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Yêu cầu</th>
                    <th className="px-3 py-2.5 font-semibold">Độc giả</th>
                    <th className="px-3 py-2.5 font-semibold">Đầu sách</th>
                    <th className="px-3 py-2.5 font-semibold">Còn sẵn</th>
                    <th className="px-3 py-2.5 font-semibold">
                      Trạng thái / xử lý
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const busy = processingId === request.id
                    return (
                      <tr
                        key={request.id}
                        className="border-t border-[#edf0ec]"
                      >
                        <td className="px-3 py-3 font-mono text-[#657268]">
                          {request.id}
                        </td>
                        <td className="px-3 py-3 text-[#33463a]">
                          <span className="block font-medium">
                            {request.copy.full_name}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-[#7a867d]">
                            {request.copy.reader_code}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[#33463a]">
                          <span className="block max-w-44 truncate font-medium">
                            {request.copy.title}
                          </span>
                          <span className="mt-0.5 block font-mono text-[10px] text-[#7a867d]">
                            {request.copy.barcode}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-[#315842]">
                          {request.copy.available_copies}/
                          {request.copy.total_copies}
                        </td>
                        <td className="px-3 py-3">
                          {request.status === "Chờ duyệt" ? (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() =>
                                  void decideRequest(request, true)
                                }
                                className="h-7 gap-1 rounded-none bg-[#315842] px-2 text-[11px] text-white hover:bg-[#244832]"
                              >
                                {busy ? (
                                  <LoaderCircle className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3" />
                                )}
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                  void decideRequest(request, false)
                                }
                                className="h-7 gap-1 rounded-none px-2 text-[11px]"
                              >
                                <X className="size-3" /> Từ chối
                              </Button>
                            </div>
                          ) : (
                            <span
                              className={`font-semibold ${
                                request.status === "Đã duyệt"
                                  ? "text-[#347247]"
                                  : "text-[#9b5744]"
                              }`}
                            >
                              {request.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {requests.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-8 text-center text-xs text-[#7a867d]"
                      >
                        Chưa có yêu cầu. Tạo một yêu cầu để bắt đầu demo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-[#78837b]">
              Khi duyệt thành công, bảng cập nhật trạng thái và số bản còn sẵn
              theo dữ liệu server.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
