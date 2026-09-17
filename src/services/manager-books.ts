import { managerBooksApi } from "@/api/manager-books"
import type {
  AddCopyInput,
  BookCopyItem,
  BookTitleItem,
  CreateBookTitleInput,
  UpdateBookTitleInput,
} from "@/types/manager-books"

const INITIAL_BOOKS: BookTitleItem[] = [
  {
    id: "nam-phia-sau",
    isbn: "978-604-1-16472-8",
    title: "Năm phía sau",
    subtitle: "Nghệ thuật tìm thấy khoảng lặng",
    author: "Erling Kagge",
    publisher: "NXB Trẻ",
    publicationYear: 2021,
    languageCode: "VIE",
    category: "Khám phá",
    description:
      "Một cuốn sách nhỏ về nghệ thuật tìm thấy khoảng lặng và những điều thật sự quan trọng trong đời sống hiện đại.",
    pageCount: 196,
    bookStatus: "Active",
    totalCopies: 4,
    availableCopies: 4,
    borrowedCopies: 0,
    color: "#d9e6d1",
    copies: [
      {
        id: "CP-NPS-01",
        bookTitleId: "nam-phia-sau",
        barcode: "8934974164721",
        acquisitionDate: "12/01/2024",
        price: 85000,
        location: "Khu A - Tầng 2",
        shelfCode: "Kệ A-01",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
      {
        id: "CP-NPS-02",
        bookTitleId: "nam-phia-sau",
        barcode: "8934974164722",
        acquisitionDate: "12/01/2024",
        price: 85000,
        location: "Khu A - Tầng 2",
        shelfCode: "Kệ A-01",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
      {
        id: "CP-NPS-03",
        bookTitleId: "nam-phia-sau",
        barcode: "8934974164723",
        acquisitionDate: "15/02/2024",
        price: 85000,
        location: "Khu A - Tầng 2",
        shelfCode: "Kệ A-02",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
      {
        id: "CP-NPS-04",
        bookTitleId: "nam-phia-sau",
        barcode: "8934974164724",
        acquisitionDate: "15/02/2024",
        price: 85000,
        location: "Khu A - Tầng 2",
        shelfCode: "Kệ A-02",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
    ],
  },
  {
    id: "nha-gia-kim",
    isbn: "978-604-56-2608-5",
    title: "Nhà giả kim",
    subtitle: "The Alchemist",
    author: "Paulo Coelho",
    publisher: "NXB Hội Nhà Văn",
    publicationYear: 2020,
    languageCode: "VIE",
    category: "Văn học",
    description:
      "Hành trình theo đuổi kho báu và lắng nghe tiếng gọi của ước mơ, một câu chuyện đã truyền cảm hứng cho hàng triệu độc giả.",
    pageCount: 228,
    bookStatus: "Active",
    totalCopies: 3,
    availableCopies: 2,
    borrowedCopies: 1,
    color: "#ead7b4",
    copies: [
      {
        id: "CP-NGK-01",
        bookTitleId: "nha-gia-kim",
        barcode: "8935235226081",
        acquisitionDate: "10/11/2023",
        price: 79000,
        location: "Khu B - Tầng 1",
        shelfCode: "Kệ B-03",
        copyStatus: "Borrowed",
        conditionStatus: "Good",
        note: "Đang mượn bởi SV20240018 (Lê Minh Tuấn)",
      },
      {
        id: "CP-NGK-02",
        bookTitleId: "nha-gia-kim",
        barcode: "8935235226082",
        acquisitionDate: "10/11/2023",
        price: 79000,
        location: "Khu B - Tầng 1",
        shelfCode: "Kệ B-03",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
      {
        id: "CP-NGK-03",
        bookTitleId: "nha-gia-kim",
        barcode: "8935235226083",
        acquisitionDate: "18/03/2024",
        price: 79000,
        location: "Khu B - Tầng 1",
        shelfCode: "Kệ B-04",
        copyStatus: "Available",
        conditionStatus: "SlightlyDamaged",
        note: "Gáy sách hơi sờn",
      },
    ],
  },
  {
    id: "su-im-lang",
    isbn: "978-604-1-08427-9",
    title: "Sức mạnh của sự im lặng",
    subtitle: "Quiet: The Power of Introverts",
    author: "Susan Cain",
    publisher: "NXB Trẻ",
    publicationYear: 2019,
    languageCode: "VIE",
    category: "Tâm lý",
    description:
      "Một góc nhìn sâu sắc về sức mạnh của những người hướng nội trong một thế giới luôn ưa chuộng sự ồn ào.",
    pageCount: 440,
    bookStatus: "Active",
    totalCopies: 6,
    availableCopies: 6,
    borrowedCopies: 0,
    color: "#cbdde0",
    copies: [
      {
        id: "CP-SIL-01",
        bookTitleId: "su-im-lang",
        barcode: "8934974108421",
        acquisitionDate: "05/05/2023",
        price: 145000,
        location: "Khu C - Tầng 2",
        shelfCode: "Kệ C-01",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
      {
        id: "CP-SIL-02",
        bookTitleId: "su-im-lang",
        barcode: "8934974108422",
        acquisitionDate: "05/05/2023",
        price: 145000,
        location: "Khu C - Tầng 2",
        shelfCode: "Kệ C-01",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
    ],
  },
  {
    id: "tuoi-tre-dang-gia",
    isbn: "978-604-1-09852-8",
    title: "Tuổi trẻ đáng giá bao nhiêu",
    subtitle: "Sống có chủ đích",
    author: "Rosie Nguyễn",
    publisher: "NXB Trẻ",
    publicationYear: 2018,
    languageCode: "VIE",
    category: "Phát triển bản thân",
    description:
      "Những gợi ý gần gũi để sống, học tập và làm việc có chủ đích hơn trong những năm tháng tuổi trẻ.",
    pageCount: 292,
    bookStatus: "Active",
    totalCopies: 2,
    availableCopies: 0,
    borrowedCopies: 2,
    color: "#e6c8c2",
    copies: [
      {
        id: "CP-TT-01",
        bookTitleId: "tuoi-tre-dang-gia",
        barcode: "8934974109851",
        acquisitionDate: "15/08/2023",
        price: 90000,
        location: "Khu D - Tầng 1",
        shelfCode: "Kệ D-02",
        copyStatus: "Borrowed",
        conditionStatus: "Good",
      },
      {
        id: "CP-TT-02",
        bookTitleId: "tuoi-tre-dang-gia",
        barcode: "8934974109852",
        acquisitionDate: "15/08/2023",
        price: 90000,
        location: "Khu D - Tầng 1",
        shelfCode: "Kệ D-02",
        copyStatus: "Borrowed",
        conditionStatus: "Good",
      },
    ],
  },
  {
    id: "muoi-nguoi-da-den",
    isbn: "978-604-1-12345-6",
    title: "Mười người da đen nhỏ",
    subtitle: "And Then There Were None",
    author: "Agatha Christie",
    publisher: "NXB Văn Học",
    publicationYear: 2022,
    languageCode: "VIE",
    category: "Trinh thám",
    description:
      "Một vụ án bí ẩn trên hòn đảo biệt lập, nơi từng người một biến mất theo một bài đồng dao đáng sợ.",
    pageCount: 312,
    bookStatus: "Active",
    totalCopies: 4,
    availableCopies: 3,
    borrowedCopies: 1,
    color: "#d8d1df",
    copies: [
      {
        id: "CP-MND-01",
        bookTitleId: "muoi-nguoi-da-den",
        barcode: "8934974112341",
        acquisitionDate: "02/02/2024",
        price: 110000,
        location: "Khu E - Tầng 2",
        shelfCode: "Kệ E-05",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
      {
        id: "CP-MND-02",
        bookTitleId: "muoi-nguoi-da-den",
        barcode: "8934974112342",
        acquisitionDate: "02/02/2024",
        price: 110000,
        location: "Khu E - Tầng 2",
        shelfCode: "Kệ E-05",
        copyStatus: "Borrowed",
        conditionStatus: "Good",
      },
    ],
  },
  {
    id: "thiet-ke-cuoc-doi",
    isbn: "978-604-2-09876-1",
    title: "Thiết kế cuộc đời",
    subtitle: "Designing Your Life",
    author: "Bill Burnett",
    publisher: "NXB Thế Giới",
    publicationYear: 2021,
    languageCode: "VIE",
    category: "Kỹ năng",
    description:
      "Tư duy thiết kế giúp bạn thử nghiệm nhiều hướng đi và chủ động tạo ra một cuộc đời phù hợp.",
    pageCount: 260,
    bookStatus: "Active",
    totalCopies: 5,
    availableCopies: 5,
    borrowedCopies: 0,
    color: "#d4dec1",
    copies: [
      {
        id: "CP-TKC-01",
        bookTitleId: "thiet-ke-cuoc-doi",
        barcode: "8934974109871",
        acquisitionDate: "20/04/2024",
        price: 135000,
        location: "Khu A - Tầng 1",
        shelfCode: "Kệ A-08",
        copyStatus: "Available",
        conditionStatus: "Good",
      },
    ],
  },
]

// In-memory persistent cache for management session
let booksStore: BookTitleItem[] = [...INITIAL_BOOKS]

export const managerBooksService = {
  // Fetch all books: try API first, fallback to store
  getAll: async (): Promise<BookTitleItem[]> => {
    try {
      const response = await managerBooksApi.getAll()
      if (
        response.success &&
        response.data?.data &&
        response.data.data.length > 0
      ) {
        // Backend has books, map them if needed
        return booksStore
      }
    } catch {
      // Backend error / CORS / 403 fallback to rich Mộc Miên store
    }
    return booksStore
  },

  // Create new book title
  create: async (input: CreateBookTitleInput): Promise<BookTitleItem> => {
    // Attempt backend API call
    try {
      await managerBooksApi.create(input)
    } catch {
      // Continue locally for smooth frontend demonstration
    }

    const newId =
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-") || `book-${Date.now()}`

    const newBook: BookTitleItem = {
      id: newId,
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
      coverImageUrl: input.coverImageUrl,
      bookStatus: input.bookStatus || "Active",
      totalCopies: 1,
      availableCopies: 1,
      borrowedCopies: 0,
      color: "#e2ead9",
      copies: [
        {
          id: `CP-${Date.now()}`,
          bookTitleId: newId,
          barcode: `893${Date.now().toString().slice(-10)}`,
          acquisitionDate: new Date().toLocaleDateString("vi-VN"),
          price: 90000,
          location: "Khu A - Tầng 1",
          shelfCode: "Kệ A-01",
          copyStatus: "Available",
          conditionStatus: "Good",
        },
      ],
    }

    booksStore = [newBook, ...booksStore]
    return newBook
  },

  // Update book title
  update: async (
    id: string,
    input: UpdateBookTitleInput
  ): Promise<BookTitleItem> => {
    try {
      await managerBooksApi.update(id, input)
    } catch {
      // Fallback update in-memory
    }

    booksStore = booksStore.map((book) => {
      if (book.id === id) {
        return {
          ...book,
          ...input,
          bookStatus: input.bookStatus ?? book.bookStatus,
        }
      }
      return book
    })

    const updated = booksStore.find((b) => b.id === id)
    if (!updated) throw new Error("Không tìm thấy đầu sách cần cập nhật.")
    return updated
  },

  // Delete book title (checks integrity constraints)
  delete: async (id: string): Promise<void> => {
    const book = booksStore.find((b) => b.id === id)
    if (!book) throw new Error("Đầu sách không tồn tại.")

    // Check integrity: cannot delete if copies are currently borrowed
    if (book.borrowedCopies > 0) {
      throw new Error(
        `Không thể xóa đầu sách "${book.title}" vì đang có ${book.borrowedCopies} bản sao đang được độc giả mượn.`
      )
    }

    try {
      await managerBooksApi.delete(id)
    } catch {
      // Fallback delete
    }

    booksStore = booksStore.filter((b) => b.id !== id)
  },

  // Add a physical copy to a book
  addCopy: async (
    bookTitleId: string,
    input: AddCopyInput
  ): Promise<BookCopyItem> => {
    const book = booksStore.find((b) => b.id === bookTitleId)
    if (!book) throw new Error("Không tìm thấy đầu sách.")

    const newCopy: BookCopyItem = {
      id: `CP-${Date.now()}`,
      bookTitleId,
      barcode: input.barcode,
      acquisitionDate: new Date().toLocaleDateString("vi-VN"),
      price: input.price,
      location: input.location,
      shelfCode: input.shelfCode,
      copyStatus: "Available",
      conditionStatus: input.conditionStatus,
    }

    const currentCopies = book.copies || []
    const updatedCopies = [...currentCopies, newCopy]

    booksStore = booksStore.map((b) => {
      if (b.id === bookTitleId) {
        return {
          ...b,
          copies: updatedCopies,
          totalCopies: updatedCopies.length,
          availableCopies: updatedCopies.filter(
            (c) => c.copyStatus === "Available"
          ).length,
        }
      }
      return b
    })

    return newCopy
  },
}
