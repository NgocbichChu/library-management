import { UserAvatar } from "@/components/common/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, LogOutIcon, ShieldCheck } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useNavigate } from "react-router"
import { useAuthStore } from "@/stores/use-auth-store"
import type { AuthUser } from "@/types/auth"

export function NavUser({
  user,
}: {
  user: AuthUser
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)
  const logout = useAuthStore((state) => state.logout)
  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Local session is cleared even if the logout API fails.
    } finally {
      navigate("/login", { replace: true })
    }
  }

  const roleLabel =
    user.role === "manager"
      ? (user.position ?? "Thủ thư / Quản lý")
      : "Độc giả thư viện"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <UserAvatar email={user.email} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
                    <ShieldCheck className="size-3" />
                    <span>{roleLabel}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              variant="destructive"
            >
              {isLoggingOut ? <Spinner /> : <LogOutIcon />}
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
