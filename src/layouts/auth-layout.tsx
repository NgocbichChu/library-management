import { Library } from "lucide-react"
import { Link, Outlet } from "react-router"

export const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f7f8f4] px-4 py-12 text-[#17231d] dark:bg-background dark:text-foreground">
      <div className="mb-6 flex items-center justify-center">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#1f5a45] text-white shadow-sm">
            <Library className="size-6" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-[#1f3b2b] dark:text-foreground">
            Mộc Miên Library
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-[#dfe5dc] bg-white p-6 shadow-sm sm:p-8 dark:border-border dark:bg-card">
        <Outlet />
      </div>

      <div className="mt-6 text-center text-xs text-[#718077] dark:text-muted-foreground">
        Thư viện Mộc Miên · Không gian đọc sách &amp; quản lý tri thức
      </div>
    </div>
  )
}

export default AuthLayout
