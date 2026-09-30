import { ArrowRight, BookOpen } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import type { PublicBook } from "@/services/public-books"

export function BookCover({
  book,
  large = false,
}: {
  book: PublicBook
  large?: boolean
}) {
  return (
    <div
      className={`relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[3px] p-5 shadow-[8px_10px_0_rgba(23,35,29,0.08)] ${large ? "h-96 w-64" : "h-64 w-44"}`}
      style={{ backgroundColor: book.color }}
    >
      <div className="flex justify-between text-[10px] font-bold tracking-[0.22em] text-[#385145] uppercase">
        <span>Mộc Miên</span>
        <span>MM.01</span>
      </div>
      <div>
        <div className="mb-3 h-px w-9 bg-[#385145]" />
        <h3
          className={`${large ? "text-3xl" : "text-xl"} max-w-[10ch] leading-[1.05] font-semibold text-[#24382b]`}
        >
          {book.title}
        </h3>
        <p className="mt-3 text-xs text-[#385145]">{book.author}</p>
      </div>
      <BookOpen className="absolute -right-5 -bottom-5 size-28 rotate-12 text-[#385145]/10" />
    </div>
  )
}

export function BookCard({ book }: { book: PublicBook }) {
  const navigate = useNavigate()
  return (
    <article className="group flex flex-col items-start">
      <Link to={`/books/${book.id}`} className="mb-4 w-full">
        <BookCover book={book} />
      </Link>
      <p className="mb-1 text-xs font-medium tracking-[0.14em] text-[#7b8b7f] uppercase dark:text-muted-foreground">
        {book.category}
      </p>
      <Link
        to={`/books/${book.id}`}
        className="font-semibold hover:text-[#1f5a45] dark:hover:text-emerald-400"
      >
        {book.title}
      </Link>
      <p className="mt-1 text-sm text-[#718077] dark:text-muted-foreground">
        {book.author}
      </p>
      <Button
        variant="link"
        className="mt-2 h-auto p-0 text-[#1f5a45] dark:text-emerald-400"
        onClick={() => navigate(`/books/${book.id}`)}
      >
        Xem chi tiết <ArrowRight className="ml-1 size-3" />
      </Button>
    </article>
  )
}

