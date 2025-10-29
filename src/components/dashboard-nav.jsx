
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Book,
  Cable,
  Calendar,
  DollarSign,
  LayoutDashboard,
  MessageCircle,
  Home,
  Users,
  UserCog,
  BarChart2,
  Banknote,
  Receipt,
  Wallet,
  Settings,
  ShieldCheck,
  KeyRound,
  Bed,
  PlusCircle
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar.jsx"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/listings",
      label: "Listings",
      icon: Home,
    },
    {
      href: "/dashboard/properties",
      label: "Properties",
      icon: Home,
    },
    {
      href: "/dashboard/room-types",
      label: "Room Types",
      icon: Bed,
    },
    {
      href: "/dashboard/units",
      label: "Units",
      icon: KeyRound,
    },
  ]

  const isUserActive = pathname.startsWith("/dashboard/users")
  const isAccessControlActive = pathname.startsWith("/dashboard/access-control")

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href) && (item.href === "/dashboard" ? pathname === item.href : true)}
              tooltip={item.label}
            >
              <item.icon className="text-sidebar-primary" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
          <Link href="/dashboard/users">
            <SidebarMenuButton
              isActive={isUserActive}
              tooltip="User"
            >
              <UserCog className="text-sidebar-primary" />
              <span>User Management</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href="/dashboard/access-control">
            <SidebarMenuButton
              isActive={isAccessControlActive}
              tooltip="Access Control"
            >
              <ShieldCheck className="text-sidebar-primary" />
              <span>Access Control</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
    </SidebarMenu>
  )
}
