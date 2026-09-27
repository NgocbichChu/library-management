import { Navigate, Outlet, useLocation } from "react-router"
import { useAuth } from "@/hooks/use-auth"

export function RequireAuth() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  return isAuthenticated || user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  )
}

export function RequireManager() {
  const { isAuthenticated, user, isManager } = useAuth()
  const location = useLocation()

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!isManager) {
    return <Navigate to="/profile" replace />
  }

  return <Outlet />
}

export function GuestOnly() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated || user ? <Navigate to="/" replace /> : <Outlet />
}
