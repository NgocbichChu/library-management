import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/types/auth"

export interface PublicBookDto {
  bookTitleId: number
  isbn: string | null
  title: string
  subtitle: string | null
  author: string
  publisher: string | null
  publicationYear: number | null
  languageCode: string | null
  categoryId: number | null
  categoryName: string | null
  description: string | null
  pageCount: number | null
  coverImageUrl: string | null
  bookStatus: string
  totalCopies: number
  availableCopies: number
}

export interface PublicBookSearchParams {
  keyword?: string
  isbn?: string
  title?: string
  author?: string
  publisher?: string
  publicationYear?: number
  languageCode?: string
  categoryId?: number
  bookStatus?: string
  availableOnly?: boolean
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export interface PublicBooksData {
  items: PublicBookDto[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNextPage: boolean
}

export interface PublicCategoryDto {
  categoryId: number
  categoryCode: string
  categoryName: string
  description: string | null
}

export const booksApi = {
  search: (params: PublicBookSearchParams = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value))
    })
    return apiClient.get<ApiResponse<PublicBooksData>>(
      `/books/search?${query.toString()}`
    )
  },
  getCategories: () =>
    apiClient.get<ApiResponse<PublicCategoryDto[]>>("/categories"),
}
