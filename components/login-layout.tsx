"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Show the normal layout with sidebar and header for all pages
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <Sidebar className="w-64 border-r hidden lg:block">
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

        {/* Mobile Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RDC</span>
              </div>
              <div>
                <h2 className="font-semibold text-sm">Rwanda Drone</h2>
                <p className="text-xs text-muted-foreground">Community</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <AppSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 