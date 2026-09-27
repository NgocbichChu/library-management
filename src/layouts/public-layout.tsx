import { BookOpen, CircleUserRound, Library, Search } from "lucide-react"
import { Link, NavLink, Outlet, useNavigate } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/theme-toggle"

export function PublicLayout() {
  const { user, isManager } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#17231d] dark:bg-background dark:text-foreground">
      <header className="sticky top-0 z-20 border-b border-[#dfe5dc] bg-[#f7f8f4]/95 backdrop-blur dark:border-border dark:bg-background/95">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-5 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f5a45] text-white shadow-xs">
              <Library className="size-5" />
            </span>
            <span className="font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
              Mộc Miên Library
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#617067] md:flex dark:text-muted-foreground">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-[#1f5a45] dark:text-emerald-400"
                  : "hover:text-[#1f5a45] dark:hover:text-emerald-400"
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-[#1f5a45] dark:text-emerald-400"
                  : "hover:text-[#1f5a45] dark:hover:text-emerald-400"
              }
            >
              Kho sách
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-[#1f5a45] dark:text-emerald-400"
                  : "hover:text-[#1f5a45] dark:hover:text-emerald-400"
              }
            >
              Về thư viện
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
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
                className="hidden border-[#1f5a45] text-[#1f5a45] hover:bg-[#e7eee3] sm:inline-flex dark:border-emerald-500/50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                onClick={() => navigate("/dashboard")}
              >
                Trang quản lý
              </Button>
            )}
            {user ? (
              <Button
                variant="outline"
                className="gap-2 border-[#cbd8ce] bg-transparent dark:border-border dark:text-foreground dark:hover:bg-muted"
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
      <footer className="border-t border-[#dfe5dc] bg-[#eef2ea] px-5 py-8 lg:px-8 dark:border-border dark:bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-[#617067] sm:flex-row sm:items-center sm:justify-between dark:text-muted-foreground">
          <span className="flex items-center gap-2 font-medium text-[#1f5a45] dark:text-emerald-400">
            <BookOpen className="size-4" /> Đọc thêm một trang mỗi ngày.
          </span>
          <span>Thư viện Mộc Miên · Mở cửa 08:00 - 21:00</span>
        </div>
      </footer>
    </div>
  )
}
