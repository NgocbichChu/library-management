import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/types/auth"

export interface CreateBorrowSlipRequest {
  policyId: number
  readerId: number
  borrowDate: string
  dueDate: string
  note?: string | null
  bookCopyIds: number[]
}

export interface BorrowSlipItemDto {
  borrowSlipId: number
  borrowSlipCode: string
  readerId?: number
  readerCode?: string
  readerName?: string
  borrowDate: string
  dueDate: string
  returnedAt?: string | null
  slipStatus: string
  note?: string | null
  totalBooks?: number
  books?: {
    borrowSlipDetailId: number
    bookCopyId: number
    barcode: string
    bookTitle: string
    borrowDate: string
    dueDate: string
    returnDate?: string | null
    detailStatus: string
  }[]
}

export interface GetBorrowSlipsParams {
  ReaderId?: number
  Status?: string
  PageNumber?: number
  PageSize?: number
  Keyword?: string
  SortBy?: string
  SortDirection?: string
}

export const employeeBorrowApi = {
  // GET /api/employee/borrow
  getAll: (params?: GetBorrowSlipsParams) => {
    const query = new URLSearchParams()
    if (params?.ReaderId) query.set("ReaderId", String(params.ReaderId))
    if (params?.Status && params.Status !== "all") query.set("Status", params.Status)
    query.set("PageNumber", String(params?.PageNumber || 1))
    query.set("PageSize", String(params?.PageSize || 20))
    query.set("SortDirection", params?.SortDirection || "desc")
    if (params?.Keyword) query.set("Keyword", params.Keyword)
    if (params?.SortBy) query.set("SortBy", params.SortBy)

    return apiClient.get<ApiResponse<unknown> | unknown>(
      `/employee/borrow?${query.toString()}`
    )
  },

  // POST /api/employee/borrow
  create: (data: CreateBorrowSlipRequest) =>
    apiClient.post<ApiResponse<unknown> | unknown>("/employee/borrow", data),
}
