import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/types/auth"
import type {
  AddCopyInput,
  CreateBookTitleInput,
  UpdateBookTitleInput,
} from "@/types/manager-books"

export interface PageResponse<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface BackendBookTitle {
  bookTitleId?: number
  id?: number
  isbn?: string
  title: string
  subtitle?: string | null
  author: string
  publisher?: string | null
  publicationYear?: number | null
  languageCode?: string | null
  categoryId?: number | null
  categoryName?: string | null
  category?: string | null
  description?: string | null
  pageCount?: number | null
  coverImageUrl?: string | null
  bookStatus?: string | null
  status?: string | null
  totalCopies?: number | null
  availableCopies?: number | null
  borrowedCopies?: number | null
  available?: boolean | null
}

export interface BackendBookCopy {
  bookCopyId: number
  bookTitleId: number
  bookTitle?: string
  barcode: string
  acquisitionDate?: string
  price: number
  location?: string
  shelfCode?: string
  copyStatus: string
  conditionStatus: string
  note?: string
}

export const managerBooksApi = {
  // GET /api/admin/book-titles with descending sort order
  getAll: (params?: { pageNumber?: number; pageSize?: number; keyword?: string; sortBy?: string; sortDirection?: string }) => {
    const query = new URLSearchParams()
    query.set("PageNumber", String(params?.pageNumber || 1))
    query.set("PageSize", String(params?.pageSize || 100))
    query.set("SortBy", params?.sortBy || "bookTitleId")
    query.set("SortDirection", params?.sortDirection || "desc")
    if (params?.keyword) query.set("Keyword", params.keyword)
    return apiClient.get<ApiResponse<PageResponse<BackendBookTitle>> | PageResponse<BackendBookTitle> | ApiResponse<{ data: BackendBookTitle[] }> | BackendBookTitle[]>(
      `/admin/book-titles?${query.toString()}`
    )
  },

  // Fallback / Alternative: GET /api/books/search
  searchBooks: (params?: { pageNumber?: number; pageSize?: number; keyword?: string; sortBy?: string; sortDirection?: string; categoryId?: number }) => {
    const query = new URLSearchParams()
    query.set("pageNumber", String(params?.pageNumber || 1))
    query.set("pageSize", String(params?.pageSize || 100))
    query.set("sortDirection", params?.sortDirection || "desc")
    if (params?.sortBy) query.set("sortBy", params.sortBy)
    if (params?.keyword) query.set("keyword", params.keyword)
    if (params?.categoryId) query.set("categoryId", String(params.categoryId))
    return apiClient.get<ApiResponse<PageResponse<BackendBookTitle>> | PageResponse<BackendBookTitle>>(`/books/search?${query.toString()}`)
  },

  // Legacy demo books endpoint: GET /api/books
  getDemoBooks: () => apiClient.get<ApiResponse<{ data: BackendBookTitle[] }> | { data: BackendBookTitle[] }>("/books"),

  // POST /api/admin/book-titles
  create: (data: CreateBookTitleInput) =>
    apiClient.post<ApiResponse<number | { id: number; bookTitleId: number }> | number>(
      "/admin/book-titles",
      {
        isbn: data.isbn,
        title: data.title,
        subtitle: data.subtitle || null,
        author: data.author,
        publisher: data.publisher || "NXB Trẻ",
        publicationYear: data.publicationYear || new Date().getFullYear(),
        languageCode: data.languageCode || "VIE",
        categoryId: data.categoryId || 1,
        description: data.description || "",
        pageCount: data.pageCount || 200,
        coverImageUrl: data.coverImageUrl || null,
        bookStatus: (data.bookStatus || "ACTIVE").toUpperCase(),
      }
    ),

  // PATCH /api/admin/book-titles/{id}
  update: (id: string | number, data: UpdateBookTitleInput) =>
    apiClient.patch<ApiResponse<unknown>>(`/admin/book-titles/${id}`, {
      isbn: data.isbn,
      title: data.title,
      subtitle: data.subtitle || null,
      author: data.author,
      publisher: data.publisher,
      publicationYear: data.publicationYear,
      languageCode: data.languageCode,
      categoryId: data.categoryId,
      description: data.description,
      pageCount: data.pageCount,
      coverImageUrl: data.coverImageUrl,
      bookStatus: data.bookStatus ? data.bookStatus.toUpperCase() : undefined,
    }),

  // DELETE /api/admin/book-titles/{id}
  delete: (id: string | number) =>
    apiClient.delete<ApiResponse<unknown>>(`/admin/book-titles/${id}`),

  // GET /api/admin/book-copies
  getCopies: (bookTitleId?: string | number) => {
    const query = new URLSearchParams()
    if (bookTitleId && Number(bookTitleId) > 0) {
      query.set("BookTitleId", String(bookTitleId))
    }
    query.set("PageSize", "200")
    return apiClient.get<
      | ApiResponse<PageResponse<BackendBookCopy> | BackendBookCopy[]>
      | PageResponse<BackendBookCopy>
      | BackendBookCopy[]
    >(`/admin/book-copies?${query.toString()}`)
  },

  // POST /api/admin/book-copies
  createCopy: (bookTitleId: string | number, copy: AddCopyInput) =>
    apiClient.post<ApiResponse<BackendBookCopy> | BackendBookCopy>("/admin/book-copies", {
      bookTitleId: Number(bookTitleId),
      barcode: copy.barcode,
      acquisitionDate: new Date().toISOString(),
      price: copy.price || 0,
      location: copy.location || "Khu A - Tầng 1",
      shelfCode: copy.shelfCode || "Kệ A-01",
      copyStatus: (copy.copyStatus || "AVAILABLE").toUpperCase(),
      conditionStatus: (copy.conditionStatus || "GOOD").toUpperCase(),
      note: copy.note || "",
    }),

  // PATCH /api/admin/book-copies/{bookCopyId}
  updateCopy: (
    bookCopyId: string | number,
    data: {
      copyStatus?: string
      conditionStatus?: string
      price?: number
      location?: string
      shelfCode?: string
      note?: string
    }
  ) =>
    apiClient.patch<ApiResponse<unknown>>(`/admin/book-copies/${bookCopyId}`, {
      copyStatus: data.copyStatus ? data.copyStatus.toUpperCase() : undefined,
      conditionStatus: data.conditionStatus
        ? data.conditionStatus.toUpperCase()
        : undefined,
      price: data.price,
      location: data.location,
      shelfCode: data.shelfCode,
      note: data.note,
    }),

  // DELETE /api/admin/book-copies/{bookCopyId}
  deleteCopy: (bookCopyId: string | number) =>
    apiClient.delete<ApiResponse<unknown>>(`/admin/book-copies/${bookCopyId}`),
}
