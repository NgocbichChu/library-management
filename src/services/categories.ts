import { categoriesApi, type CategoryDto, type CreateCategoryRequest, type UpdateCategoryRequest } from "@/api/categories"

export const categoriesService = {
  getAll: async (): Promise<CategoryDto[]> => {
    try {
      const res = await categoriesApi.getAll()
      if (Array.isArray(res)) return res
      if (res && "data" in res && Array.isArray(res.data)) {
        return res.data
      }
      if (res && "data" in res && res.data && typeof res.data === "object" && "items" in res.data && Array.isArray((res.data as { items: CategoryDto[] }).items)) {
        return (res.data as { items: CategoryDto[] }).items
      }
      return []
    } catch (err) {
      // Fallback try admin categories
      try {
        const adminRes = await categoriesApi.getAdminCategories()
        if (Array.isArray(adminRes)) return adminRes
        if (adminRes && "data" in adminRes && Array.isArray(adminRes.data)) {
          return adminRes.data
        }
        return []
      } catch {
        console.error("Failed to load categories:", err)
        return []
      }
    }
  },

  create: async (data: CreateCategoryRequest): Promise<CategoryDto> => {
    const categoryCode =
      data.categoryCode?.trim() || `CAT-${Date.now().toString().slice(-6)}`
    const res = await categoriesApi.create({
      ...data,
      categoryCode,
    })
    if (res && "data" in res && res.data) {
      return res.data as CategoryDto
    }
    return res as unknown as CategoryDto
  },

  update: async (id: number | string, data: UpdateCategoryRequest): Promise<void> => {
    await categoriesApi.update(id, data)
  },

  delete: async (id: number | string): Promise<void> => {
    await categoriesApi.delete(id)
  },
}
