import {
  initialBookCopies,
  initialBookTitles,
  initialBorrowSlipDetails,
  initialBorrowSlips,
  initialCategories,
  initialEmployees,
  initialFines,
  initialReaders,
  initialSystemPolicy,
} from "@/services/library-mock-data"
import type {
  BookCopy,
  BookTitle,
  BorrowSlip,
  CategoryItem,
  ConditionStatus,
  DashboardStats,
  Fine,
  Reader,
  ReaderStatus,
  SystemPolicy,
} from "@/types/library"

// In-memory data store for the mock session
let bookTitles = [...initialBookTitles]
let bookCopies = [...initialBookCopies]
const readers = [...initialReaders]
const employees = [...initialEmployees]
const borrowSlips = [...initialBorrowSlips]
const borrowSlipDetails = [...initialBorrowSlipDetails]
const fines = [...initialFines]
let categories = [...initialCategories]
let systemPolicy = { ...initialSystemPolicy }

export const libraryService = {
  // === DASHBOARD STATS ===
  getDashboardStats: async (): Promise<DashboardStats> => {
    const totalTitles = bookTitles.length
    const totalCopies = bookCopies.length
    const availableCopies = bookCopies.filter(
      (c) => c.copy_status === "AVAILABLE"
    ).length
    const totalReaders = readers.filter(
      (r) => r.reader_status === "ACTIVE"
    ).length
    const activeLoans = borrowSlips.filter(
      (s) => s.slip_status === "BORROWING"
    ).length
    const overdueLoans = borrowSlips.filter(
      (s) => s.slip_status === "OVERDUE"
    ).length
    const totalOutstandingFines = fines.reduce(
      (sum, f) => sum + f.outstanding_amount,
      0
    )

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      totalReaders,
      activeLoans,
      overdueLoans,
      totalOutstandingFines,
    }
  },

  // === BOOKS (book_title) ===
  getBooks: async (): Promise<BookTitle[]> => {
    return bookTitles.map((title) => {
      const copies = bookCopies.filter(
        (c) => c.book_title_id === title.book_title_id
      )
      const available = copies.filter(
        (c) => c.copy_status === "AVAILABLE"
      ).length
      return {
        ...title,
        copies_count: copies.length,
        available_copies_count: available,
      }
    })
  },

  getBookById: async (id: number): Promise<BookTitle | null> => {
    const book = bookTitles.find((b) => b.book_title_id === id)
    if (!book) return null
    const copies = bookCopies.filter((c) => c.book_title_id === id)
    return {
      ...book,
      copies_count: copies.length,
      available_copies_count: copies.filter(
        (c) => c.copy_status === "AVAILABLE"
      ).length,
    }
  },

  createBook: async (
    data: Omit<BookTitle, "book_title_id" | "created_at" | "updated_at">,
    initialCopies = 2
  ): Promise<BookTitle> => {
    const newId = Math.max(...bookTitles.map((b) => b.book_title_id), 0) + 1
    const now = new Date().toISOString()
    const newBook: BookTitle = {
      ...data,
      book_title_id: newId,
      created_at: now,
      updated_at: now,
    }
    bookTitles.unshift(newBook)

    // Generate initial copies
    for (let i = 1; i <= initialCopies; i++) {
      const copyId = Math.max(...bookCopies.map((c) => c.book_copy_id), 0) + 1
      bookCopies.push({
        book_copy_id: copyId,
        book_title_id: newId,
        barcode: `BC-${String(newId).padStart(3, "0")}-${String(i).padStart(2, "0")}`,
        acquisition_date: new Date().toISOString().split("T")[0],
        price: 150000,
        location: "Khu Tổng Hợp",
        shelf_code: "KE-TH-01",
        copy_status: "AVAILABLE",
        condition_status: "NEW",
        note: "Bản sao nhập kho",
        created_at: now,
        updated_at: now,
      })
    }

    // Update category bookCount
    const cat = categories.find((c) => c.name === newBook.category)
    if (cat) cat.bookCount += 1

    return {
      ...newBook,
      copies_count: initialCopies,
      available_copies_count: initialCopies,
    }
  },

  updateBook: async (
    id: number,
    data: Partial<
      Omit<BookTitle, "book_title_id" | "created_at" | "updated_at">
    >
  ): Promise<BookTitle> => {
    const index = bookTitles.findIndex((b) => b.book_title_id === id)
    if (index === -1) throw new Error("Không tìm thấy đầu sách")
    const updated: BookTitle = {
      ...bookTitles[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    bookTitles[index] = updated
    return updated
  },

  deleteBook: async (id: number): Promise<void> => {
    // Check if copies are borrowed
    const hasBorrowed = bookCopies.some(
      (c) => c.book_title_id === id && c.copy_status === "BORROWED"
    )
    if (hasBorrowed) {
      throw new Error("Không thể xóa sách đang có người mượn.")
    }
    const book = bookTitles.find((b) => b.book_title_id === id)
    if (book) {
      const cat = categories.find((c) => c.name === book.category)
      if (cat && cat.bookCount > 0) cat.bookCount -= 1
    }
    bookTitles = bookTitles.filter((b) => b.book_title_id !== id)
    bookCopies = bookCopies.filter((c) => c.book_title_id !== id)
  },

  // === BOOK COPIES (book_copy) ===
  getCopiesByBookId: async (bookTitleId: number): Promise<BookCopy[]> => {
    return bookCopies.filter((c) => c.book_title_id === bookTitleId)
  },

  getAllCopies: async (): Promise<BookCopy[]> => {
    return [...bookCopies]
  },

  createCopy: async (
    data: Omit<BookCopy, "book_copy_id" | "created_at" | "updated_at">
  ): Promise<BookCopy> => {
    const newId = Math.max(...bookCopies.map((c) => c.book_copy_id), 0) + 1
    const now = new Date().toISOString()
    const newCopy: BookCopy = {
      ...data,
      book_copy_id: newId,
      created_at: now,
      updated_at: now,
    }
    bookCopies.push(newCopy)
    return newCopy
  },

  // === CATEGORIES ===
  getCategories: async (): Promise<CategoryItem[]> => {
    // Recalculate bookCount
    return categories.map((cat) => ({
      ...cat,
      bookCount: bookTitles.filter((b) => b.category === cat.name).length,
    }))
  },

  createCategory: async (
    name: string,
    description: string
  ): Promise<CategoryItem> => {
    const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    )
    if (exists) throw new Error("Danh mục đã tồn tại.")
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      bookCount: 0,
    }
    categories.push(newCat)
    return newCat
  },

  updateCategory: async (
    id: string,
    name: string,
    description: string
  ): Promise<CategoryItem> => {
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) throw new Error("Danh mục không tồn tại.")
    const oldName = categories[index].name
    const newName = name.trim()

    // Update books category label
    if (oldName !== newName) {
      bookTitles = bookTitles.map((b) =>
        b.category === oldName ? { ...b, category: newName } : b
      )
    }

    categories[index] = {
      ...categories[index],
      name: newName,
      description: description.trim(),
    }
    return categories[index]
  },

  deleteCategory: async (id: string): Promise<void> => {
    const cat = categories.find((c) => c.id === id)
    if (!cat) return
    const hasBooks = bookTitles.some((b) => b.category === cat.name)
    if (hasBooks) {
      throw new Error(
        "Không thể xóa danh mục đang có sách. Hãy đổi danh mục cho sách trước."
      )
    }
    categories = categories.filter((c) => c.id !== id)
  },

  // === READERS (reader) ===
  getReaders: async (): Promise<Reader[]> => {
    return [...readers]
  },

  getReaderById: async (id: number): Promise<Reader | null> => {
    return readers.find((r) => r.reader_id === id) ?? null
  },

  createReader: async (
    data: Omit<Reader, "reader_id" | "account_id" | "created_at" | "updated_at">
  ): Promise<Reader> => {
    const newId = Math.max(...readers.map((r) => r.reader_id), 0) + 1
    const now = new Date().toISOString()
    const newReader: Reader = {
      ...data,
      reader_id: newId,
      account_id: newId + 10,
      created_at: now,
      updated_at: now,
    }
    readers.unshift(newReader)
    return newReader
  },

  updateReader: async (
    id: number,
    data: Partial<
      Omit<Reader, "reader_id" | "account_id" | "created_at" | "updated_at">
    >
  ): Promise<Reader> => {
    const index = readers.findIndex((r) => r.reader_id === id)
    if (index === -1) throw new Error("Không tìm thấy độc giả.")
    readers[index] = {
      ...readers[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return readers[index]
  },

  toggleReaderStatus: async (id: number): Promise<Reader> => {
    const reader = readers.find((r) => r.reader_id === id)
    if (!reader) throw new Error("Không tìm thấy độc giả.")
    const nextStatus: ReaderStatus =
      reader.reader_status === "ACTIVE" ? "LOCKED" : "ACTIVE"
    return libraryService.updateReader(id, { reader_status: nextStatus })
  },

  // === BORROW SLIPS (borrow_slip & borrow_slip_detail) ===
  getBorrowSlips: async (): Promise<BorrowSlip[]> => {
    return borrowSlips.map((slip) => {
      const reader = readers.find((r) => r.reader_id === slip.reader_id)
      const employee = employees.find((e) => e.employee_id === slip.employee_id)
      const details = borrowSlipDetails
        .filter((d) => d.borrow_slip_id === slip.borrow_slip_id)
        .map((d) => {
          const copy = bookCopies.find((c) => c.book_copy_id === d.book_copy_id)
          const title = copy
            ? bookTitles.find((t) => t.book_title_id === copy.book_title_id)
            : undefined
          const fine = fines.find(
            (f) => f.borrow_slip_detail_id === d.borrow_slip_detail_id
          )
          return {
            ...d,
            book_copy: copy,
            book_title: title,
            fine,
          }
        })

      return {
        ...slip,
        reader,
        employee,
        details,
      }
    })
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
    const reader = readers.find((r) => r.reader_id === readerId)
    if (!reader) throw new Error("Độc giả không tồn tại.")
    if (reader.reader_status !== "ACTIVE") {
      throw new Error("Thẻ độc giả đang bị khóa hoặc hết hạn.")
    }

    // Check active loans limit
    const currentActiveSlips = borrowSlips.filter(
      (s) => s.reader_id === readerId && s.slip_status === "BORROWING"
    )
    const currentActiveBookCount = currentActiveSlips.reduce((count, s) => {
      return (
        count +
        borrowSlipDetails.filter(
          (d) =>
            d.borrow_slip_id === s.borrow_slip_id &&
            d.detail_status === "BORROWING"
        ).length
      )
    }, 0)

    if (
      currentActiveBookCount + bookCopyIds.length >
      systemPolicy.max_borrow_books
    ) {
      throw new Error(
        `Độc giả đã mượn ${currentActiveBookCount} cuốn. Hạn mức tối đa theo quy định là ${systemPolicy.max_borrow_books} cuốn.`
      )
    }

    // Check copies availability
    for (const copyId of bookCopyIds) {
      const copy = bookCopies.find((c) => c.book_copy_id === copyId)
      if (!copy || copy.copy_status !== "AVAILABLE") {
        throw new Error(
          `Cuốn sách mã ${copy?.barcode ?? copyId} hiện không sẵn sàng để mượn.`
        )
      }
    }

    const newSlipId =
      Math.max(...borrowSlips.map((s) => s.borrow_slip_id), 0) + 1
    const slipCode = `SLIP-2026-${String(newSlipId).padStart(3, "0")}`
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(
      dueDate.getDate() + (dueDays || systemPolicy.max_borrow_days)
    )

    const newSlip: BorrowSlip = {
      borrow_slip_id: newSlipId,
      reader_id: readerId,
      employee_id: employeeId,
      policy_id: systemPolicy.policy_id,
      borrow_slip_code: slipCode,
      borrow_date: now.toISOString(),
      due_date: dueDate.toISOString(),
      returned_at: null,
      slip_status: "BORROWING",
      note: note ?? null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }
    borrowSlips.unshift(newSlip)

    // Create slip details and mark copies as BORROWED
    for (const copyId of bookCopyIds) {
      const detailId =
        Math.max(...borrowSlipDetails.map((d) => d.borrow_slip_detail_id), 0) +
        1
      borrowSlipDetails.push({
        borrow_slip_detail_id: detailId,
        borrow_slip_id: newSlipId,
        book_copy_id: copyId,
        borrow_date: now.toISOString(),
        due_date: dueDate.toISOString(),
        return_date: null,
        detail_status: "BORROWING",
        condition_before: "GOOD",
        condition_after: null,
        note: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })

      // Update copy status
      const copyIndex = bookCopies.findIndex((c) => c.book_copy_id === copyId)
      if (copyIndex !== -1) {
        bookCopies[copyIndex] = {
          ...bookCopies[copyIndex],
          copy_status: "BORROWED",
          updated_at: now.toISOString(),
        }
      }
    }

    return newSlip
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
    const slipIndex = borrowSlips.findIndex((s) => s.borrow_slip_id === slipId)
    if (slipIndex === -1) throw new Error("Không tìm thấy phiếu mượn.")

    const slip = borrowSlips[slipIndex]
    const now = new Date()
    const dueDate = new Date(slip.due_date)
    const isOverdue = now > dueDate

    let createdFine: Fine | undefined

    // Calculate overdue days if any
    const overdueDays = isOverdue
      ? Math.max(
          1,
          Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24))
        )
      : 0

    // Mark slip as RETURNED
    const updatedSlip: BorrowSlip = {
      ...slip,
      returned_at: now.toISOString(),
      slip_status: "RETURNED",
      note: note ? `${slip.note ? slip.note + " | " : ""}${note}` : slip.note,
      updated_at: now.toISOString(),
    }
    borrowSlips[slipIndex] = updatedSlip

    // Return all details
    const details = borrowSlipDetails.filter((d) => d.borrow_slip_id === slipId)
    for (const detail of details) {
      const detailIndex = borrowSlipDetails.findIndex(
        (d) => d.borrow_slip_detail_id === detail.borrow_slip_detail_id
      )
      if (detailIndex !== -1) {
        borrowSlipDetails[detailIndex] = {
          ...borrowSlipDetails[detailIndex],
          return_date: now.toISOString(),
          detail_status: "RETURNED",
          condition_after: conditionAfter,
          updated_at: now.toISOString(),
        }
      }

      // Mark copy as AVAILABLE
      const copyIndex = bookCopies.findIndex(
        (c) => c.book_copy_id === detail.book_copy_id
      )
      if (copyIndex !== -1) {
        bookCopies[copyIndex] = {
          ...bookCopies[copyIndex],
          copy_status: "AVAILABLE",
          condition_status: conditionAfter,
          updated_at: now.toISOString(),
        }
      }

      // If overdue, create fine record
      if (overdueDays > 0 && !createdFine) {
        const fineId = Math.max(...fines.map((f) => f.fine_id), 0) + 1
        const basicAmount = overdueDays * systemPolicy.overdue_fine_per_day
        const reader = readers.find((r) => r.reader_id === slip.reader_id)
        const discountRate =
          reader?.reader_type === "STUDENT"
            ? systemPolicy.student_discount_rate
            : 0
        const discountAmount = (basicAmount * discountRate) / 100
        const finalAmount = Math.max(0, basicAmount - discountAmount)

        createdFine = {
          fine_id: fineId,
          borrow_slip_detail_id: detail.borrow_slip_detail_id,
          fine_type: "OVERDUE",
          overdue_days: overdueDays,
          basic_amount: basicAmount,
          discount_rate: discountRate,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          paid_amount: 0,
          outstanding_amount: finalAmount,
        }
        fines.push(createdFine)
      }
    }

    return { slip: updatedSlip, fine: createdFine }
  },

  // === FINES (fine) ===
  getFines: async (): Promise<Fine[]> => {
    return [...fines]
  },

  payFine: async (fineId: number, amount?: number): Promise<Fine> => {
    const fineIndex = fines.findIndex((f) => f.fine_id === fineId)
    if (fineIndex === -1) throw new Error("Khoản phạt không tồn tại.")
    const fine = fines[fineIndex]
    const pay = amount ?? fine.outstanding_amount
    const newPaid = Math.min(fine.final_amount, fine.paid_amount + pay)
    const newOutstanding = Math.max(0, fine.final_amount - newPaid)

    fines[fineIndex] = {
      ...fine,
      paid_amount: newPaid,
      outstanding_amount: newOutstanding,
    }
    return fines[fineIndex]
  },

  // === SYSTEM POLICY (system_policy) ===
  getSystemPolicy: async (): Promise<SystemPolicy> => {
    return { ...systemPolicy }
  },

  updateSystemPolicy: async (
    data: Partial<SystemPolicy>
  ): Promise<SystemPolicy> => {
    systemPolicy = {
      ...systemPolicy,
      ...data,
      updated_at: new Date().toISOString(),
    }
    return { ...systemPolicy }
  },
}
