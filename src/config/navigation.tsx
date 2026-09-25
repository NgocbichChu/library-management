import type { ReactNode } from "react"
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  UsersIcon,
  ArrowLeftRightIcon,
  SettingsIcon,
} from "lucide-react"
interface NavigationItem {
  title: string
  url: string
  icon?: ReactNode
  items?: { title: string; url: string }[]
}
export const navMain: NavigationItem[] = [
  { title: "Tổng quan", url: "/dashboard", icon: <LayoutDashboardIcon /> },
  {
    title: "Sách và danh mục",
    url: "/dashboard/books",
    icon: <BookOpenIcon />,
    items: [
      { title: "Quản lý sách", url: "/dashboard/books" },
      { title: "Danh mục", url: "/dashboard/categories" },
    ],
  },
  {
    title: "Người dùng & Độc giả",
    url: "/dashboard/users",
    icon: <UsersIcon />,
  },
  {
    title: "Mượn trả sách",
    url: "/dashboard/loans",
    icon: <ArrowLeftRightIcon />,
  },
  { title: "Cài đặt", url: "/dashboard/settings", icon: <SettingsIcon /> },
]
