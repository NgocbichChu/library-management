import { apiClient } from "@/api/client"
import { executeSql, type SqlExecutionResult } from "@/api/sql-demo"

export interface LoanDemoBookCopy {
  book_copy_id: number
  book_title_id: number
  title: string
  barcode: string
  available_copies: number
  total_copies: number
  reader_id: number
  reader_code: string
  full_name: string
  policy_id: number
  max_borrow_days: number
}

export interface CreateBorrowSlipRequest {
  policyId: number
  readerId: number
  borrowDate: string
  dueDate: string
  note: string
  bookCopyIds: number[]
}

interface ApiResult {
  success?: boolean
  message?: string
}

const copyAndInventorySql = `SELECT
  bc.book_copy_id,
  bc.book_title_id,
  bt.title,
  bc.barcode,
  inventory.available_copies,
  inventory.total_copies,
  reader.reader_id,
  reader.reader_code,
  reader.full_name,
  policy.policy_id,
  policy.max_borrow_days
FROM app_db.book_copy AS bc
JOIN app_db.book_title AS bt ON bt.book_title_id = bc.book_title_id
JOIN (
  SELECT book_title_id, COUNT(*) AS total_copies,
    SUM(copy_status = 'AVAILABLE') AS available_copies
  FROM app_db.book_copy
  GROUP BY book_title_id
) AS inventory ON inventory.book_title_id = bc.book_title_id
CROSS JOIN (
  SELECT reader_id, reader_code, full_name
  FROM app_db.reader
  WHERE reader_status = 'ACTIVE'
  ORDER BY reader_id
  LIMIT 1
) AS reader
CROSS JOIN (
  SELECT policy_id, max_borrow_days
  FROM app_db.system_policy
  WHERE policy_status = 'ACTIVE'
  ORDER BY effective_from DESC
  LIMIT 1
) AS policy
WHERE bc.copy_status = 'AVAILABLE'
ORDER BY bt.title, bc.book_copy_id`

export async function loadLoanDemoCopies(): Promise<LoanDemoBookCopy[]> {
  const result: SqlExecutionResult = await executeSql(copyAndInventorySql)
  const byTitle = new Map<number, LoanDemoBookCopy>()
  for (const row of result.rows) {
    const copy: LoanDemoBookCopy = {
      book_copy_id: Number(row.book_copy_id),
      book_title_id: Number(row.book_title_id),
      title: String(row.title),
      barcode: String(row.barcode),
      available_copies: Number(row.available_copies),
      total_copies: Number(row.total_copies),
      reader_id: Number(row.reader_id),
      reader_code: String(row.reader_code),
      full_name: String(row.full_name),
      policy_id: Number(row.policy_id),
      max_borrow_days: Number(row.max_borrow_days),
    }
    if (!byTitle.has(copy.book_title_id)) {
      byTitle.set(copy.book_title_id, copy)
    }
  }
  return [...byTitle.values()]
}

export async function createApprovedBorrowSlip(
  request: CreateBorrowSlipRequest
): Promise<void> {
  const response = await apiClient.post<ApiResult>("/employee/borrow", request)
  if (response.success === false) {
    throw new Error(response.message || "API không duyệt phiếu mượn.")
  }
}
