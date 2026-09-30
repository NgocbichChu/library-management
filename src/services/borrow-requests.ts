export type BorrowRequestStatus =
  | "PENDING"
  | "WAITING_TO_SEND"
  | "APPROVED"
  | "REJECTED"

export interface BorrowRequest {
  id: string
  accountId: number
  readerName: string
  bookTitleId: number
  bookTitle: string
  author: string
  note: string
  requestedAt: string
  status: BorrowRequestStatus
  borrowSlipId?: number
}

const STORAGE_KEY = "library_borrow_requests"

const readRequests = (): BorrowRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? (parsed as BorrowRequest[]) : []
  } catch {
    return []
  }
}

const writeRequests = (requests: BorrowRequest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  window.dispatchEvent(new Event("borrow-requests-updated"))
}

export const borrowRequestsService = {
  getAll: () => readRequests(),

  removeApproved: () => {
    const requests = readRequests()
    const remaining = requests.filter((request) => request.status !== "APPROVED")
    if (remaining.length !== requests.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))
    }
    return remaining
  },

  create: (request: Omit<BorrowRequest, "id" | "requestedAt" | "status">) => {
    const requests = readRequests()
    const duplicate = requests.some(
      (item) =>
        item.accountId === request.accountId &&
        item.bookTitleId === request.bookTitleId &&
        (item.status === "PENDING" || item.status === "WAITING_TO_SEND")
    )
    if (duplicate) {
      throw new Error("Bạn đã có yêu cầu chờ duyệt cho đầu sách này.")
    }

    const nextRequest: BorrowRequest = {
      ...request,
      id: `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      requestedAt: new Date().toISOString(),
      status: "PENDING",
    }
    writeRequests([nextRequest, ...requests])
    return nextRequest
  },

  updateStatus: (
    id: string,
    status: Exclude<BorrowRequestStatus, "PENDING">,
    borrowSlipId?: number
  ) => {
    const requests = readRequests()
    const updated = requests.map((request) =>
      request.id === id
        ? { ...request, status, ...(borrowSlipId ? { borrowSlipId } : {}) }
        : request
    )
    writeRequests(updated)
    return updated.find((request) => request.id === id)
  },

  remove: (id: string) => {
    writeRequests(readRequests().filter((request) => request.id !== id))
  },
}