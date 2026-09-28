import { managerBooksService } from "@/services/manager-books"
import { adminUsersService } from "@/services/admin-users"
import { executeSql, executeSqlMutation } from "@/services/database"
import type {
  BookCopy,
  BookTitle,
  BorrowSlip,
  BorrowSlipDetailItem,
  CategoryItem,
  ConditionStatus,
  DashboardStats,
  Employee,
  Fine,
  Reader,
  ReaderStatus,
  SystemPolicy,
} from "@/types/library"

function esc(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "NULL"
  if (typeof val === "number") return String(val)
  return `'${String(val).replace(/'/g, "''")}'`
}

function sqlDateTime(d?: Date | string | null): string {
  if (!d) return "NOW()"
  try {
    const dt = typeof d === "string" ? new Date(d) : d
    if (isNaN(dt.getTime())) return "NOW()"
    return `'${dt.toISOString().slice(0, 19).replace("T", " ")}'`
  } catch {
    return "NOW()"
  }
}

// In-memory data store as reactive cache synced with MySQL
let bookTitles: BookTitle[] = []
let bookCopies: BookCopy[] = []
let readers: Reader[] = []
let employees: Employee[] = []
let borrowSlips: BorrowSlip[] = []
let fines: Fine[] = []
const CATEGORIES_CACHE_KEY = "library_custom_categories_cache"

const loadLocalCategories = (): CategoryItem[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalCategories = (cats: CategoryItem[]) => {
  try {
    localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cats))
  } catch {
    // ignore
  }
}

let systemPolicy: SystemPolicy = {
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
  description: "Quy định tiêu chuẩn áp dụng cho độc giả.",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const libraryService = {
  // === DASHBOARD STATS (Live from MySQL) ===
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const rows = await executeSql<{
        total_titles: number
        total_copies: number
        available_copies: number
        total_readers: number
        active_loans: number
        overdue_loans: number
        total_outstanding_fines: number
      }>(
        "SELECT " +
          "(SELECT COUNT(*) FROM book_title) as total_titles, " +
          "(SELECT COUNT(*) FROM book_copy) as total_copies, " +
          "(SELECT COUNT(*) FROM book_copy WHERE copy_status = 'AVAILABLE') as available_copies, " +
          "(SELECT COUNT(*) FROM reader WHERE reader_status = 'ACTIVE') as total_readers, " +
          "(SELECT COUNT(*) FROM borrow_slip WHERE slip_status = 'BORROWING') as active_loans, " +
          "(SELECT COUNT(*) FROM borrow_slip WHERE slip_status = 'OVERDUE') as overdue_loans, " +
          "(SELECT COALESCE(SUM(outstanding_amount), 0) FROM fine) as total_outstanding_fines;"
      )
      if (rows && rows.length > 0) {
        const r = rows[0]
        return {
          totalTitles: Number(r.total_titles) || 0,
          totalCopies: Number(r.total_copies) || 0,
          availableCopies: Number(r.available_copies) || 0,
          totalReaders: Number(r.total_readers) || 0,
          activeLoans: Number(r.active_loans) || 0,
          overdueLoans: Number(r.overdue_loans) || 0,
          totalOutstandingFines: Number(r.total_outstanding_fines) || 0,
        }
      }
    } catch {
      // fallback
    }

    return {
      totalTitles: bookTitles.length,
      totalCopies: bookCopies.length,
      availableCopies: bookCopies.filter((c) => c.copy_status === "AVAILABLE").length,
      totalReaders: readers.filter((r) => r.reader_status === "ACTIVE").length,
      activeLoans: borrowSlips.filter((s) => s.slip_status === "BORROWING").length,
      overdueLoans: borrowSlips.filter((s) => s.slip_status === "OVERDUE").length,
      totalOutstandingFines: fines.reduce((sum, f) => sum + f.outstanding_amount, 0),
    }
  },

  // === BOOKS (book_title in MySQL) ===
  getBooks: async (): Promise<BookTitle[]> => {
    try {
      const rows = await executeSql<{
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
        book_status: string
        created_at: string
        updated_at: string
        copies_count: number
        available_copies_count: number
      }>(
        "SELECT b.*, " +
          "(SELECT COUNT(*) FROM book_copy c WHERE c.book_title_id = b.book_title_id) as copies_count, " +
          "(SELECT COUNT(*) FROM book_copy c WHERE c.book_title_id = b.book_title_id AND c.copy_status = 'AVAILABLE') as available_copies_count " +
          "FROM book_title b ORDER BY b.book_title_id DESC;"
      )

      if (rows && rows.length > 0) {
        bookTitles = rows.map((r) => ({
          book_title_id: Number(r.book_title_id),
          isbn: r.isbn,
          title: r.title,
          subtitle: r.subtitle,
          author: r.author,
          publisher: r.publisher,
          publication_year: r.publication_year ? Number(r.publication_year) : null,
          language_code: r.language_code,
          category: r.category,
          description: r.description,
          page_count: r.page_count ? Number(r.page_count) : null,
          cover_image_url: r.cover_image_url,
          book_status: r.book_status === "Active" ? "ACTIVE" : "ARCHIVED",
          copies_count: Number(r.copies_count) || 0,
          available_copies_count: Number(r.available_copies_count) || 0,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }))
        return bookTitles
      }
    } catch {
      // Fallback to managerBooksService
    }

    try {
      const beBooks = await managerBooksService.getAll()
      bookTitles = beBooks.map((item) => ({
        book_title_id: Number(item.id) || 1,
        isbn: item.isbn || null,
        title: item.title,
        subtitle: item.subtitle ?? null,
        author: item.author,
        publisher: item.publisher ?? null,
        publication_year: item.publicationYear ?? null,
        language_code: item.languageCode ?? null,
        category: item.category,
        description: item.description ?? null,
        page_count: item.pageCount ?? null,
        cover_image_url: item.coverImageUrl ?? null,
        book_status: item.bookStatus === "Active" ? "ACTIVE" : "ARCHIVED",
        copies_count: item.totalCopies,
        available_copies_count: item.availableCopies,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    } catch {
      // Keep existing
    }

    return bookTitles
  },

  getBookById: async (id: number): Promise<BookTitle | null> => {
    if (bookTitles.length === 0) {
      await libraryService.getBooks()
    }
    const book = bookTitles.find((b) => b.book_title_id === id)
    if (!book) return null
    return book
  },

  createBook: async (
    data: Omit<BookTitle, "book_title_id" | "created_at" | "updated_at">,
    initialCopies = 1
  ): Promise<BookTitle> => {
    const createdItem = await managerBooksService.create({
      title: data.title,
      subtitle: data.subtitle || undefined,
      author: data.author,
      isbn: data.isbn || `978-604-${Date.now().toString().slice(-6)}`,
      publisher: data.publisher || "NXB Tổng Hợp",
      publicationYear: data.publication_year || new Date().getFullYear(),
      languageCode: data.language_code || "VIE",
      category: data.category,
      description: data.description || "",
      pageCount: data.page_count || 100,
      coverImageUrl: data.cover_image_url || undefined,
      bookStatus: data.book_status === "ACTIVE" ? "Active" : "Discontinued",
    })

    const bookId = Number(createdItem.id) || Date.now()

    // Create copies in MySQL table book_copy
    for (let c = 1; c <= initialCopies; c++) {
      const barcode = `BC-${String(bookId).padStart(3, "0")}-0${c}`
      await executeSqlMutation(
        `INSERT INTO book_copy (book_title_id, barcode, acquisition_date, price, location, shelf_code, copy_status, condition_status, note, created_at, updated_at) VALUES (${bookId}, ${esc(barcode)}, NOW(), 85000, 'Khu Tổng Hợp', 'Kệ A-01', 'AVAILABLE', 'GOOD', 'Bản sao lưu thông', NOW(), NOW());`
      )
    }

    await libraryService.getBooks()
    const newBook = bookTitles.find((b) => b.book_title_id === bookId)
    return (
      newBook || {
        book_title_id: bookId,
        isbn: createdItem.isbn || null,
        title: createdItem.title,
        subtitle: createdItem.subtitle ?? null,
        author: createdItem.author,
        publisher: createdItem.publisher ?? null,
        publication_year: createdItem.publicationYear ?? null,
        language_code: createdItem.languageCode ?? null,
        category: createdItem.category,
        description: createdItem.description ?? null,
        page_count: createdItem.pageCount ?? null,
        cover_image_url: createdItem.coverImageUrl ?? null,
        book_status: createdItem.bookStatus === "Active" ? "ACTIVE" : "ARCHIVED",
        copies_count: initialCopies,
        available_copies_count: initialCopies,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    )
  },

  updateBook: async (
    id: number,
    data: Partial<Omit<BookTitle, "book_title_id" | "created_at" | "updated_at">>
  ): Promise<BookTitle> => {
    await managerBooksService.update(String(id), {
      title: data.title,
      subtitle: data.subtitle ?? undefined,
      author: data.author,
      isbn: data.isbn ?? undefined,
      publisher: data.publisher ?? undefined,
      publicationYear: data.publication_year ?? undefined,
      languageCode: data.language_code ?? undefined,
      category: data.category,
      description: data.description ?? undefined,
      pageCount: data.page_count ?? undefined,
      coverImageUrl: data.cover_image_url ?? undefined,
      bookStatus:
        data.book_status === "ACTIVE"
          ? "Active"
          : data.book_status === "ARCHIVED"
            ? "Discontinued"
            : undefined,
    })

    await libraryService.getBooks()
    const updated = bookTitles.find((b) => b.book_title_id === id)
    if (!updated) throw new Error("Không tìm thấy đầu sách sau cập nhật")
    return updated
  },

  deleteBook: async (id: number): Promise<void> => {
    // Delete copies from MySQL first
    await executeSqlMutation(
      `DELETE FROM book_copy WHERE book_title_id = ${id};`
    )
    await managerBooksService.delete(String(id))
    bookTitles = bookTitles.filter((b) => b.book_title_id !== id)
    bookCopies = bookCopies.filter((c) => c.book_title_id !== id)
  },

  // === COPIES (book_copy in MySQL) ===
  getAllCopies: async (): Promise<BookCopy[]> => {
    try {
      const rows = await executeSql<{
        book_copy_id: number
        book_title_id: number
        barcode: string
        acquisition_date: string | null
        price: number | null
        location: string | null
        shelf_code: string | null
        copy_status: string
        condition_status: string
        note: string | null
        created_at: string
        updated_at: string
      }>("SELECT * FROM book_copy ORDER BY book_copy_id ASC;")

      if (rows && rows.length > 0) {
        bookCopies = rows.map((r) => ({
          book_copy_id: Number(r.book_copy_id),
          book_title_id: Number(r.book_title_id),
          barcode: r.barcode,
          acquisition_date: r.acquisition_date ? String(r.acquisition_date).slice(0, 10) : "2026-01-01",
          price: Number(r.price) || 85000,
          location: r.location || "Khu Tổng Hợp",
          shelf_code: r.shelf_code || "Kệ A-01",
          copy_status: r.copy_status === "BORROWED" ? "BORROWED" : "AVAILABLE",
          condition_status: (r.condition_status as ConditionStatus) || "GOOD",
          note: r.note || "Bản sao lưu thông",
          created_at: r.created_at,
          updated_at: r.updated_at,
        }))
        return bookCopies
      }
    } catch {
      // fallback
    }
    return [...bookCopies]
  },

  getCopiesByBookId: async (bookTitleId: number): Promise<BookCopy[]> => {
    if (bookCopies.length === 0) {
      await libraryService.getAllCopies()
    }
    return bookCopies.filter((c) => c.book_title_id === bookTitleId)
  },

  createCopy: async (
    data: Omit<BookCopy, "book_copy_id" | "created_at" | "updated_at">
  ): Promise<BookCopy> => {
    await executeSqlMutation(
      `INSERT INTO book_copy (book_title_id, barcode, acquisition_date, price, location, shelf_code, copy_status, condition_status, note, created_at, updated_at) ` +
        `VALUES (${data.book_title_id}, ${esc(data.barcode)}, ${esc(data.acquisition_date || "2026-01-01")}, ${data.price || 85000}, ${esc(data.location || "Khu Tổng Hợp")}, ${esc(data.shelf_code || "Kệ A-01")}, ${esc(data.copy_status || "AVAILABLE")}, ${esc(data.condition_status || "GOOD")}, ${esc(data.note || "")}, NOW(), NOW());`
    )
    await libraryService.getAllCopies()
    return (
      bookCopies.find((c) => c.barcode === data.barcode) || {
        ...data,
        book_copy_id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    )
  },

  updateCopy: async (
    id: number,
    data: Partial<Omit<BookCopy, "book_copy_id" | "created_at" | "updated_at">>
  ): Promise<BookCopy> => {
    const sets: string[] = ["updated_at = NOW()"]
    if (data.copy_status) sets.push(`copy_status = ${esc(data.copy_status)}`)
    if (data.condition_status)
      sets.push(`condition_status = ${esc(data.condition_status)}`)
    if (data.price !== undefined) sets.push(`price = ${data.price}`)
    if (data.location) sets.push(`location = ${esc(data.location)}`)
    if (data.shelf_code) sets.push(`shelf_code = ${esc(data.shelf_code)}`)
    if (data.note !== undefined) sets.push(`note = ${esc(data.note)}`)

    await executeSqlMutation(
      `UPDATE book_copy SET ${sets.join(", ")} WHERE book_copy_id = ${id};`
    )
    await libraryService.getAllCopies()
    const updated = bookCopies.find((c) => c.book_copy_id === id)
    if (!updated) throw new Error("Không tìm thấy bản sao.")
    return updated
  },

  deleteCopy: async (id: number): Promise<void> => {
    const copy = bookCopies.find((c) => c.book_copy_id === id)
    if (copy && copy.copy_status === "BORROWED") {
      throw new Error("Không thể xóa bản sao đang trong trạng thái cho mượn.")
    }
    await executeSqlMutation(
      `DELETE FROM book_copy WHERE book_copy_id = ${id} AND copy_status != 'BORROWED';`
    )
    bookCopies = bookCopies.filter((c) => c.book_copy_id !== id)
  },

  // === CATEGORIES (Synchronized with MySQL system_policy rows & book_title) ===
  getCategories: async (): Promise<CategoryItem[]> => {
    let storedCategories: CategoryItem[] = loadLocalCategories()

    // 1. Fetch persistent categories from system_policy rows (policy_id >= 1000)
    try {
      const pRows = await executeSql<{
        policy_id: number
        policy_name: string
        description: string | null
      }>(
        "SELECT policy_id, policy_name, description FROM system_policy WHERE policy_id >= 1000 ORDER BY policy_id ASC;"
      )
      if (pRows && pRows.length > 0) {
        storedCategories = pRows.map((r) => ({
          id: String(r.policy_id),
          name: r.policy_name,
          description: r.description || `Danh mục ${r.policy_name}`,
          bookCount: 0,
        }))
      }
    } catch {
      // fallback to storedCategories
    }

    // 2. Fetch distinct categories and book counts from book_title
    const bookCatMap = new Map<string, number>()
    try {
      const rows = await executeSql<{
        category: string
        book_count: number
      }>(
        "SELECT category, COUNT(*) as book_count FROM book_title WHERE category IS NOT NULL AND category != '' GROUP BY category;"
      )
      if (rows && rows.length > 0) {
        rows.forEach((r) => {
          bookCatMap.set(
            r.category.trim().toLowerCase(),
            Number(r.book_count) || 0
          )
        })
      }
    } catch {
      // ignore
    }

    // 3. Build merged list
    const result: CategoryItem[] = storedCategories.map((c) => ({
      ...c,
      bookCount: bookCatMap.get(c.name.trim().toLowerCase()) || 0,
    }))

    // Add any category from book_title not yet in registered list
    bookCatMap.forEach((count, catKey) => {
      if (!result.some((r) => r.name.trim().toLowerCase() === catKey)) {
        const originalName = catKey.charAt(0).toUpperCase() + catKey.slice(1)
        result.push({
          id: `cat-${encodeURIComponent(catKey)}`,
          name: originalName,
          description: `Danh mục phân loại cho ${originalName}`,
          bookCount: count,
        })
      }
    })

    saveLocalCategories(result)
    return result
  },

  createCategory: async (
    name: string,
    description: string
  ): Promise<CategoryItem> => {
    const existing = await libraryService.getCategories()
    const trimmed = name.trim()
    if (existing.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("Danh mục đã tồn tại.")
    }

    let nextId = 1001
    try {
      const idRows = await executeSql<{ next_id: number }>(
        "SELECT COALESCE(MAX(policy_id), 1000) + 1 AS next_id FROM system_policy WHERE policy_id >= 1000;"
      )
      if (idRows && idRows.length > 0 && idRows[0].next_id) {
        nextId = Number(idRows[0].next_id)
      }
    } catch {
      nextId = 1000 + existing.length + 1
    }

    const newCat: CategoryItem = {
      id: String(nextId),
      name: trimmed,
      description: description.trim(),
      bookCount: 0,
    }

    await executeSqlMutation(
      `INSERT INTO system_policy (policy_id, policy_code, policy_name, max_borrow_books, max_borrow_days, overdue_fine_per_day, student_discount_rate, lost_book_fine_rate, damaged_book_fine_rate, max_fine_amount, effective_from, policy_status, description, created_at, updated_at) ` +
        `VALUES (${nextId}, 'CAT_${nextId}', ${esc(trimmed)}, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'ACTIVE', ${esc(description.trim())}, NOW(), NOW()) ` +
        `ON DUPLICATE KEY UPDATE policy_name = ${esc(trimmed)}, description = ${esc(description.trim())}, updated_at = NOW();`
    )

    saveLocalCategories([...existing, newCat])
    return newCat
  },

  updateCategory: async (
    id: string,
    name: string,
    description: string
  ): Promise<CategoryItem> => {
    const cats = await libraryService.getCategories()
    const target = cats.find((c) => c.id === id)
    if (!target) throw new Error("Danh mục không tồn tại.")
    const oldName = target.name
    const newName = name.trim()

    if (oldName !== newName) {
      await executeSqlMutation(
        `UPDATE book_title SET category = ${esc(newName)} WHERE category = ${esc(oldName)};`
      )
    }

    const numId = Number(id)
    if (!isNaN(numId) && numId >= 1000) {
      await executeSqlMutation(
        `UPDATE system_policy SET policy_name = ${esc(newName)}, description = ${esc(description.trim())}, updated_at = NOW() WHERE policy_id = ${numId};`
      )
    } else {
      const idRows = await executeSql<{ next_id: number }>(
        "SELECT COALESCE(MAX(policy_id), 1000) + 1 AS next_id FROM system_policy WHERE policy_id >= 1000;"
      )
      const nextId = Number(idRows?.[0]?.next_id) || 1001
      await executeSqlMutation(
        `INSERT INTO system_policy (policy_id, policy_code, policy_name, max_borrow_books, max_borrow_days, overdue_fine_per_day, student_discount_rate, lost_book_fine_rate, damaged_book_fine_rate, max_fine_amount, effective_from, policy_status, description, created_at, updated_at) ` +
          `VALUES (${nextId}, 'CAT_${nextId}', ${esc(newName)}, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'ACTIVE', ${esc(description.trim())}, NOW(), NOW());`
      )
    }

    const updated = cats.map((c) =>
      c.id === id ? { ...c, name: newName, description: description.trim() } : c
    )
    saveLocalCategories(updated)

    return { id, name: newName, description: description.trim(), bookCount: target.bookCount }
  },

  deleteCategory: async (id: string): Promise<void> => {
    const cats = await libraryService.getCategories()
    const target = cats.find((c) => c.id === id)
    if (!target) return
    if (target.bookCount > 0) {
      throw new Error("Không thể xóa danh mục đang có sách. Hãy đổi danh mục cho sách trước.")
    }

    const numId = Number(id)
    if (!isNaN(numId) && numId >= 1000) {
      await executeSqlMutation(
        `DELETE FROM system_policy WHERE policy_id = ${numId};`
      )
    }

    const updated = cats.filter((c) => c.id !== id)
    saveLocalCategories(updated)
  },

  // === READERS (reader in MySQL) ===
  getReaders: async (): Promise<Reader[]> => {
    try {
      const rows = await executeSql<{
        reader_id: number
        account_id: number
        reader_code: string
        full_name: string
        email: string | null
        phone_number: string | null
        date_of_birth: string | null
        address: string | null
        reader_type: string
        card_created_at: string
        card_expired_at: string
        reader_status: string
        created_at: string
        updated_at: string
      }>("SELECT * FROM reader ORDER BY reader_id DESC;")

      if (rows && rows.length > 0) {
        readers = rows.map((r) => ({
          reader_id: Number(r.reader_id),
          account_id: Number(r.account_id),
          reader_code: r.reader_code,
          full_name: r.full_name,
          email: r.email || `${r.reader_code}@library.vn`,
          phone_number: r.phone_number,
          date_of_birth: r.date_of_birth ? String(r.date_of_birth).slice(0, 10) : null,
          address: r.address,
          reader_type: r.reader_type === "STUDENT" ? "STUDENT" : "NORMAL",
          card_created_at: r.card_created_at || r.created_at,
          card_expired_at: r.card_expired_at || "2027-01-01",
          reader_status: (r.reader_status as ReaderStatus) || "ACTIVE",
          created_at: r.created_at,
          updated_at: r.updated_at,
        }))
        return readers
      }
    } catch {
      // fallback
    }

    try {
      const users = await adminUsersService.getUsers({ UserType: "READER" })
      const nowStr = new Date().toISOString()
      readers = users.map((u) => ({
        reader_id: u.accountId,
        account_id: u.accountId,
        reader_code: u.code || `RD00${u.accountId}`,
        full_name: u.fullName || u.username,
        email: u.email || `${u.username}@library.vn`,
        phone_number: u.phoneNumber ?? null,
        date_of_birth: u.dateOfBirth ?? null,
        address: u.address ?? null,
        reader_type: u.readerType === "Student" ? "STUDENT" : "NORMAL",
        card_created_at: u.createdAt || nowStr,
        card_expired_at: "2027-01-01",
        reader_status: u.status === "Active" ? "ACTIVE" : "LOCKED",
        created_at: u.createdAt || nowStr,
        updated_at: u.createdAt || nowStr,
      }))
    } catch {
      // Keep existing
    }
    return [...readers]
  },

  getReaderById: async (id: number): Promise<Reader | null> => {
    if (readers.length === 0) {
      await libraryService.getReaders()
    }
    return readers.find((r) => r.reader_id === id) ?? null
  },

  createReader: async (
    data: Omit<Reader, "reader_id" | "account_id" | "created_at" | "updated_at">
  ): Promise<Reader> => {
    const createdUser = await adminUsersService.createReader({
      username: `reader_${Date.now().toString().slice(-5)}`,
      fullName: data.full_name,
      email: data.email,
      phoneNumber: data.phone_number || undefined,
      address: data.address || undefined,
    })
    await libraryService.getReaders()
    const r = readers.find((item) => item.account_id === createdUser.accountId)
    return (
      r || {
        ...data,
        reader_id: createdUser.accountId,
        account_id: createdUser.accountId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    )
  },

  updateReader: async (
    id: number,
    data: Partial<Omit<Reader, "reader_id" | "account_id" | "created_at" | "updated_at">>
  ): Promise<Reader> => {
    const sets: string[] = ["updated_at = NOW()"]
    if (data.full_name) sets.push(`full_name = ${esc(data.full_name)}`)
    if (data.email) sets.push(`email = ${esc(data.email)}`)
    if (data.phone_number !== undefined) sets.push(`phone_number = ${esc(data.phone_number)}`)
    if (data.address !== undefined) sets.push(`address = ${esc(data.address)}`)
    if (data.reader_status) sets.push(`reader_status = ${esc(data.reader_status)}`)

    await executeSqlMutation(
      `UPDATE reader SET ${sets.join(", ")} WHERE reader_id = ${id};`
    )
    await libraryService.getReaders()
    const reader = readers.find((r) => r.reader_id === id)
    if (!reader) throw new Error("Không tìm thấy độc giả.")
    return reader
  },

  toggleReaderStatus: async (id: number): Promise<Reader> => {
    const reader = readers.find((r) => r.reader_id === id)
    if (!reader) throw new Error("Không tìm thấy độc giả.")
    const nextStatus: ReaderStatus = reader.reader_status === "ACTIVE" ? "LOCKED" : "ACTIVE"
    return libraryService.updateReader(id, { reader_status: nextStatus })
  },

  // === EMPLOYEES (employee in MySQL) ===
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const rows = await executeSql<{
        employee_id: number
        account_id: number
        employee_code: string
        full_name: string
        email: string | null
        phone_number: string | null
        position: string
        employee_status: string
        hired_at: string | null
        created_at: string
        updated_at: string
      }>("SELECT * FROM employee ORDER BY employee_id DESC;")

      if (rows && rows.length > 0) {
        employees = rows.map((r) => ({
          employee_id: Number(r.employee_id),
          account_id: Number(r.account_id),
          employee_code: r.employee_code,
          full_name: r.full_name,
          email: r.email || `${r.employee_code}@library.vn`,
          phone_number: r.phone_number,
          position: r.position || "Thủ thư",
          employee_status: r.employee_status === "ACTIVE" ? "ACTIVE" : "RESIGNED",
          hired_at: r.hired_at ? String(r.hired_at).slice(0, 10) : "2026-01-01",
          created_at: r.created_at,
          updated_at: r.updated_at,
        }))
        return employees
      }
    } catch {
      // fallback
    }

    try {
      const users = await adminUsersService.getUsers({ UserType: "EMPLOYEE" })
      const nowStr = new Date().toISOString()
      employees = users.map((u) => ({
        employee_id: u.employeeId || u.accountId,
        account_id: u.accountId,
        employee_code: u.code || `EMP00${u.accountId}`,
        full_name: u.fullName || u.username,
        email: u.email || `${u.username}@library.vn`,
        phone_number: u.phoneNumber ?? null,
        position: u.position || "Thủ thư",
        employee_status: u.status === "Active" ? "ACTIVE" : "RESIGNED",
        hired_at: (u.createdAt || nowStr).slice(0, 10),
        created_at: u.createdAt || nowStr,
        updated_at: u.createdAt || nowStr,
      }))
    } catch {
      // Keep existing
    }
    return [...employees]
  },

  // === BORROW SLIPS (borrow_slip & borrow_slip_detail in MySQL) ===
  getBorrowSlips: async (): Promise<BorrowSlip[]> => {
    try {
      // 1. Fetch borrow_slip records from MySQL
      const slipRows = await executeSql<{
        borrow_slip_id: number
        employee_id: number
        policy_id: number
        reader_id: number
        borrow_slip_code: string
        borrow_date: string
        due_date: string
        returned_at: string | null
        slip_status: string
        note: string | null
        created_at: string
        updated_at: string
        reader_name?: string
        reader_code?: string
        employee_name?: string
        employee_code?: string
      }>(
        "SELECT s.*, r.full_name as reader_name, r.reader_code, e.full_name as employee_name, e.employee_code " +
          "FROM borrow_slip s " +
          "LEFT JOIN reader r ON s.reader_id = r.reader_id " +
          "LEFT JOIN employee e ON s.employee_id = e.employee_id " +
          "ORDER BY s.borrow_slip_id DESC;"
      )

      // 2. Fetch borrow_slip_detail records joined with copies and books
      const detailRows = await executeSql<{
        borrow_slip_detail_id: number
        book_copy_id: number
        borrow_slip_id: number
        borrow_date: string
        due_date: string
        return_date: string | null
        detail_status: string
        condition_before: string
        condition_after: string | null
        note: string | null
        created_at: string
        updated_at: string
        barcode?: string
        book_title_id?: number
        book_title?: string
        book_author?: string
        book_category?: string
      }>(
        "SELECT d.*, c.barcode, c.book_title_id, t.title as book_title, t.author as book_author, t.category as book_category " +
          "FROM borrow_slip_detail d " +
          "LEFT JOIN book_copy c ON d.book_copy_id = c.book_copy_id " +
          "LEFT JOIN book_title t ON c.book_title_id = t.book_title_id;"
      )

      if (slipRows && slipRows.length > 0) {
        borrowSlips = slipRows.map((s) => {
          const details: BorrowSlipDetailItem[] = (detailRows || [])
            .filter((d) => Number(d.borrow_slip_id) === Number(s.borrow_slip_id))
            .map((d) => ({
              borrow_slip_detail_id: Number(d.borrow_slip_detail_id),
              borrow_slip_id: Number(d.borrow_slip_id),
              book_copy_id: Number(d.book_copy_id),
              borrow_date: d.borrow_date,
              due_date: d.due_date,
              return_date: d.return_date,
              detail_status: d.detail_status as BorrowSlipDetailItem["detail_status"],
              condition_before: (d.condition_before as ConditionStatus) || "GOOD",
              condition_after: (d.condition_after as ConditionStatus) || null,
              note: d.note,
              created_at: d.created_at,
              updated_at: d.updated_at,
              book_copy: d.barcode
                ? {
                    book_copy_id: Number(d.book_copy_id),
                    book_title_id: Number(d.book_title_id) || 1,
                    barcode: d.barcode,
                    acquisition_date: "2026-01-01",
                    price: 85000,
                    location: "Khu Tổng Hợp",
                    shelf_code: "Kệ A-01",
                    copy_status: d.detail_status === "RETURNED" ? "AVAILABLE" : "BORROWED",
                    condition_status: (d.condition_before as ConditionStatus) || "GOOD",
                    note: "",
                    created_at: d.created_at,
                    updated_at: d.updated_at,
                  }
                : undefined,
              book_title: d.book_title
                ? {
                    book_title_id: Number(d.book_title_id) || 1,
                    isbn: "",
                    title: d.book_title,
                    subtitle: null,
                    author: d.book_author || "Nhiều tác giả",
                    publisher: null,
                    publication_year: null,
                    language_code: "VIE",
                    category: d.book_category || "Văn học",
                    description: null,
                    page_count: null,
                    cover_image_url: null,
                    book_status: "ACTIVE",
                    copies_count: 1,
                    available_copies_count: 1,
                    created_at: d.created_at,
                    updated_at: d.updated_at,
                  }
                : undefined,
            }))

          return {
            borrow_slip_id: Number(s.borrow_slip_id),
            employee_id: Number(s.employee_id),
            policy_id: Number(s.policy_id),
            reader_id: Number(s.reader_id),
            borrow_slip_code: s.borrow_slip_code,
            borrow_date: s.borrow_date,
            due_date: s.due_date,
            returned_at: s.returned_at,
            slip_status: s.slip_status as BorrowSlip["slip_status"],
            note: s.note,
            created_at: s.created_at,
            updated_at: s.updated_at,
            reader: {
              reader_id: Number(s.reader_id),
              account_id: Number(s.reader_id),
              reader_code: s.reader_code || `RD00${s.reader_id}`,
              full_name: s.reader_name || `Độc giả #${s.reader_id}`,
              email: `${s.reader_code || s.reader_id}@library.vn`,
              phone_number: null,
              date_of_birth: null,
              address: null,
              reader_type: "NORMAL",
              card_created_at: s.created_at,
              card_expired_at: "2027-01-01",
              reader_status: "ACTIVE",
              created_at: s.created_at,
              updated_at: s.updated_at,
            },
            employee: {
              employee_id: Number(s.employee_id),
              account_id: Number(s.employee_id),
              employee_code: s.employee_code || `EMP00${s.employee_id}`,
              full_name: s.employee_name || `Thủ thư #${s.employee_id}`,
              email: `${s.employee_code || s.employee_id}@library.vn`,
              phone_number: null,
              position: "Thủ thư",
              employee_status: "ACTIVE",
              hired_at: "2026-01-01",
              created_at: s.created_at,
              updated_at: s.updated_at,
            },
            details,
          }
        })
        return borrowSlips
      }
    } catch {
      // fallback
    }
    return [...borrowSlips]
  },

  createBorrowSlip: async ({
    readerId,
    employeeId,
    bookCopyIds,
    dueDays = 14,
    note,
  }: {
    readerId: number
    employeeId: number
    bookCopyIds: number[]
    dueDays?: number
    note?: string
  }): Promise<BorrowSlip> => {
    const slipCode = `BS-${Date.now().toString().slice(-6)}`
    const now = new Date()
    const dueDate = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000)

    // Insert into MySQL table borrow_slip
    await executeSqlMutation(
      `INSERT INTO borrow_slip (employee_id, policy_id, reader_id, borrow_slip_code, borrow_date, due_date, slip_status, note, created_at, updated_at) ` +
        `VALUES (${employeeId}, 1, ${readerId}, ${esc(slipCode)}, ${sqlDateTime(now)}, ${sqlDateTime(dueDate)}, 'BORROWING', ${esc(note || "")}, NOW(), NOW());`
    )

    // Get the created borrow_slip_id
    const idRows = await executeSql<{ max_id: number }>(
      "SELECT MAX(borrow_slip_id) as max_id FROM borrow_slip;"
    )
    const newSlipId = Number(idRows?.[0]?.max_id) || Date.now()

    // Insert borrow_slip_detail and update book_copy
    for (const copyId of bookCopyIds) {
      await executeSqlMutation(
        `INSERT INTO borrow_slip_detail (book_copy_id, borrow_slip_id, borrow_date, due_date, detail_status, condition_before, created_at, updated_at) ` +
          `VALUES (${copyId}, ${newSlipId}, ${sqlDateTime(now)}, ${sqlDateTime(dueDate)}, 'BORROWING', 'GOOD', NOW(), NOW());`
      )
      await executeSqlMutation(
        `UPDATE book_copy SET copy_status = 'BORROWED', updated_at = NOW() WHERE book_copy_id = ${copyId};`
      )
    }

    await libraryService.getBorrowSlips()
    const newSlip = borrowSlips.find((s) => s.borrow_slip_id === newSlipId)
    return (
      newSlip || {
        borrow_slip_id: newSlipId,
        employee_id: employeeId,
        policy_id: 1,
        reader_id: readerId,
        borrow_slip_code: slipCode,
        borrow_date: now.toISOString(),
        due_date: dueDate.toISOString(),
        returned_at: null,
        slip_status: "BORROWING",
        note: note || null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      }
    )
  },

  returnBorrowSlip: async ({
    slipId,
    conditionAfter = "GOOD",
    note,
  }: {
    slipId: number
    conditionAfter?: ConditionStatus
    note?: string
  }): Promise<{ slip: BorrowSlip; fine?: Fine }> => {
    const now = new Date()

    // Update in MySQL
    await executeSqlMutation(
      `UPDATE borrow_slip SET slip_status = 'RETURNED', returned_at = ${sqlDateTime(now)}, updated_at = NOW() WHERE borrow_slip_id = ${slipId};`
    )
    await executeSqlMutation(
      `UPDATE borrow_slip_detail SET detail_status = 'RETURNED', return_date = ${sqlDateTime(now)}, condition_after = ${esc(conditionAfter)}, note = ${esc(note || "")}, updated_at = NOW() WHERE borrow_slip_id = ${slipId};`
    )
    await executeSqlMutation(
      `UPDATE book_copy SET copy_status = 'AVAILABLE', condition_status = ${esc(conditionAfter)}, updated_at = NOW() ` +
        `WHERE book_copy_id IN (SELECT book_copy_id FROM borrow_slip_detail WHERE borrow_slip_id = ${slipId});`
    )

    await libraryService.getBorrowSlips()
    const updatedSlip = borrowSlips.find((s) => s.borrow_slip_id === slipId)
    if (!updatedSlip) throw new Error("Không tìm thấy phiếu mượn sau khi trả.")

    return { slip: updatedSlip }
  },

  // === FINES (fine in MySQL) ===
  getFines: async (): Promise<Fine[]> => {
    try {
      const rows = await executeSql<{
        fine_id: number
        borrow_slip_detail_id: number
        fine_type: string
        overdue_days: number
        base_amount: number
        discount_rate: number
        discount_amount: number
        final_amount: number
        paid_amount: number
        outstanding_amount: number
        fine_status: string
        issued_at: string
        paid_at: string | null
        note: string | null
        created_at: string
        updated_at: string
      }>("SELECT * FROM fine ORDER BY fine_id DESC;")

      if (rows && rows.length > 0) {
        fines = rows.map((r) => ({
          fine_id: Number(r.fine_id),
          borrow_slip_detail_id: Number(r.borrow_slip_detail_id),
          fine_type: "OVERDUE",
          overdue_days: Number(r.overdue_days) || 0,
          basic_amount: Number(r.base_amount) || 0,
          discount_rate: Number(r.discount_rate) || 0,
          discount_amount: Number(r.discount_amount) || 0,
          final_amount: Number(r.final_amount) || 0,
          paid_amount: Number(r.paid_amount) || 0,
          outstanding_amount: Number(r.outstanding_amount) || 0,
        }))
        return fines
      }
    } catch {
      // fallback
    }
    return [...fines]
  },

  payFine: async (fineId: number, amount?: number): Promise<Fine> => {
    const pay = amount || 50000
    await executeSqlMutation(
      `UPDATE fine SET paid_amount = paid_amount + ${pay}, outstanding_amount = GREATEST(0, outstanding_amount - ${pay}), ` +
        `fine_status = CASE WHEN outstanding_amount - ${pay} <= 0 THEN 'PAID' ELSE 'PARTIAL' END, ` +
        `paid_at = NOW(), updated_at = NOW() WHERE fine_id = ${fineId};`
    )
    await libraryService.getFines()
    const fine = fines.find((f) => f.fine_id === fineId)
    if (!fine) throw new Error("Khoản phạt không tồn tại.")
    return fine
  },

  // === SYSTEM POLICY (system_policy in MySQL) ===
  getSystemPolicy: async (): Promise<SystemPolicy> => {
    try {
      const rows = await executeSql<{
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
        policy_status: string
        description: string | null
        created_at: string
        updated_at: string
      }>("SELECT * FROM system_policy WHERE policy_id = 1 LIMIT 1;")

      if (rows && rows.length > 0) {
        const r = rows[0]
        systemPolicy = {
          policy_id: Number(r.policy_id),
          policy_code: r.policy_code,
          policy_name: r.policy_name,
          max_borrow_books: Number(r.max_borrow_books) || 5,
          max_borrow_days: Number(r.max_borrow_days) || 14,
          overdue_fine_per_day: Number(r.overdue_fine_per_day) || 5000,
          student_discount_rate: Number(r.student_discount_rate) || 20,
          lost_book_fine_rate: Number(r.lost_book_fine_rate) || 100,
          damaged_book_fine_rate: Number(r.damaged_book_fine_rate) || 50,
          max_fine_amount: r.max_fine_amount ? Number(r.max_fine_amount) : 500000,
          effective_from: String(r.effective_from).slice(0, 10),
          effective_to: r.effective_to ? String(r.effective_to).slice(0, 10) : null,
          policy_status: (r.policy_status as SystemPolicy["policy_status"]) || "ACTIVE",
          description: r.description || "Quy định tiêu chuẩn áp dụng cho độc giả.",
          created_at: r.created_at,
          updated_at: r.updated_at,
        }
        return systemPolicy
      }
    } catch {
      // fallback
    }
    return { ...systemPolicy }
  },

  updateSystemPolicy: async (
    data: Partial<SystemPolicy>
  ): Promise<SystemPolicy> => {
    const sets: string[] = ["updated_at = NOW()"]
    if (data.max_borrow_books !== undefined)
      sets.push(`max_borrow_books = ${data.max_borrow_books}`)
    if (data.max_borrow_days !== undefined)
      sets.push(`max_borrow_days = ${data.max_borrow_days}`)
    if (data.overdue_fine_per_day !== undefined)
      sets.push(`overdue_fine_per_day = ${data.overdue_fine_per_day}`)
    if (data.policy_name) sets.push(`policy_name = ${esc(data.policy_name)}`)
    if (data.description !== undefined) sets.push(`description = ${esc(data.description)}`)

    await executeSqlMutation(
      `UPDATE system_policy SET ${sets.join(", ")} WHERE policy_id = 1;`
    )
    return libraryService.getSystemPolicy()
  },
}

export default libraryService
