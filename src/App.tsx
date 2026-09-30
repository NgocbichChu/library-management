import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/use-auth-store"
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
import { PublicLayout } from "@/layouts/public-layout"
import { AboutPage } from "@/features/library/about-page"
import { BooksPage } from "@/features/library/books-page"
import { HomePage } from "@/features/library/home-page"
import {
  BookDetailPage,
  BorrowPage,
  ProfilePage,
} from "@/features/library/library-pages"
import { DashboardOverviewPage } from "@/features/manager/dashboard-overview-page"
import { BooksManagementPage } from "@/features/manager/books-management-page"
import { UsersManagementPage } from "@/features/manager/users-management-page"
import { CategoriesPage } from "@/features/manager/categories-page"
import { LoansPage } from "@/features/manager/loans-page"
import { SettingsPage } from "@/features/manager/settings-page"
import { SqlDemoPage } from "./features/manager/sql-demo-page"

function AuthListener() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const handleUnauthorized = () => {
      toast.error(
        "Phiên đăng nhập đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại."
      )
      void logout()
      navigate("/login", {
        replace: true,
        state: { from: window.location.pathname },
      })
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized)
    }
  }, [navigate, logout])

  return null
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalLoading />
      <Toaster />
      <AuthListener />
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
          <Route path="/sql-demo" element={<SqlDemoPage />} />
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="books" element={<BooksManagementPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route
              path="readers"
              element={<Navigate to="/dashboard/users" replace />}
            />
            <Route path="loans" element={<LoansPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
