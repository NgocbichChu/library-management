import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/types/auth"
import type {
  CreateBookTitleInput,
  UpdateBookTitleInput,
} from "@/types/manager-books"

export const managerBooksApi = {
  // GET /api/books
  getAll: () => apiClient.get<ApiResponse<{ data: unknown[] }>>("/books"),

  // POST /api/admin/book-titles
  create: (data: CreateBookTitleInput) =>
    apiClient.post<ApiResponse<unknown>>("/admin/book-titles", data),

  // PATCH /api/admin/book-titles/{id}
  update: (id: string | number, data: UpdateBookTitleInput) =>
    apiClient.patch<ApiResponse<unknown>>(`/admin/book-titles/${id}`, data),

  // DELETE /api/admin/book-titles/{id}
  delete: (id: string | number) =>
    apiClient.delete<ApiResponse<unknown>>(`/admin/book-titles/${id}`),
}
