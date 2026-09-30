import {
  managerBooksApi,
  type BackendBookCopy,
  type BackendBookTitle,
} from "@/api/manager-books"
import type {
  AddCopyInput,
  BookCopyItem,
  BookTitleItem,
  CreateBookTitleInput,
  UpdateBookTitleInput,
} from "@/types/manager-books"

// Color generator based on title
const PALETTE = [
  "#d9e6d1",
  "#ead7b4",
  "#cbdde0",
  "#e6c8c2",
  "#d8d1df",
  "#d4dec1",
  "#e2ead9",
]

const getColorForTitle = (title: string): string => {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % PALETTE.length
  return PALETTE[index]
}

const mapBackendToBookTitleItem = (
  item: BackendBookTitle
): BookTitleItem => {
  const rawId = item.bookTitleId ?? item.id ?? 0
  const idStr = String(rawId)

  // Proper copy calculation:
  // Never assume available=false means borrowed!
  const total = Number(
    item.totalCopies ?? (item.available ? 1 : 0)
  )
  const available = Number(
    item.availableCopies ?? (item.available === false ? 0 : (total > 0 ? total : 0))
  )
  const borrowed = Number(
    item.borrowedCopies ?? (total > available ? total - available : 0)
  )

  const rawStatus = String(item.bookStatus || item.status || "Active").toUpperCase()
  const bookStatus =
    rawStatus === "ACTIVE" ? "Active" : "Discontinued"

  return {
    id: idStr,
    bookTitleId: Number(rawId),
    isbn: String(item.isbn || "978-604-1-00000-0"),
    title: String(item.title || "Tài liệu chưa đặt tên"),
    subtitle: item.subtitle ? String(item.subtitle) : undefined,
    author: String(item.author || "Nhiều tác giả"),
    publisher: String(item.publisher || "NXB Trẻ"),
    publicationYear: Number(item.publicationYear || 2024),
    languageCode: String(item.languageCode || "VIE"),
    categoryId: item.categoryId ? Number(item.categoryId) : undefined,
    category: String(item.categoryName || item.category || "Văn học"),
    description: String(item.description || ""),
    pageCount: Number(item.pageCount || 200),
    coverImageUrl: item.coverImageUrl ? String(item.coverImageUrl) : undefined,
    bookStatus,
    totalCopies: total,
    availableCopies: available,
    borrowedCopies: borrowed,
    color: getColorForTitle(item.title || ""),
    copies: [],
  }
}

export const managerBooksService = {
  // Fetch all book titles from database, sorted by bookTitleId desc
  getAll: async (keyword?: string): Promise<BookTitleItem[]> => {
    let rawList: BackendBookTitle[] = []
    let copyItems: BackendBookCopy[] = []

    try {
      // 1. Primary: Fetch both book titles and copies in parallel
      const [titlesRes, copiesRes] = await Promise.allSettled([
        managerBooksApi.getAll({
          keyword,
          pageNumber: 1,
          pageSize: 200,
          sortBy: "bookTitleId",
          sortDirection: "desc",
        }),
        managerBooksApi.getCopies(),
      ])

      if (titlesRes.status === "fulfilled" && titlesRes.value) {
        const response = titlesRes.value
        if (Array.isArray(response)) {
          rawList = response
        } else if (response && "items" in response && Array.isArray(response.items)) {
          rawList = response.items
        } else if (
          response &&
          "data" in response &&
          response.data &&
          typeof response.data === "object"
        ) {
          if ("items" in response.data && Array.isArray((response.data as { items: BackendBookTitle[] }).items)) {
            rawList = (response.data as { items: BackendBookTitle[] }).items
          } else if ("data" in response.data && Array.isArray((response.data as { data: BackendBookTitle[] }).data)) {
            rawList = (response.data as { data: BackendBookTitle[] }).data
          } else if (Array.isArray(response.data)) {
            rawList = response.data as BackendBookTitle[]
          }
        }
      }

      if (copiesRes.status === "fulfilled" && copiesRes.value) {
        const cData = copiesRes.value
        if (Array.isArray(cData)) {
          copyItems = cData
        } else if (cData && typeof cData === "object") {
          if (
            "data" in cData &&
            cData.data &&
            typeof cData.data === "object" &&
            "items" in cData.data &&
            Array.isArray(cData.data.items)
          ) {
            copyItems = cData.data.items
          } else if ("items" in cData && Array.isArray(cData.items)) {
            copyItems = cData.items
          } else if ("data" in cData && Array.isArray(cData.data)) {
            copyItems = cData.data
          }
        }
      }
    } catch {
      // 2. Secondary fallback: Try search books endpoint
      try {
        const searchRes = await managerBooksApi.searchBooks({
          keyword,
          pageNumber: 1,
          pageSize: 200,
          sortDirection: "desc",
        })
        if (searchRes && "items" in searchRes && Array.isArray(searchRes.items)) {
          rawList = searchRes.items
        } else if (
          searchRes &&
          "data" in searchRes &&
          searchRes.data &&
          typeof searchRes.data === "object" &&
          "items" in searchRes.data &&
          Array.isArray((searchRes.data as { items: BackendBookTitle[] }).items)
        ) {
          rawList = (searchRes.data as { items: BackendBookTitle[] }).items
        }
      } catch {
        rawList = []
      }
    }

    // Aggregate copy statistics by bookTitleId
    const copiesMap = new Map<number, { total: number; available: number; borrowed: number }>()
    for (const copy of copyItems) {
      const tid = Number(copy.bookTitleId)
      if (!tid) continue
      const stat = copiesMap.get(tid) || { total: 0, available: 0, borrowed: 0 }
      stat.total += 1
      if (copy.copyStatus?.toUpperCase() === "BORROWED") {
        stat.borrowed += 1
      } else {
        stat.available += 1
      }
      copiesMap.set(tid, stat)
    }

    // Map to BookTitleItem and attach real copy counts
    const books = rawList.map((item) => {
      const book = mapBackendToBookTitleItem(item)
      const bId = book.bookTitleId ? Number(book.bookTitleId) : Number(book.id)
      const stat = bId ? copiesMap.get(bId) : undefined
      if (stat) {
        book.totalCopies = stat.total
        book.availableCopies = stat.available
        book.borrowedCopies = stat.borrowed
      }
      return book
    })

    // Ensure sorting by ID descending so newly created book is ALWAYS at index 0 (Row 1)
    books.sort((a, b) => {
      const idA = Number(a.id) || 0
      const idB = Number(b.id) || 0
      return idB - idA
    })

    return books
  },

  // Create new book title
  create: async (input: CreateBookTitleInput): Promise<BookTitleItem> => {
    let createdId: number = Date.now()

    try {
      const res = await managerBooksApi.create(input)
      if (typeof res === "number") {
        createdId = res
      } else if (typeof res === "string" && !isNaN(Number(res))) {
        createdId = Number(res)
      } else if (res && typeof res === "object") {
        if ("data" in res) {
          const data = (res as { data: unknown }).data
          if (typeof data === "number") {
            createdId = data
          } else if (typeof data === "string" && !isNaN(Number(data))) {
            createdId = Number(data)
          } else if (data && typeof data === "object") {
            const result = data as Record<string, unknown>
            const returnedId =
              result.id ?? result.bookTitleId ?? result.book_title_id
            if (returnedId !== undefined && !isNaN(Number(returnedId))) {
              createdId = Number(returnedId)
            }
          }
        }
      }
    } catch (err) {
      console.error("Error creating book title:", err)
      throw err
    }

    const newBook: BookTitleItem = {
      id: String(createdId),
      bookTitleId: createdId,
      isbn: input.isbn,
      title: input.title,
      subtitle: input.subtitle,
      author: input.author,
      publisher: input.publisher || "NXB Trẻ",
      publicationYear: input.publicationYear || 2024,
      languageCode: input.languageCode || "VIE",
      categoryId: input.categoryId,
      category: input.category || "Văn học",
      description: input.description,
      pageCount: input.pageCount || 200,
      coverImageUrl: input.coverImageUrl,
      bookStatus: "Active",
      totalCopies: 0,
      availableCopies: 0,
      borrowedCopies: 0,
      color: getColorForTitle(input.title),
      copies: [],
    }

    return newBook
  },

  // Update book title
  update: async (
    id: string | number,
    input: UpdateBookTitleInput
  ): Promise<void> => {
    await managerBooksApi.update(id, input)
  },

  // Delete book title
  delete: async (id: string | number): Promise<void> => {
    await managerBooksApi.delete(id)
  },

  // Get physical copies of a book title from DB
  getCopies: async (bookTitleId: string | number): Promise<BookCopyItem[]> => {
    try {
      const res = await managerBooksApi.getCopies(bookTitleId)
      let copiesList: BackendBookCopy[] = []
      if (Array.isArray(res)) {
        copiesList = res
      } else if (res && "items" in res && Array.isArray(res.items)) {
        copiesList = res.items
      } else if (res && "data" in res && res.data) {
        if (Array.isArray(res.data)) {
          copiesList = res.data
        } else if (typeof res.data === "object" && "items" in res.data && Array.isArray((res.data as { items: BackendBookCopy[] }).items)) {
          copiesList = (res.data as { items: BackendBookCopy[] }).items
        }
      }

      return copiesList.map((c) => ({
        id: c.bookCopyId || String(c.barcode),
        bookCopyId: c.bookCopyId,
        bookTitleId: c.bookTitleId,
        barcode: c.barcode,
        acquisitionDate: c.acquisitionDate
          ? new Date(c.acquisitionDate).toLocaleDateString("vi-VN")
          : new Date().toLocaleDateString("vi-VN"),
        price: c.price || 0,
        location: c.location || "Khu A - Tầng 1",
        shelfCode: c.shelfCode || "Kệ A-01",
        copyStatus:
          c.copyStatus?.toUpperCase() === "BORROWED"
            ? "Borrowed"
            : "Available",
        conditionStatus:
          c.conditionStatus?.toUpperCase() === "DAMAGED"
            ? "Damaged"
            : c.conditionStatus?.toUpperCase() === "SLIGHTLY_DAMAGED"
              ? "SlightlyDamaged"
              : "Good",
        note: c.note,
      }))
    } catch {
      return []
    }
  },

  // Add a physical copy to a book in DB
  addCopy: async (
    bookTitleId: string | number,
    input: AddCopyInput
  ): Promise<BookCopyItem> => {
    const res = await managerBooksApi.createCopy(bookTitleId, input)
    let copyId: string | number = `CP-${Date.now()}`
    if (typeof res === "number") {
      copyId = res
    } else if (typeof res === "string" && !isNaN(Number(res))) {
      copyId = Number(res)
    } else if (res && typeof res === "object") {
      if ("data" in res) {
        const dataVal = (res as { data: unknown }).data
        if (typeof dataVal === "number") {
          copyId = dataVal
        } else if (typeof dataVal === "string" && !isNaN(Number(dataVal))) {
          copyId = Number(dataVal)
        } else if (dataVal && typeof dataVal === "object" && "bookCopyId" in dataVal) {
          copyId = Number((dataVal as { bookCopyId: unknown }).bookCopyId)
        }
      } else if ("bookCopyId" in res) {
        copyId = Number((res as BackendBookCopy).bookCopyId)
      }
    }

    return {
      id: copyId,
      bookTitleId,
      barcode: input.barcode,
      acquisitionDate: new Date().toLocaleDateString("vi-VN"),
      price: input.price,
      location: input.location || "Khu A - Tầng 1",
      shelfCode: input.shelfCode || "Kệ A-01",
      copyStatus: "Available",
      conditionStatus: input.conditionStatus,
      note: input.note,
    }
  },

  // Delete a physical copy from DB
  deleteCopy: async (bookCopyId: string | number): Promise<void> => {
    await managerBooksApi.deleteCopy(bookCopyId)
  },
}
