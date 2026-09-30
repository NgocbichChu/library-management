export type BookTitleStatus = "Active" | "Discontinued" | "ACTIVE" | "DISCONTINUED"

export type CopyStorageStatus =
  | "Available"
  | "Borrowed"
  | "Maintenance"
  | "Liquidated"
  | "AVAILABLE"
  | "BORROWED"
  | "MAINTENANCE"
  | "LIQUIDATED"

export type CopyConditionStatus =
  | "Good"
  | "SlightlyDamaged"
  | "Damaged"
  | "GOOD"
  | "SLIGHTLY_DAMAGED"
  | "DAMAGED"

export interface BookCopyItem {
  id: string | number
  bookCopyId?: number
  bookTitleId: string | number
  barcode: string
  acquisitionDate: string
  price: number
  location: string
  shelfCode: string
  copyStatus: CopyStorageStatus
  conditionStatus: CopyConditionStatus
  note?: string
}

export interface BookTitleItem {
  id: string
  bookTitleId?: number
  isbn: string
  title: string
  subtitle?: string
  author: string
  publisher: string
  publicationYear: number
  languageCode: string
  categoryId?: number
  category: string
  description: string
  pageCount: number
  coverImageUrl?: string
  bookStatus: BookTitleStatus
  totalCopies: number
  availableCopies: number
  borrowedCopies: number
  color?: string
  copies?: BookCopyItem[]
}

export interface CreateBookTitleInput {
  isbn: string
  title: string
  subtitle?: string
  author: string
  publisher: string
  publicationYear: number
  languageCode: string
  categoryId?: number
  category?: string
  description: string
  pageCount: number
  coverImageUrl?: string
  bookStatus?: BookTitleStatus
}

export interface UpdateBookTitleInput {
  isbn?: string
  title?: string
  subtitle?: string
  author?: string
  publisher?: string
  publicationYear?: number
  languageCode?: string
  categoryId?: number
  category?: string
  description?: string
  pageCount?: number
  coverImageUrl?: string
  bookStatus?: BookTitleStatus
}

export interface AddCopyInput {
  barcode: string
  location?: string
  shelfCode?: string
  price: number
  copyStatus?: CopyStorageStatus
  conditionStatus: CopyConditionStatus
  note?: string
}
