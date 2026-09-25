import { create } from "zustand"
import { libraryService } from "@/services/library-service"
import { withLoading } from "@/stores/use-loading-store"
import type {
  BookCopy,
  BookTitle,
  BorrowSlip,
  CategoryItem,
  ConditionStatus,
  DashboardStats,
  Fine,
  Reader,
  SystemPolicy,
} from "@/types/library"

interface LibraryState {
  stats: DashboardStats | null
  books: BookTitle[]
  copies: BookCopy[]
  categories: CategoryItem[]
  readers: Reader[]
  borrowSlips: BorrowSlip[]
  fines: Fine[]
  policy: SystemPolicy | null
  isInitialized: boolean

  // Actions
  fetchStats: () => Promise<void>
  fetchBooks: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchReaders: () => Promise<void>
  fetchBorrowSlips: () => Promise<void>
  fetchPolicy: () => Promise<void>
  fetchAll: () => Promise<void>

  createBook: (
    data: Omit<BookTitle, "book_title_id" | "created_at" | "updated_at">,
    copies?: number
  ) => Promise<BookTitle>
  updateBook: (
    id: number,
    data: Partial<
      Omit<BookTitle, "book_title_id" | "created_at" | "updated_at">
    >
  ) => Promise<BookTitle>
  deleteBook: (id: number) => Promise<void>

  createCopy: (
    data: Omit<BookCopy, "book_copy_id" | "created_at" | "updated_at">
  ) => Promise<BookCopy>

  createCategory: (name: string, description: string) => Promise<CategoryItem>
  updateCategory: (
    id: string,
    name: string,
    description: string
  ) => Promise<CategoryItem>
  deleteCategory: (id: string) => Promise<void>

  createReader: (
    data: Omit<Reader, "reader_id" | "account_id" | "created_at" | "updated_at">
  ) => Promise<Reader>
  updateReader: (
    id: number,
    data: Partial<
      Omit<Reader, "reader_id" | "account_id" | "created_at" | "updated_at">
    >
  ) => Promise<Reader>
  toggleReaderStatus: (id: number) => Promise<Reader>

  createBorrowSlip: (params: {
    readerId: number
    employeeId: number
    bookCopyIds: number[]
    dueDays?: number
    note?: string
  }) => Promise<BorrowSlip>
  returnBorrowSlip: (params: {
    slipId: number
    conditionAfter?: ConditionStatus
    note?: string
  }) => Promise<void>

  payFine: (fineId: number, amount?: number) => Promise<Fine>
  updatePolicy: (data: Partial<SystemPolicy>) => Promise<SystemPolicy>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  stats: null,
  books: [],
  copies: [],
  categories: [],
  readers: [],
  borrowSlips: [],
  fines: [],
  policy: null,
  isInitialized: false,

  fetchStats: async () => {
    const stats = await libraryService.getDashboardStats()
    set({ stats })
  },

  fetchBooks: async () => {
    const [books, copies] = await Promise.all([
      libraryService.getBooks(),
      libraryService.getAllCopies(),
    ])
    set({ books, copies })
  },

  fetchCategories: async () => {
    const categories = await libraryService.getCategories()
    set({ categories })
  },

  fetchReaders: async () => {
    const readers = await libraryService.getReaders()
    set({ readers })
  },

  fetchBorrowSlips: async () => {
    const [borrowSlips, fines] = await Promise.all([
      libraryService.getBorrowSlips(),
      libraryService.getFines(),
    ])
    set({ borrowSlips, fines })
  },

  fetchPolicy: async () => {
    const policy = await libraryService.getSystemPolicy()
    set({ policy })
  },

  fetchAll: async () => {
    return withLoading(async () => {
      const [
        stats,
        books,
        copies,
        categories,
        readers,
        borrowSlips,
        fines,
        policy,
      ] = await Promise.all([
        libraryService.getDashboardStats(),
        libraryService.getBooks(),
        libraryService.getAllCopies(),
        libraryService.getCategories(),
        libraryService.getReaders(),
        libraryService.getBorrowSlips(),
        libraryService.getFines(),
        libraryService.getSystemPolicy(),
      ])
      set({
        stats,
        books,
        copies,
        categories,
        readers,
        borrowSlips,
        fines,
        policy,
        isInitialized: true,
      })
    })
  },

  createBook: async (data, copies = 2) => {
    return withLoading(async () => {
      const newBook = await libraryService.createBook(data, copies)
      await Promise.all([
        get().fetchBooks(),
        get().fetchCategories(),
        get().fetchStats(),
      ])
      return newBook
    })
  },

  updateBook: async (id, data) => {
    return withLoading(async () => {
      const updated = await libraryService.updateBook(id, data)
      await Promise.all([get().fetchBooks(), get().fetchCategories()])
      return updated
    })
  },

  deleteBook: async (id) => {
    return withLoading(async () => {
      await libraryService.deleteBook(id)
      await Promise.all([
        get().fetchBooks(),
        get().fetchCategories(),
        get().fetchStats(),
      ])
    })
  },

  createCopy: async (data) => {
    return withLoading(async () => {
      const newCopy = await libraryService.createCopy(data)
      await Promise.all([get().fetchBooks(), get().fetchStats()])
      return newCopy
    })
  },

  createCategory: async (name, description) => {
    return withLoading(async () => {
      const cat = await libraryService.createCategory(name, description)
      await get().fetchCategories()
      return cat
    })
  },

  updateCategory: async (id, name, description) => {
    return withLoading(async () => {
      const cat = await libraryService.updateCategory(id, name, description)
      await Promise.all([get().fetchCategories(), get().fetchBooks()])
      return cat
    })
  },

  deleteCategory: async (id) => {
    return withLoading(async () => {
      await libraryService.deleteCategory(id)
      await get().fetchCategories()
    })
  },

  createReader: async (data) => {
    return withLoading(async () => {
      const reader = await libraryService.createReader(data)
      await Promise.all([get().fetchReaders(), get().fetchStats()])
      return reader
    })
  },

  updateReader: async (id, data) => {
    return withLoading(async () => {
      const reader = await libraryService.updateReader(id, data)
      await get().fetchReaders()
      return reader
    })
  },

  toggleReaderStatus: async (id) => {
    return withLoading(async () => {
      const reader = await libraryService.toggleReaderStatus(id)
      await Promise.all([get().fetchReaders(), get().fetchStats()])
      return reader
    })
  },

  createBorrowSlip: async (params) => {
    return withLoading(async () => {
      const slip = await libraryService.createBorrowSlip(params)
      await Promise.all([
        get().fetchBorrowSlips(),
        get().fetchBooks(),
        get().fetchStats(),
      ])
      return slip
    })
  },

  returnBorrowSlip: async (params) => {
    return withLoading(async () => {
      await libraryService.returnBorrowSlip(params)
      await Promise.all([
        get().fetchBorrowSlips(),
        get().fetchBooks(),
        get().fetchStats(),
      ])
    })
  },

  payFine: async (fineId, amount) => {
    return withLoading(async () => {
      const fine = await libraryService.payFine(fineId, amount)
      await Promise.all([get().fetchBorrowSlips(), get().fetchStats()])
      return fine
    })
  },

  updatePolicy: async (data) => {
    return withLoading(async () => {
      const policy = await libraryService.updateSystemPolicy(data)
      set({ policy })
      return policy
    })
  },
}))
