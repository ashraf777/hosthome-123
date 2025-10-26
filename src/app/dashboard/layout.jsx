
'use client';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar.jsx"
import { DashboardNav } from "@/components/dashboard-nav.jsx"
import { UserNav } from "@/components/user-nav.jsx"
import { Logo } from "@/components/icons.jsx"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context.jsx";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}) {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [user, loading, token, router]);

  if (loading || !token) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-2xl font-semibold">Loading...</div>
        </div>
    );
  }
  
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
              HostBoost
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
