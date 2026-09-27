import * as React from "react"
import { Library } from "lucide-react"
import { Link } from "react-router"
import { useAuth } from "@/hooks/use-auth"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navMain } from "@/config/navigation"

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { user } = useAuth()
  if (!user) return null
  const visibleNavItems = navMain

  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
      <SidebarHeader className="border-b border-border/60">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-1 py-1 transition-opacity hover:opacity-90"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1f5a45] text-white shadow-sm">
            <Library className="size-4" />
          </span>
          <div className="flex flex-col overflow-hidden text-left group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-[#1f3b2b] dark:text-foreground">
              Mộc Miên Library
            </span>
            <span className="truncate text-[11px] text-[#718077] dark:text-muted-foreground">
              Cổng quản trị thư viện
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
