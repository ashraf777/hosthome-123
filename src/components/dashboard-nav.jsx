
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
  PlusCircle,
  Building,
  Sparkles
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar.jsx"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()

  const isListingsActive = pathname.startsWith("/dashboard/listings");
  const isPropertiesActive = pathname.startsWith("/dashboard/properties");
  const isRoomTypesActive = pathname.startsWith("/dashboard/room-types");
  const isUnitsActive = pathname.startsWith("/dashboard/units");
  const isUserManagementActive = pathname.startsWith("/dashboard/users");
  const isAccessControlActive = pathname.startsWith("/dashboard/access-control");
  const isAmenitiesActive = pathname.startsWith("/dashboard/amenities");
  const isBookingsActive = pathname.startsWith("/dashboard/booking");
  const isCalendarActive = pathname.startsWith("/dashboard/calendar");
  const isMultiCalendarActive = pathname.startsWith("/dashboard/multi-calendar");

  return (
    <SidebarMenu>
        <SidebarMenuItem>
          <Link href="/dashboard">
            <SidebarMenuButton
              isActive={pathname === "/dashboard"}
              tooltip="Dashboard"
            >
              <LayoutDashboard className="text-sidebar-primary" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <Link href="/dashboard/booking">
            <SidebarMenuButton
              isActive={isBookingsActive}
              tooltip="Bookings"
            >
              <Book className="text-sidebar-primary" />
              <span>Bookings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <Link href="/dashboard/multi-calendar">
            <SidebarMenuButton
              isActive={isMultiCalendarActive}
              tooltip="Multi Calendar"
            >
              <Calendar className="text-sidebar-primary" />
              <span>Multi Calendar</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <Link href="/dashboard/calendar">
            <SidebarMenuButton
              isActive={isCalendarActive}
              tooltip="Calendar"
            >
              <Calendar className="text-sidebar-primary" />
              <span>Calendar</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
            <Link href="/dashboard/listings">
                <SidebarMenuButton isActive={isListingsActive} tooltip="Listings">
                    <Home className="text-sidebar-primary" />
                    <span>Listings</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
            <Link href="/dashboard/properties">
                <SidebarMenuButton isActive={isPropertiesActive} tooltip="Properties">
                    <Building className="text-sidebar-primary" />
                    <span>Properties</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
            <Link href="/dashboard/room-types">
                <SidebarMenuButton isActive={isRoomTypesActive} tooltip="Room Types">
                    <Bed className="text-sidebar-primary" />
                    <span>Room Types</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
            <Link href="/dashboard/units">
                <SidebarMenuButton isActive={isUnitsActive} tooltip="Units">
                    <KeyRound className="text-sidebar-primary" />
                    <span>Units</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
            <Link href="/dashboard/amenities">
                <SidebarMenuButton isActive={isAmenitiesActive} tooltip="Amenities">
                    <Sparkles className="text-sidebar-primary" />
                    <span>Amenities</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
            <Link href="/dashboard/users">
                <SidebarMenuButton isActive={isUserManagementActive} tooltip="User Management">
                    <UserCog className="text-sidebar-primary" />
                    <span>User Management</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
            <Link href="/dashboard/access-control">
                <SidebarMenuButton isActive={isAccessControlActive} tooltip="Access Control">
                    <ShieldCheck className="text-sidebar-primary" />
                    <span>Access Control</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>

      {/* 
      const navItems = [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/calendar",
          label: "Calendar",
          icon: Calendar,
        },
        {
          href: "/dashboard/booking",
          label: "Bookings",
          icon: Book,
        },
        {
          href: "/dashboard/guests",
          label: "Guests",
          icon: Users,
        },
      ]

      const isSettingsActive = pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/users") || pathname.startsWith("/dashboard/access-control");
      const isAccountsActive = pathname.startsWith("/dashboard/accounts");

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
      <Collapsible asChild>
        <>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton
                isActive={isListingsActive || isPropertiesActive || isRoomTypesActive || isUnitsActive}
                isSubmenu
                >
                <Home className="text-sidebar-primary" />
                <span>Property</span>
                </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent asChild>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                 <Link href="/dashboard/listings">
                    <SidebarMenuSubButton isActive={isListingsActive}>
                        Listings
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
               <SidebarMenuSubItem>
                 <Link href="/dashboard/properties">
                    <SidebarMenuSubButton isActive={isPropertiesActive}>
                        Properties
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                 <Link href="/dashboard/room-types">
                    <SidebarMenuSubButton isActive={isRoomTypesActive}>
                        Room Types
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                 <Link href="/dashboard/units">
                    <SidebarMenuSubButton isActive={isUnitsActive}>
                        Units
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      </Collapsible>
      <Collapsible asChild>
        <>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton
                isActive={isAccountsActive}
                isSubmenu
                >
                <DollarSign className="text-sidebar-primary" />
                <span>Accounts</span>
                </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent asChild>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                 <Link href="/dashboard/accounts/invoice">
                    <SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/accounts/invoice')}>
                        Invoice
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
               <SidebarMenuSubItem>
                 <Link href="/dashboard/accounts/expenses">
                    <SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/accounts/expenses')}>
                        Expenses
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
               <SidebarMenuSubItem>
                 <Link href="/dashboard/accounts/payout">
                    <SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/accounts/payout')}>
                        Payout
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      </Collapsible>
       <SidebarMenuItem>
          <Link href="/dashboard/pricing">
            <SidebarMenuButton
              isActive={pathname.startsWith('/dashboard/pricing')}
              tooltip="Intelligent Pricing"
            >
              <BarChart2 className="text-sidebar-primary" />
              <span>Intelligent Pricing</span>
            </SidebarMenuButton>
          </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
          <Link href="/dashboard/channel-sync">
            <SidebarMenuButton
              isActive={pathname.startsWith('/dashboard/channel-sync')}
              tooltip="Channel Sync"
            >
              <Cable className="text-sidebar-primary" />
              <span>Channel Sync</span>
            </SidebarMenuButton>
          </Link>
      </SidebarMenuItem>
       <SidebarMenuItem>
          <Link href="/dashboard/messaging">
            <SidebarMenuButton
              isActive={pathname.startsWith('/dashboard/messaging')}
              tooltip="Messaging"
            >
              <MessageCircle className="text-sidebar-primary" />
              <span>Messaging</span>
            </SidebarMenuButton>
          </Link>
      </SidebarMenuItem>

       <Collapsible asChild>
        <>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton
                isActive={isSettingsActive}
                isSubmenu
                >
                <Settings className="text-sidebar-primary" />
                <span>Settings</span>
                </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>
          <CollapsibleContent asChild>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <Link href="/dashboard/settings">
                    <SidebarMenuSubButton isActive={pathname === '/dashboard/settings'}>General</SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <Link href="/dashboard/users">
                    <SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/users')}>Users</SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
               <SidebarMenuSubItem>
                 <Link href="/dashboard/access-control">
                    <SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/access-control')}>Roles</SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      </Collapsible> 
      */}
    </SidebarMenu>
  )
}
