import { managerBooksApi } from "@/api/manager-books"
import type {
  AddCopyInput,
  BookCopyItem,
  BookTitleItem,
  BookTitleStatus,
  CreateBookTitleInput,
  UpdateBookTitleInput,
} from "@/types/manager-books"

const METADATA_KEY = "library_book_metadata_cache"

const loadMetadata = (): Map<string, Partial<BookTitleItem>> => {
  const map = new Map<string, Partial<BookTitleItem>>()
  try {
    const raw = localStorage.getItem(METADATA_KEY)
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, Partial<BookTitleItem>>
      Object.entries(obj).forEach(([k, v]) => map.set(k, v))
    }
  } catch {
    // Ignore
  }
  return map
}

const saveMetadata = (map: Map<string, Partial<BookTitleItem>>) => {
  try {
    const obj: Record<string, Partial<BookTitleItem>> = {}
    map.forEach((v, k) => {
      obj[k] = v
    })
    localStorage.setItem(METADATA_KEY, JSON.stringify(obj))
  } catch {
    // Ignore
  }
}

// Cache for supplementary properties not returned by GET /api/books (like description, copies, price)
const bookMetadataCache: Map<string, Partial<BookTitleItem>> = loadMetadata()


export const managerBooksService = {
  // Fetch all books directly from backend API (connected to MySQL/MariaDB)
  getAll: async (): Promise<BookTitleItem[]> => {
    const response = await managerBooksApi.getAll()
    const rawList =
      (response.data as { data?: unknown[] })?.data ||
      (Array.isArray(response.data) ? response.data : null)

    if (response.success && Array.isArray(rawList)) {
      return (rawList as Record<string, unknown>[]).map((item) => {
        const rawId = item.id ?? item.bookTitleId ?? item.book_title_id
        const strId = String(rawId)
        const cached = bookMetadataCache.get(strId)

        const rawTitle = String(item.title || "Tài liệu chưa đặt tên")
        const category = String(item.category || cached?.category || "Văn học")
        const price = Number(item.price || cached?.price || 85000)

        const copies: BookCopyItem[] =
          cached?.copies && cached.copies.length > 0
            ? cached.copies
            : [
                {
                  id: `CP-${rawId}-01`,
                  bookTitleId: strId,
                  barcode: `8936041000${rawId}1`,
                  acquisitionDate: new Date().toLocaleDateString("vi-VN"),
                  price,
                  location: "Khu A - Tầng 1",
                  shelfCode: `Kệ A-0${rawId}`,
                  copyStatus: "Available",
                  conditionStatus: "Good",
                },
              ]

        const totalCopies = copies.length
        const availableCopies = copies.filter(
          (c) => c.copyStatus === "Available"
        ).length
        const borrowedCopies = totalCopies - availableCopies

        return {
          id: strId,
          isbn: String(
            item.isbn || cached?.isbn || `978-604-1-0000${rawId}-0`
          ),
          title: rawTitle,
          subtitle: item.subtitle ? String(item.subtitle) : cached?.subtitle,
          author: String(item.author || "Nhiều tác giả"),
          publisher: String(item.publisher || cached?.publisher || "NXB Trẻ"),
          publicationYear: Number(
            item.publicationYear || cached?.publicationYear || 2024
          ),
          languageCode: String(
            item.languageCode || cached?.languageCode || "VIE"
          ),
          category,
          description: String(
            item.description ||
              cached?.description ||
              "Tài liệu lưu hành tại thư viện Mộc Miên."
          ),
          pageCount: Number(item.pageCount || cached?.pageCount || 200),
          price,
          coverImageUrl: item.coverImageUrl
            ? String(item.coverImageUrl)
            : cached?.coverImageUrl,
          bookStatus: (item.bookStatus as BookTitleStatus) || "Active",
          totalCopies,
          availableCopies,
          borrowedCopies,
          color: cached?.color || "#e2ead9",
          copies,
        }
      })
    }
    return []
  },

  // Create new book title directly in SQL database via backend API
  create: async (input: CreateBookTitleInput): Promise<BookTitleItem> => {
    const res = await managerBooksApi.create(input)
    if (!res || !res.success) {
      throw new Error(res?.message || "Tạo đầu sách thất bại trên máy chủ.")
    }
    const createdId = String(res.data)
    bookMetadataCache.set(createdId, input)
    saveMetadata(bookMetadataCache)

    const initialPrice = Number(input.price) || 85000
    const newBook: BookTitleItem = {
      id: createdId,
      isbn: input.isbn,
      title: input.title,
      subtitle: input.subtitle,
      author: input.author,
      publisher: input.publisher,
      publicationYear: input.publicationYear,
      languageCode: input.languageCode || "VIE",
      category: input.category,
      description: input.description,
      pageCount: input.pageCount,
      price: initialPrice,
      coverImageUrl: input.coverImageUrl,
      bookStatus: input.bookStatus || "Active",
      totalCopies: 1,
      availableCopies: 1,
      borrowedCopies: 0,
      copies: [
        {
          id: `CP-${createdId}-01`,
          bookTitleId: createdId,
          barcode: `893${Date.now().toString().slice(-9)}1`,
          acquisitionDate: new Date().toLocaleDateString("vi-VN"),
          price: initialPrice,
          location: "Khu A - Tầng 1",
          shelfCode: "Kệ A-01",
          copyStatus: "Available",
          conditionStatus: "Good",
        },
      ],
    }
    return newBook
  },

  // Update book title directly in SQL database via backend API
  update: async (
    id: string,
    input: UpdateBookTitleInput
  ): Promise<BookTitleItem> => {
    const res = await managerBooksApi.update(id, input)
    if (res && res.success === false) {
      throw new Error(res.message || "Cập nhật đầu sách thất bại.")
    }
    const cached = bookMetadataCache.get(id) || {}
    bookMetadataCache.set(id, { ...cached, ...input })
    saveMetadata(bookMetadataCache)

    return {
      id,
      ...cached,
      ...input,
    } as BookTitleItem
  },

  // Delete book title directly from SQL database via backend API
  delete: async (id: string): Promise<void> => {
    const res = await managerBooksApi.delete(id)
    if (res && res.success === false) {
      throw new Error(res.message || "Xóa đầu sách thất bại.")
    }
    bookMetadataCache.delete(id)
    saveMetadata(bookMetadataCache)
  },

  // Add copy
  addCopy: async (
    bookTitleId: string,
    input: AddCopyInput
  ): Promise<BookCopyItem> => {
    const cached = bookMetadataCache.get(bookTitleId) || {}
    const copies = cached.copies || []
    const newCopy: BookCopyItem = {
      id: `CP-${Date.now()}`,
      bookTitleId,
      barcode: input.barcode,
      acquisitionDate: new Date().toLocaleDateString("vi-VN"),
      price: Number(input.price) || 85000,
      location: input.location || "Khu A - Tầng 1",
      shelfCode: input.shelfCode || "Kệ A-01",
      copyStatus: "Available",
      conditionStatus: input.conditionStatus || "Good",
    }
    bookMetadataCache.set(bookTitleId, {
      ...cached,
      copies: [...copies, newCopy],
    })
    saveMetadata(bookMetadataCache)
    return newCopy
  },

  // Remove copy
  removeCopy: async (bookTitleId: string, copyId: string): Promise<void> => {
    const cached = bookMetadataCache.get(bookTitleId) || {}
    const copies = (cached.copies || []).filter((c) => c.id !== copyId)
    bookMetadataCache.set(bookTitleId, {
      ...cached,
      copies,
    })
    saveMetadata(bookMetadataCache)
  },
}
