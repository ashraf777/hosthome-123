import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Logo } from "@/components/icons"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-sidebar-border"
      >
        <SidebarHeader className="h-14 p-3.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 overflow-hidden"
          >
            <Logo className="size-7 shrink-0 text-sidebar-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">
              HostHome
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content if any */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="flex md:hidden" />
          <div className="flex-1">
            {/* Can add page title here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
