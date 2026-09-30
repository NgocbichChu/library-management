import { ArrowRight, Clock3, Library, MapPin, Sparkles } from "lucide-react"
import { Link } from "react-router"
import { BookCard, BookCover } from "./library-shared"
import { usePublicBooks } from "./library-data"
export function HomePage() {
  const { books, isLoading, error } = usePublicBooks()

  return (
    <div>
      <section className="border-b border-[#dfe5dc] bg-[#e7eee3] px-5 py-16 lg:px-8 lg:py-24 dark:border-border dark:bg-card/40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-[#6e826f] uppercase dark:text-muted-foreground">
              <Sparkles className="size-4" /> Không gian đọc của bạn
            </p>
            <h1 className="max-w-2xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-[#1f3b2b] md:text-7xl dark:text-foreground">
              Mỗi cuốn sách mở ra một{" "}
              <span className="text-[#c27652]">góc nhìn mới.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#617067] dark:text-muted-foreground">
              Khám phá bộ sưu tập được chọn lọc, mượn sách dễ dàng và giữ lại
              những câu chuyện bạn yêu thích.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/books"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1f5a45] px-2.5 text-sm font-medium text-white hover:bg-[#174735]"
              >
                Khám phá kho sách <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#b9cbbb] px-2.5 text-sm font-medium hover:bg-[#dce8d9] dark:border-border dark:text-foreground dark:hover:bg-muted"
              >
                Tìm hiểu thư viện
              </Link>
            </div>
          </div>
          <div className="relative flex min-h-80 items-center justify-center">
            <div className="absolute h-64 w-64 rounded-full border border-[#b8cdb8] dark:border-border/30" />
            <div className="absolute h-80 w-80 rounded-full border border-[#c8d8c5] dark:border-border/20" />
            {books[0] ? (
              <div className="relative rotate-[-5deg]">
                <BookCover book={books[0]} large />
              </div>
            ) : (
              <p className="relative max-w-60 text-center text-sm text-[#718077] dark:text-muted-foreground">
                {isLoading
                  ? "Đang tải danh sách sách..."
                  : (error ?? "Thư viện chưa có sách để hiển thị.")}
              </p>
            )}
            {books[1] && (
              <div className="absolute bottom-5 left-4 rotate-[8deg] md:left-12">
                <BookCover book={books[1]} />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
              Được yêu thích
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
              Gợi ý cho hôm nay
            </h2>
          </div>
          <Link
            to="/books"
            className="hidden items-center gap-1 text-sm font-semibold text-[#1f5a45] sm:flex dark:text-emerald-400"
          >
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>
        {books.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-[#718077] dark:text-muted-foreground">
            {isLoading
              ? "Đang tải danh sách sách..."
              : (error ?? "Thư viện chưa có sách để gợi ý.")}
          </p>
        )}
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-6 border-y border-[#dfe5dc] py-10 sm:grid-cols-3 dark:border-border">
          <div>
            <Clock3 className="mb-4 size-5 text-[#c27652]" />
            <h3 className="font-semibold text-[#1f3b2b] dark:text-foreground">
              Mượn trong 3 phút
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#718077] dark:text-muted-foreground">
              Tìm sách, đặt mượn và nhận tại quầy gần bạn.
            </p>
          </div>
          <div>
            <Library className="mb-4 size-5 text-[#c27652]" />
            <h3 className="font-semibold text-[#1f3b2b] dark:text-foreground">
              Hơn 2.000 đầu sách
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#718077] dark:text-muted-foreground">
              Từ văn học, kỹ năng đến những chuyến du hành khám phá.
            </p>
          </div>
          <div>
            <MapPin className="mb-4 size-5 text-[#c27652]" />
            <h3 className="font-semibold text-[#1f3b2b] dark:text-foreground">
              Một nơi để trở về
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#718077] dark:text-muted-foreground">
              Không gian yên tĩnh cho việc đọc, học và kết nối.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

