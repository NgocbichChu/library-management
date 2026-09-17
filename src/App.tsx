import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router"
import {
  RequireAuth,
  RequireManager,
  GuestOnly,
} from "@/features/auth/route-guards"
import { GlobalLoading } from "@/components/common/global-loading"
import { Toaster } from "@/components/common/toaster"
import { AdminLayout } from "@/layouts/admin-layout"
import { AuthLayout } from "@/layouts/auth-layout"
import { Component as LoginPage } from "@/features/auth/login-page"
import { navMain } from "@/config/navigation"
import { PublicLayout } from "@/layouts/public-layout"
import {
  AboutPage,
  BookDetailPage,
  BooksPage,
  BorrowPage,
  HomePage,
  ProfilePage,
} from "@/features/library/library-pages"
import { DashboardOverviewPage } from "@/features/manager/dashboard-overview-page"
import { BooksManagementPage } from "@/features/manager/books-management-page"
import { UsersManagementPage } from "@/features/manager/users-management-page"

function PreviewPage() {
  const { pathname } = useLocation()
  const pages = navMain.flatMap((item) => item.items ?? [item])
  const title =
    pages.find((item) => item.url === pathname)?.title ?? "Không tìm thấy trang"
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold text-[#1f3b2b]">{title}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-[#cbd8ce] bg-[#f7f8f4] p-8 text-sm text-[#718077]">
        Chức năng <strong>{title}</strong> đang trong quá trình đồng bộ dữ liệu.
        Vui lòng chuyển qua mục <strong>Quản lý sách</strong> để trải nghiệm
        tính năng đã hoàn thiện.
      </div>
    </main>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalLoading />
      <Toaster />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/borrow/:id" element={<BorrowPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route element={<GuestOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>
        <Route element={<RequireManager />}>
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="books" element={<BooksManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="readers" element={<Navigate to="/dashboard/users" replace />} />
            <Route path="*" element={<PreviewPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
