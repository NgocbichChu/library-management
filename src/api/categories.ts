import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/types/auth"

export interface CategoryDto {
  categoryId: number
  categoryCode: string
  categoryName: string
  description?: string | null
  categoryStatus?: string | null
  bookCount?: number
}

export interface CreateCategoryRequest {
  categoryCode?: string
  categoryName: string
  description?: string
}

export interface UpdateCategoryRequest {
  categoryCode?: string
  categoryName?: string
  description?: string
  categoryStatus?: string
}

export const categoriesApi = {
  // GET /api/categories (Public active categories)
  getAll: () => apiClient.get<ApiResponse<CategoryDto[]> | CategoryDto[]>("/categories"),

  // GET /api/admin/categories
  getAdminCategories: () =>
    apiClient.get<ApiResponse<CategoryDto[]> | CategoryDto[]>("/admin/categories"),

  // POST /api/admin/categories
  create: (data: CreateCategoryRequest) =>
    apiClient.post<ApiResponse<CategoryDto> | CategoryDto>("/admin/categories", data),

  // PATCH /api/admin/categories/{id}
  update: (id: number | string, data: UpdateCategoryRequest) =>
    apiClient.patch<ApiResponse<unknown>>(`/admin/categories/${id}`, data),

  // DELETE /api/admin/categories/{id}
  delete: (id: number | string) =>
    apiClient.delete<ApiResponse<unknown>>(`/admin/categories/${id}`),
}
