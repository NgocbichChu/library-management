import { useEffect, useState } from "react"
import { publicBooksService, type PublicBook } from "@/services/public-books"

/* Sample public catalogue retained for possible reuse; never use as live data.
export const fallbackBooks: PublicBook[] = [
  {
    id: "nam-phia-sau",
    title: "Năm phía sau",
    author: "Erling Kagge",
    category: "Khám phá",
    description:
      "Một cuốn sách nhỏ về nghệ thuật tìm thấy khoảng lặng và những điều thật sự quan trọng trong đời sống hiện đại.",
    color: "#d9e6d1",
    available: 4,
  },
  {
    id: "nha-gia-kim",
    title: "Nhà giả kim",
    author: "Paulo Coelho",
    category: "Văn học",
    description:
      "Hành trình theo đuổi kho báu và lắng nghe tiếng gọi của ước mơ, một câu chuyện đã truyền cảm hứng cho hàng triệu độc giả.",
    color: "#ead7b4",
    available: 2,
  },
  {
    id: "su-im-lang",
    title: "Sức mạnh của sự im lặng",
    author: "Susan Cain",
    category: "Tâm lý",
    description:
      "Một góc nhìn sâu sắc về sức mạnh của những người hướng nội trong một thế giới luôn ưa chuộng sự ồn ào.",
    color: "#cbdde0",
    available: 6,
  },
  {
    id: "tuoi-tre-dang-gia",
    title: "Tuổi trẻ đáng giá bao nhiêu",
    author: "Rosie Nguyễn",
    category: "Phát triển bản thân",
    description:
      "Những gợi ý gần gũi để sống, học tập và làm việc có chủ đích hơn trong những năm tháng tuổi trẻ.",
    color: "#e6c8c2",
    available: 0,
  },
  {
    id: "muoi-nguoi-da-den",
    title: "Mười người da đen nhỏ",
    author: "Agatha Christie",
    category: "Trinh thám",
    description:
      "Một vụ án bí ẩn trên hòn đảo biệt lập, nơi từng người một biến mất theo một bài đồng dao đáng sợ.",
    color: "#d8d1df",
    available: 3,
  },
  {
    id: "thiet-ke-cuoc-doi",
    title: "Thiết kế cuộc đời",
    author: "Bill Burnett",
    category: "Kỹ năng",
    description:
      "Tư duy thiết kế giúp bạn thử nghiệm nhiều hướng đi và chủ động tạo ra một cuộc đời phù hợp.",
    color: "#d4dec1",
    available: 5,
  },
]
*/

export function usePublicBooks() {
  const [books, setBooks] = useState<PublicBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    publicBooksService
      .getAll()
      .then((data) => {
        if (!cancelled) setBooks(data)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Không thể tải danh sách sách."
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { books, isLoading, error }
}

