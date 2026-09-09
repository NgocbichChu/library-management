import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/stores/use-auth-store"

export function RequireAuth() {
  const user = useAuthStore((state) => state.user)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
export function GuestOnly() {
  const user = useAuthStore((state) => state.user)
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}
