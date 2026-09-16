import { useNavigate } from "react-router"
import { BookOpen, User, LogOut, ShieldCheck, Calendar, Search } from "lucide-react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useLibraryStore } from "@/stores/use-library-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLogo } from "@/lib/svg"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"

export const ReaderHomePage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { books, borrowSlips } = useLibraryStore()
  const [search, setSearch] = useState("")

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  // Find loans for this reader
  const myLoans = useMemo(() => {
    return borrowSlips.filter(
      (s) =>
        s.reader?.email === user?.email ||
        s.reader?.reader_code === user?.readerCode
    )
  }, [borrowSlips, user])

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return books
    const q = search.toLowerCase()
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    )
  }, [books, search])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <MainLogo />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">Thư Viện Mộc Miên</span>
            <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
              Cổng tra cứu độc giả
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block text-xs">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-muted-foreground">Độc giả ({user.readerCode ?? "RD001"})</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleLogout()}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* User Card & Active Loans */}
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-xs border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <User className="size-4 text-primary" /> Thẻ độc giả điện tử
                  </CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                    <ShieldCheck className="size-3 mr-1" /> Đang kích hoạt
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Họ và tên:</span>
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Mã độc giả:</span>
                  <span className="font-mono font-medium">{user.readerCode ?? "RD001"}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Đối tượng:</span>
                  <span className="font-medium">Sinh viên</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hạn mức mượn:</span>
                  <span className="font-medium text-primary">Tối đa 5 cuốn / lần</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <BookOpen className="size-4 text-amber-600" /> Sách đang mượn của bạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myLoans.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Bạn hiện chưa mượn cuốn sách nào. Hãy chọn sách bên dưới để đến quầy làm thủ tục mượn nhé!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myLoans.map((slip) => (
                      <div
                        key={slip.borrow_slip_id}
                        className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground font-mono">
                            {slip.borrow_slip_code}
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {slip.details?.map((d) => (
                              <p key={d.borrow_slip_detail_id} className="text-muted-foreground">
                                • {d.book_title?.title} ({d.book_copy?.barcode})
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="flex items-center gap-1 text-muted-foreground justify-end">
                            <Calendar className="size-3" />
                            <span>Hạn trả: {new Date(slip.due_date).toLocaleDateString("vi-VN")}</span>
                          </p>
                          <Badge
                            variant={slip.slip_status === "OVERDUE" ? "destructive" : "outline"}
                            className="mt-1"
                          >
                            {slip.slip_status === "OVERDUE" ? "Quá hạn" : "Đang mượn"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Book Search and Catalog */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Kho sách thư viện</h2>
              <p className="text-xs text-muted-foreground">
                Tra cứu tài liệu, vị trí kệ sách và tình trạng sẵn sàng trước khi tới mượn.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên sách, tác giả, thể loại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book) => {
              const isAvailable = (book.available_copies_count ?? 0) > 0

              return (
                <Card key={book.book_title_id} className="shadow-xs overflow-hidden flex flex-col">
                  <div className="h-44 overflow-hidden bg-muted relative">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <BookOpen className="size-10" />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 right-2 ${
                        isAvailable
                          ? "bg-emerald-600 text-white"
                          : "bg-destructive text-white"
                      }`}
                    >
                      {isAvailable
                        ? `Còn ${book.available_copies_count} cuốn`
                        : "Đã mượn hết"}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <Badge variant="outline" className="w-fit text-[10px]">
                      {book.category}
                    </Badge>
                    <CardTitle className="text-sm font-semibold line-clamp-2 mt-1">
                      {book.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Tác giả: {book.author}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex-1 flex flex-col justify-end">
                    <p className="line-clamp-2 mb-2 text-[11px]">{book.description}</p>
                    <div className="border-t pt-2 flex justify-between items-center text-[11px]">
                      <span>{book.publisher}</span>
                      <span>{book.publication_year}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border p-6 text-center text-xs text-muted-foreground mt-12">
        Hệ thống Thư Viện Mộc Miên • Phân hệ Tra cứu & Độc giả
      </footer>
    </div>
  )
}
