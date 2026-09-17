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

export function NavUser({
  user,
}: {
  user: {
    name: string
    email?: string
    username?: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { logout, isLoggingOut } = useAuth()
  const displayIdentifier = user.email || user.username || ""

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
            <UserAvatar email={displayIdentifier} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{displayIdentifier}</span>
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
                  <span className="truncate text-xs">{displayIdentifier}</span>
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
