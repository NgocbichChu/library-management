import { apiClient } from "@/api/client"

interface ExecuteSqlResponse<T> {
  success: boolean
  code: number
  message: string
  data?: {
    columns?: string[]
    rows?: T[]
  }
}

/**
 * Execute raw SQL query against MySQL database via backend endpoint POST /api/books/execute
 */
export async function executeSql<T = Record<string, unknown>>(
  sql: string
): Promise<T[]> {
  try {
    const res = await apiClient.post<ExecuteSqlResponse<T>>("/books/execute", {
      sql,
    })
    if (res?.success && Array.isArray(res.data?.rows)) {
      return res.data.rows
    }
    return []
  } catch (err) {
    console.error("Database executeSql error for query:", sql, err)
    return []
  }
}

/**
 * Execute raw SQL mutation (INSERT, UPDATE, DELETE) against MySQL database
 */
export async function executeSqlMutation(sql: string): Promise<boolean> {
  try {
    const res = await apiClient.post<ExecuteSqlResponse<unknown>>(
      "/books/execute",
      { sql }
    )
    return Boolean(res?.success)
  } catch (err) {
    console.error("Database executeSqlMutation error for query:", sql, err)
    return false
  }
}
