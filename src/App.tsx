import { BrowserRouter, Navigate, Route, Routes } from "react-router"
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
import { CategoriesPage } from "@/features/manager/categories-page"
import { LoansPage } from "@/features/manager/loans-page"
import { SettingsPage } from "@/features/manager/settings-page"

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
