export type BookTitleStatus = "Active" | "Discontinued"

export type CopyStorageStatus =
  "Available" | "Borrowed" | "Maintenance" | "Liquidated"

export type CopyConditionStatus = "Good" | "SlightlyDamaged" | "Damaged"

export interface BookCopyItem {
  id: string
  bookTitleId: string
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
  isbn: string
  title: string
  subtitle?: string
  author: string
  publisher: string
  publicationYear: number
  languageCode: string
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
  category: string
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
  category?: string
  description?: string
  pageCount?: number
  coverImageUrl?: string
  bookStatus?: BookTitleStatus
}

export interface AddCopyInput {
  barcode: string
  location: string
  shelfCode: string
  price: number
  conditionStatus: CopyConditionStatus
}
