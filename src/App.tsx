import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router"
import { RequireAuth, GuestOnly } from "@/features/auth/route-guards"
import { GlobalLoading } from "@/components/common/global-loading"
import { AdminLayout } from "@/layouts/admin-layout"
import { AuthLayout } from "@/layouts/auth-layout"
import { Component as LoginPage } from "@/features/auth/login-page"
import { navMain } from "@/config/navigation"
function PreviewPage() {
  const { pathname } = useLocation()
  const pages = navMain.flatMap((item) => item.items ?? [item])
  const title =
    pages.find((item) => item.url === pathname)?.title ?? "Không tìm thấy trang"
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-6 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Đây là bản xem trước giao diện quản lý thư viện. Nội dung và dữ liệu sẽ
        được bổ sung khi kết nối chức năng.
      </div>
    </main>
  )
}
export function App() {
  return (
    <BrowserRouter>
      <GlobalLoading />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<GuestOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<PreviewPage />} />
            <Route path="*" element={<PreviewPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
