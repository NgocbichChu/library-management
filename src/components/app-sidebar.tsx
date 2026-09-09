import * as React from "react"
import { useAuthStore } from "@/stores/use-auth-store"

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
import { MainLogo } from "@/lib/svg"

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const user = useAuthStore((state) => state.user)
  if (!user) return null
  const visibleNavItems = navMain

  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
      <SidebarHeader>
        <div className="flex h-13 items-center justify-center overflow-hidden whitespace-nowrap text-primary [&>svg]:size-7 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>svg]:size-7">
          <MainLogo />
        </div>
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
