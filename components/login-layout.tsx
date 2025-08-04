"use client"

import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const pathname = usePathname()

  // Show the normal layout with sidebar and header for all pages
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="w-64 border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RDC</span>
              </div>
              <div>
                <h2 className="font-semibold text-sm">Rwanda Drone</h2>
                <p className="text-xs text-muted-foreground">Community</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <AppSidebar />
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 