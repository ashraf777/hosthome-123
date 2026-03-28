
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
  Sparkles,
  Paintbrush,
  List,
  CheckSquare,
  Link2,
  Server,
  FileText
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
  const isTaskManagementActive = pathname.startsWith("/dashboard/task-management");
  const isCalendarActive = pathname.startsWith("/dashboard/calendar");
  const isMultiCalendarActive = pathname.startsWith("/dashboard/multi-calendar");
  const isMessagingActive = pathname.startsWith("/dashboard/messaging");

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
            tooltip="Reservations"
          >
            <Book className="text-sidebar-primary" />
            <span>Reservations</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link href="/dashboard/calendar">
          <SidebarMenuButton isActive={isCalendarActive} tooltip="Calendar">
            <Calendar className="text-sidebar-primary" />
            <span>Calendar</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link href="/dashboard/multi-calendar">
          <SidebarMenuButton isActive={isMultiCalendarActive} tooltip="Multi Calendar">
            <Cable className="text-sidebar-primary" />
            <span>Multi Calendar</span>
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

      <Collapsible asChild>
        <>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={isMessagingActive}
                isSubmenu
              >
                <MessageCircle className="text-sidebar-primary" />
                <span>Guest Messaging</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent asChild>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/messaging/inbox')}>
                  <Link href="/dashboard/messaging/inbox">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span>Inbox</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/messaging/templates')}>
                  <Link href="/dashboard/messaging/templates">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Templates</span>
                  </Link>
                </SidebarMenuSubButton>
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
                isActive={isTaskManagementActive}
                isSubmenu
              >
                <Paintbrush className="text-sidebar-primary" />
                <span>Task Management</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent asChild>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/task-management/task-list')}>
                  <Link href="/dashboard/task-management/task-list">
                    <List className="h-4 w-4 mr-2" />
                    <span>Task List</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/task-management/checklist')}>
                  <Link href="/dashboard/task-management/checklist">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    <span>Checklist</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/task-management/cleaning-team')}>
                  <Link href="/dashboard/task-management/cleaning-team">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Cleaning Team</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/task-management/preset-task')}>
                  <Link href="/dashboard/task-management/preset-task">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Preset Task</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      </Collapsible>

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

      <Collapsible asChild>
        <>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={pathname.startsWith('/dashboard/connect')}
                isSubmenu
              >
                <Link2 className="text-sidebar-primary" />
                <span>Connect</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent asChild>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/connect/bed24')}>
                  <Link href="/dashboard/connect/bed24">
                    <Server className="h-4 w-4 mr-2" />
                    <span>Bed24</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      </Collapsible>
    </SidebarMenu>
  )
}
