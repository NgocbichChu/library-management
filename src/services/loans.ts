import { employeeBorrowApi, type CreateBorrowSlipRequest } from "@/api/employee-borrow"
import { apiClient } from "@/api/client"
import { adminUsersService } from "@/services/admin-users"
import { managerBooksApi } from "@/api/manager-books"

export interface BorrowSlipItem {
  id: number
  borrowSlipCode: string
  readerId: number
  readerName: string
  readerCode: string
  borrowDate: string
  dueDate: string
  returnedAt?: string | null
  slipStatus: "BORROWING" | "RETURNED" | "OVERDUE"
  note?: string | null
  totalBooks: number
  details: {
    borrowSlipDetailId: number
    bookCopyId: number
    barcode: string
    bookTitle: string
    conditionBefore?: string
    conditionAfter?: string
    returnDate?: string | null
  }[]
}

interface SqlQueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
}

export const loansService = {
  // Get all borrow slips from DB, enriched with reader info and book copies
  getAll: async (params?: {
    status?: string
    keyword?: string
    pageNumber?: number
    pageSize?: number
  }): Promise<BorrowSlipItem[]> => {
    try {
      // 1. Fetch borrow slips, readers, and details in parallel
      const [res, readers, detailsRes] = await Promise.allSettled([
        employeeBorrowApi.getAll({
          Status: params?.status === "all" ? undefined : params?.status,
          Keyword: params?.keyword,
          PageNumber: params?.pageNumber || 1,
          PageSize: params?.pageSize || 50,
        }),
        adminUsersService.getUsers({ UserType: "READER" }),
        apiClient.post<SqlQueryResult | { data: SqlQueryResult }>("/books/execute", {
          sql: "SELECT bsd.borrow_slip_detail_id, bsd.borrow_slip_id, bsd.book_copy_id, bc.barcode, bt.title FROM borrow_slip_detail bsd JOIN book_copy bc ON bsd.book_copy_id = bc.book_copy_id JOIN book_title bt ON bc.book_title_id = bt.book_title_id",
        }),
      ])

      let rawSlips: Record<string, unknown>[] = []
      if (res.status === "fulfilled" && res.value) {
        const val = res.value
        if (Array.isArray(val)) {
          rawSlips = val
        } else if (val && typeof val === "object") {
          if ("items" in val && Array.isArray((val as { items: unknown[] }).items)) {
            rawSlips = (val as { items: Record<string, unknown>[] }).items
          } else if ("data" in val && val.data) {
            if (Array.isArray(val.data)) {
              rawSlips = val.data
            } else if (
              typeof val.data === "object" &&
              "items" in val.data &&
              Array.isArray((val.data as { items: unknown[] }).items)
            ) {
              rawSlips = (val.data as { items: Record<string, unknown>[] }).items
            }
          }
        }
      }

      // 2. Build Reader map: readerId -> AdminUserItem
      const readerMap = new Map<number, { fullName?: string | null; code?: string }>()
      if (readers.status === "fulfilled" && Array.isArray(readers.value)) {
        for (const r of readers.value) {
          if (r.readerId) readerMap.set(r.readerId, { fullName: r.fullName, code: r.code })
        }
      }

      // 3. Build details map: borrowSlipId -> details[]
      const detailsMap = new Map<number, BorrowSlipItem["details"]>()
      if (detailsRes.status === "fulfilled" && detailsRes.value) {
        const val = detailsRes.value
        let rows: Record<string, unknown>[] = []
        if ("rows" in val && Array.isArray(val.rows)) {
          rows = val.rows
        } else if (
          "data" in val &&
          val.data &&
          typeof val.data === "object" &&
          "rows" in val.data &&
          Array.isArray((val.data as { rows: unknown[] }).rows)
        ) {
          rows = (val.data as { rows: Record<string, unknown>[] }).rows
        }

        for (const r of rows) {
          const sid = Number(r.borrow_slip_id || r.borrowSlipId || 0)
          if (!sid) continue
          const list = detailsMap.get(sid) || []
          list.push({
            borrowSlipDetailId: Number(r.borrow_slip_detail_id || 0),
            bookCopyId: Number(r.book_copy_id || 0),
            barcode: String(r.barcode || "BC-UNKNOWN"),
            bookTitle: String(r.title || "Sách thư viện"),
            conditionBefore: "GOOD",
            returnDate: null,
          })
          detailsMap.set(sid, list)
        }
      }

      // 4. Read returned slips from localStorage
      let returnedSlips: Record<string, { returnedAt?: string; slipStatus?: string }> = {}
      try {
        const stored = localStorage.getItem("returned_borrow_slips")
        if (stored) returnedSlips = JSON.parse(stored)
      } catch {
        // ignore
      }

      return rawSlips.map((item) => {
        const id = Number(item.borrowSlipId || item.id || 0)
        const readerId = Number(item.readerId || 1)
        const readerInfo = readerMap.get(readerId)

        const details = detailsMap.get(id) || []
        const localReturn = returnedSlips[id]

        const statusRaw = String(
          localReturn?.slipStatus || item.slipStatus || item.status || "BORROWING"
        ).toUpperCase()

        const slipStatus =
          statusRaw === "RETURNED"
            ? "RETURNED"
            : statusRaw === "OVERDUE"
              ? "OVERDUE"
              : "BORROWING"

        return {
          id,
          borrowSlipCode: String(item.borrowSlipCode || `BS-${id}`),
          readerId,
          readerName:
            readerInfo?.fullName ||
            String(item.readerName || item.fullName || `Độc giả #${readerId}`),
          readerCode: readerInfo?.code || String(item.readerCode || `DG-${readerId}`),
          borrowDate: item.borrowDate
            ? String(item.borrowDate)
            : new Date().toISOString(),
          dueDate: item.dueDate
            ? String(item.dueDate)
            : new Date(Date.now() + 14 * 86400000).toISOString(),
          returnedAt:
            localReturn?.returnedAt ||
            (item.returnedAt ? String(item.returnedAt) : null),
          slipStatus,
          note: item.note ? String(item.note) : null,
          totalBooks: details.length || Number(item.totalBooks || 1),
          details,
        }
      })
    } catch (err) {
      console.error("Failed to load borrow slips from DB:", err)
      return []
    }
  },

  // Create borrow slip (runs Stored Procedure sp_borrow_books)
  createBorrowSlip: async (data: CreateBorrowSlipRequest): Promise<void> => {
    const response = await employeeBorrowApi.create(data)
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      response.success === false
    ) {
      const message =
        "message" in response && typeof response.message === "string"
          ? response.message
          : "Tạo phiếu mượn thất bại."
      throw new Error(message)
    }
  },

  // Return slip
  returnSlip: async (slipId: number, copyIds?: number[]): Promise<void> => {
    // 1. Update each returned book copy back to AVAILABLE in DB
    if (copyIds && copyIds.length > 0) {
      await Promise.allSettled(
        copyIds.map((cid) =>
          managerBooksApi.updateCopy(cid, { copyStatus: "AVAILABLE" })
        )
      )
    }

    // 2. Persist returned status in localStorage so slip stays marked as RETURNED
    try {
      const stored = localStorage.getItem("returned_borrow_slips")
      const list = stored ? JSON.parse(stored) : {}
      list[slipId] = {
        returnedAt: new Date().toISOString(),
        slipStatus: "RETURNED",
      }
      localStorage.setItem("returned_borrow_slips", JSON.stringify(list))
    } catch {
      // Ignore storage errors
    }
  },
}
