import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/types/auth"

export interface PublicBookDto {
  id: number
  title: string
  author: string
  available: boolean
}

interface PublicBooksData {
  data: PublicBookDto[]
}

export const booksApi = {
  getAll: () =>
    apiClient.get<ApiResponse<PublicBooksData>>("/books"),
}
