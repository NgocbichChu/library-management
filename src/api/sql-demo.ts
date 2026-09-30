import { apiClient } from "@/api/client"

export interface SqlExecutionResult {
  columns: string[]
  rows: Record<string, unknown>[]
}

interface SqlExecutionResponse {
  success?: boolean
  message?: string
  data?: {
    columns?: unknown
    rows?: unknown
  }
}

export async function executeSql(sql: string): Promise<SqlExecutionResult> {
  const response = await apiClient.post<SqlExecutionResponse>(
    "/books/execute",
    { sql },
    { skipAuth: true }
  )

  if (!response.success || !response.data) {
    throw new Error(response.message || "API không trả về kết quả SQL.")
  }

  const columns = Array.isArray(response.data.columns)
    ? response.data.columns.filter(
        (column): column is string => typeof column === "string"
      )
    : []
  const rows = Array.isArray(response.data.rows)
    ? response.data.rows.filter(
        (row): row is Record<string, unknown> =>
          typeof row === "object" && row !== null && !Array.isArray(row)
      )
    : []

  return { columns, rows }
}

export const sqlDemoTables = [
  {
    name: "borrow_slip_detail",
    label: "Chi tiết phiếu mượn",
    sql: "SELECT * FROM app_db.borrow_slip_detail ORDER BY borrow_slip_detail_id DESC LIMIT 20",
  },
  {
    name: "book_copy",
    label: "Bản sao sách",
    sql: "SELECT * FROM app_db.book_copy ORDER BY book_copy_id DESC LIMIT 20",
  },
] as const

export interface SqlDemoSnapshot {
  name: string
  label: string
  result: SqlExecutionResult
}

export async function loadSqlDemoSnapshots(): Promise<SqlDemoSnapshot[]> {
  return Promise.all(
    sqlDemoTables.map(async (table) => ({
      name: table.name,
      label: table.label,
      result: await executeSql(table.sql),
    }))
  )
}
