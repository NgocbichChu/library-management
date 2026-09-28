import type {
  Account,
  BookCopy,
  BookTitle,
  BorrowSlip,
  BorrowSlipDetailItem,
  CategoryItem,
  Employee,
  Fine,
  Reader,
  SystemPolicy,
} from "@/types/library"

export const initialAccounts: Account[] = []

export const initialEmployees: Employee[] = []

export const initialReaders: Reader[] = []

export const initialSystemPolicy: SystemPolicy = {
  policy_id: 1,
  policy_code: "POL-STD-2026",
  policy_name: "Quy định mượn trả tiêu chuẩn 2026",
  max_borrow_books: 5,
  max_borrow_days: 14,
  overdue_fine_per_day: 5000,
  student_discount_rate: 20,
  lost_book_fine_rate: 100,
  damaged_book_fine_rate: 50,
  max_fine_amount: 500000,
  effective_from: "2026-01-01",
  effective_to: null,
  policy_status: "ACTIVE",
  description:
    "Quy định tiêu chuẩn áp dụng cho độc giả sinh viên, giảng viên và bạn đọc tự do.",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

export const initialBookTitles: BookTitle[] = []

export const initialBookCopies: BookCopy[] = []

export const initialBorrowSlips: BorrowSlip[] = []

export const initialBorrowSlipDetails: BorrowSlipDetailItem[] = []

export const initialFines: Fine[] = []

export const initialCategories: CategoryItem[] = []

