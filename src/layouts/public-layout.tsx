import { BookOpen, CircleUserRound, Library, Search } from "lucide-react"
import { Link, NavLink, Outlet, useNavigate } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function PublicLayout() {
  const { user, isManager } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#17231d]">
      <header className="sticky top-0 z-20 border-b border-[#dfe5dc] bg-[#f7f8f4]/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-5 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f5a45] text-white">
              <Library className="size-5" />
            </span>
            <span className="font-semibold tracking-tight">
              Mộc Miên Library
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#617067] md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-[#1f5a45]" : "hover:text-[#1f5a45]"
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                isActive ? "text-[#1f5a45]" : "hover:text-[#1f5a45]"
              }
            >
              Kho sách
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "text-[#1f5a45]" : "hover:text-[#1f5a45]"
              }
            >
              Về thư viện
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tìm kiếm"
              onClick={() => navigate("/books")}
            >
              <Search className="size-4" />
            </Button>
            {isManager && (
              <Button
                variant="outline"
                className="hidden border-[#1f5a45] text-[#1f5a45] hover:bg-[#e7eee3] sm:inline-flex"
                onClick={() => navigate("/dashboard")}
              >
                Trang quản lý
              </Button>
            )}
            {user ? (
              <Button
                variant="outline"
                className="gap-2 border-[#cbd8ce] bg-transparent"
                onClick={() => navigate("/profile")}
              >
                <CircleUserRound className="size-4" /> Hồ sơ
              </Button>
            ) : (
              <Button
                className="bg-[#1f5a45] text-white hover:bg-[#174735]"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-[#dfe5dc] bg-[#eef2ea] px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-[#617067] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-medium text-[#1f5a45]">
            <BookOpen className="size-4" /> Đọc thêm một trang mỗi ngày.
          </span>
          <span>Thư viện Mộc Miên · Mở cửa 08:00 - 21:00</span>
        </div>
      </footer>
    </div>
  )
}
