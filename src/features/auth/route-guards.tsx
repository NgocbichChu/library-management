import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/stores/use-auth-store"

export function RequireAuth() {
  const user = useAuthStore((state) => state.user)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function RequireManager() {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== "manager") {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export function GuestOnly() {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Outlet />
  return user.role === "manager" ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/" replace />
  )
}
