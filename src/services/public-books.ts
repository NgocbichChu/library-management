import {
  booksApi,
  type PublicBookSearchParams,
  type PublicBookDto,
} from "@/api/books"

export type PublicBook = {
  id: string
  title: string
  author: string
  category: string
  description: string
  color: string
  available: number
  categoryId?: number | null
  publicationYear?: number | null
}

export interface PublicBookCategory {
  id: number
  name: string
}

export interface PublicBookSearchResult {
  books: PublicBook[]
  totalRecords: number
  totalPages: number
  hasNextPage: boolean
}

const colors = ["#d9e6d1", "#ead7b4", "#cbdde0", "#e6c8c2", "#d8d1df"]

const mapBook = (book: PublicBookDto, index: number): PublicBook => ({
  id: String(book.bookTitleId),
  title: book.title,
  author: book.author,
  category: book.categoryName || "Chưa phân loại",
  description: book.description || "Thông tin chi tiết của cuốn sách sẽ được cập nhật.",
  color: colors[index % colors.length],
  available: book.availableCopies,
  categoryId: book.categoryId,
  publicationYear: book.publicationYear,
})

export const publicBooksService = {
  search: async (
    params: PublicBookSearchParams = {}
  ): Promise<PublicBookSearchResult> => {
    const response = await booksApi.search(params)
    if (!response.success || !response.data?.items) {
      throw new Error(response.message || "Không thể tải danh sách sách.")
    }
    return {
      books: response.data.items.map(mapBook),
      totalRecords: response.data.totalRecords,
      totalPages: response.data.totalPages,
      hasNextPage: response.data.hasNextPage,
    }
  },
  getAll: async (): Promise<PublicBook[]> => {
    const result = await publicBooksService.search({ pageNumber: 1 })
    return result.books
  },
  getCategories: async (): Promise<PublicBookCategory[]> => {
    const response = await booksApi.getCategories()
    if (!response.success || !Array.isArray(response.data)) {
      throw new Error(response.message || "Không thể tải danh mục sách.")
    }
    return response.data.map((category) => ({
      id: category.categoryId,
      name: category.categoryName,
    }))
  },
}
