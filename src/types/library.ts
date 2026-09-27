export type AccountStatus = "ACTIVE" | "LOCKED" | "INACTIVE"
export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "RESIGNED"
export type ReaderStatus = "ACTIVE" | "LOCKED" | "EXPIRED"
export type ReaderType = "NORMAL" | "STUDENT" | "TEACHER"
export type BookStatus = "ACTIVE" | "ARCHIVED"
export type CopyStatus =
  "AVAILABLE" | "BORROWED" | "RESERVED" | "LOST" | "DAMAGED"
export type ConditionStatus = "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED"
export type SlipStatus = "BORROWING" | "RETURNED" | "OVERDUE" | "CANCELLED"
export type DetailStatus =
  "BORROWING" | "RETURNED" | "OVERDUE" | "LOST" | "DAMAGED"
export type PolicyStatus = "ACTIVE" | "INACTIVE"
export type FineType = "OVERDUE" | "DAMAGED" | "LOST" | "OTHER"

export interface Account {
  account_id: number
  username: string
  password_hash?: string
  account_status: AccountStatus
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  employee_id: number
  account_id: number
  employee_code: string
  full_name: string
  email: string
  phone_number: string | null
  position: string
  employee_status: EmployeeStatus
  hired_at: string | null
  created_at: string
  updated_at: string
}

export interface Reader {
  reader_id: number
  account_id: number
  reader_code: string
  full_name: string
  email: string
  phone_number: string | null
  date_of_birth: string | null
  address: string | null
  reader_type: ReaderType
  card_created_at: string
  card_expired_at: string | null
  reader_status: ReaderStatus
  created_at: string
  updated_at: string
}

export interface BookTitle {
  book_title_id: number
  isbn: string | null
  title: string
  subtitle: string | null
  author: string
  publisher: string | null
  publication_year: number | null
  language_code: string | null
  category: string
  description: string | null
  page_count: number | null
  cover_image_url: string | null
  book_status: BookStatus
  created_at: string
  updated_at: string
  copies_count?: number
  available_copies_count?: number
}

export interface BookCopy {
  book_copy_id: number
  book_title_id: number
  barcode: string
  acquisition_date: string | null
  price: number | null
  location: string | null
  shelf_code: string | null
  copy_status: CopyStatus
  condition_status: ConditionStatus
  note: string | null
  created_at: string
  updated_at: string
}

export interface SystemPolicy {
  policy_id: number
  policy_code: string
  policy_name: string
  max_borrow_books: number
  max_borrow_days: number
  overdue_fine_per_day: number
  student_discount_rate: number
  lost_book_fine_rate: number
  damaged_book_fine_rate: number
  max_fine_amount: number | null
  effective_from: string
  effective_to: string | null
  policy_status: PolicyStatus
  description: string | null
  created_at: string
  updated_at: string
}

export interface BorrowSlip {
  borrow_slip_id: number
  employee_id: number
  policy_id: number
  reader_id: number
  borrow_slip_code: string
  borrow_date: string
  due_date: string
  returned_at: string | null
  slip_status: SlipStatus
  note: string | null
  created_at: string
  updated_at: string
  reader?: Reader
  employee?: Employee
  details?: BorrowSlipDetailItem[]
}

export interface BorrowSlipDetailItem {
  borrow_slip_detail_id: number
  book_copy_id: number
  borrow_slip_id: number
  borrow_date: string
  due_date: string
  return_date: string | null
  detail_status: DetailStatus
  condition_before: ConditionStatus
  condition_after: ConditionStatus | null
  note: string | null
  created_at: string
  updated_at: string
  book_copy?: BookCopy
  book_title?: BookTitle
  fine?: Fine
}

export interface Fine {
  fine_id: number
  borrow_slip_detail_id: number
  fine_type: FineType
  overdue_days: number
  basic_amount: number
  discount_rate: number
  discount_amount: number
  final_amount: number
  paid_amount: number
  outstanding_amount: number
}

export interface DashboardStats {
  totalTitles: number
  totalCopies: number
  availableCopies: number
  totalReaders: number
  activeLoans: number
  overdueLoans: number
  totalOutstandingFines: number
}

export interface CategoryItem {
  id: string
  name: string
  description: string
  bookCount: number
}
