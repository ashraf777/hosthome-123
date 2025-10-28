
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
  Bed
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
    // {
    //   href: "/dashboard/booking",
    //   label: "Booking",
    //   icon: Book,
    // },
    // {
    //   href: "/dashboard/calendar",
    //   label: "Calendar",
    //   icon: Calendar,
    // },
    {
      href: "/dashboard/listings",
      label: "Listings",
      icon: Home,
    },
    // {
    //   href: "/dashboard/room-types",
    //   label: "Room Types",
    //   icon: Bed,
    // },
    // {
    //   href: "/dashboard/units",
    //   label: "Units",
    //   icon: KeyRound,
    // },
    // {
    //   href: "/dashboard/pricing",
    //   label: "Intelligent Pricing",
    //   icon: DollarSign,
    // },
    // {
    //   href: "/dashboard/channel-sync",
    //   label: "Channel Sync",
    //   icon: Cable,
    // },
    // {
    //   href: "/dashboard/messaging",
    //   label: "Messaging",
    //   icon: MessageCircle,
    // },
    //  {
    //   href: "/dashboard/guests",
    //   label: "Guest",
    //   icon: Users,
    // },
    // {
    //   href: "/dashboard/reporting",
    //   label: "Reporting",
    //   icon: BarChart2,
    // },
  ]

  const accountItems = [
    // {
    //   href: "/dashboard/accounts/invoice",
    //   label: "Invoice",
    //   icon: Receipt
    // },
    // {
    //   href: "/dashboard/accounts/expenses",
    //   label: "Expenses",
    //   icon: Wallet
    // },
    // {
    //   href: "/dashboard/accounts/payout",
    //   label: "Payout",
    //   icon: Banknote
    // }
  ]

  const isAccountsActive = pathname.startsWith("/dashboard/accounts")
  const isUserActive = pathname.startsWith("/dashboard/users")
  const isAccessControlActive = pathname.startsWith("/dashboard/access-control")
  const isSettingsActive = pathname.startsWith("/dashboard/settings")

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
      {/* <Collapsible defaultOpen={isAccountsActive}>
        <CollapsibleTrigger asChild>
          <SidebarMenuItem>
              <SidebarMenuButton
                className="w-full justify-start"
                isActive={isAccountsActive}
                tooltip="Accounts"
              >
                <Banknote className="text-sidebar-primary" />
                <span>Accounts</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </CollapsibleTrigger>
        <CollapsibleContent>
           <ul className="ml-7 my-2 flex flex-col gap-1 border-l border-muted-foreground/30">
            {accountItems.map((item) => (
              <li key={item.href} className="pl-4">
                 <Link href={item.href} className={cn(
                    "flex items-center gap-2 py-1 text-sm rounded-md",
                    pathname === item.href
                      ? "text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground/70 hover:text-sidebar-primary-foreground"
                  )}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                 </Link>
              </li>
            ))}
           </ul>
        </CollapsibleContent>
      </Collapsible>
        <SidebarMenuItem>
          <Link href="/dashboard/settings">
            <SidebarMenuButton
              isActive={isSettingsActive}
              tooltip="Settings"
            >
              <Settings className="text-sidebar-primary" />
              <span>Settings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem> */}
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
