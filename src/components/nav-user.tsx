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
import { useAuth } from "@/hooks/use-auth"
import type { AuthUser } from "@/types/auth"

export function NavUser({
  user,
}: {
  user: AuthUser | {
    name: string
    email?: string
    username?: string
    roles?: string[]
    fullName?: string | null
    position?: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { logout, isLoggingOut } = useAuth()

  const isAdmin =
    user.roles?.includes("ADMIN") ||
    user.username === "admin"
  const isEmployee =
    user.roles?.includes("EMPLOYEE") ||
    user.roles?.includes("LIBRARIAN") ||
    user.username === "thuthu"

  const roleLabel = isAdmin
    ? "Quản trị viên"
    : isEmployee
      ? (user.position ?? "Thủ thư / Quản lý")
      : "Độc giả thư viện"

  const displayName =
    user.fullName ||
    (isAdmin ? "Quản trị viên" : user.name || user.username || "Người dùng")

  const displayIdentifier = user.email || (user.username ? `@${user.username}` : "")

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Local session is cleared even if the logout API fails.
    } finally {
      navigate("/login", { replace: true })
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <UserAvatar email={user.email || user.username || "user"} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
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
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{displayIdentifier}</span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#1f5a45] dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" />
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

