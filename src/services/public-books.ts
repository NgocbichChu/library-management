import { booksApi, type PublicBookDto } from "@/api/books"

export type PublicBook = {
  id: string
  title: string
  author: string
  category: string
  description: string
  color: string
  available: number
}

const colors = ["#d9e6d1", "#ead7b4", "#cbdde0", "#e6c8c2", "#d8d1df"]

const mapBook = (book: PublicBookDto, index: number): PublicBook => ({
  id: String(book.id),
  title: book.title,
  author: book.author,
  category: "Kho sách",
  description: "Thông tin chi tiết của cuốn sách sẽ được cập nhật.",
  color: colors[index % colors.length],
  available: book.available ? 1 : 0,
})

export const publicBooksService = {
  getAll: async (): Promise<PublicBook[]> => {
    const response = await booksApi.getAll()
    if (!response.success || !response.data?.data) {
      throw new Error(response.message || "Không thể tải danh sách sách.")
    }
    return response.data.data.map(mapBook)
  },
}
