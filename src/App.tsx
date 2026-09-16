import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router"
import { RequireManager, GuestOnly } from "@/features/auth/route-guards"
import { GlobalLoading } from "@/components/common/global-loading"
import { Toaster } from "@/components/common/toaster"
import { AdminLayout } from "@/layouts/admin-layout"
import { AuthLayout } from "@/layouts/auth-layout"
import { Component as LoginPage } from "@/features/auth/login-page"
import { OverviewPage } from "@/features/manager/overview-page"
import { BooksPage } from "@/features/manager/books-page"
import { CategoriesPage } from "@/features/manager/categories-page"
import { ReadersPage } from "@/features/manager/readers-page"
import { LoansPage } from "@/features/manager/loans-page"
import { SettingsPage } from "@/features/manager/settings-page"
import { ReaderHomePage } from "@/features/reader/reader-home-page"

export function App() {
  return (
    <BrowserRouter>
      <GlobalLoading />
      <Toaster />
      <Routes>
        {/* Public / Reader Home page */}
        <Route path="/" element={<ReaderHomePage />} />

        {/* Guest Only: Login */}
        <Route element={<GuestOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        {/* Protected Manager Dashboard (Require role: manager) */}
        <Route element={<RequireManager />}>
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="readers" element={<ReadersPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
