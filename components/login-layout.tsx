"use client"

import { useState } from "react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const { user, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAuthenticated = !loading && !!user

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

        {/* Desktop Sidebar — visible to all visitors */}
        <Sidebar className="w-64 border-r border-sidebar-border hidden lg:block bg-sidebar">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">RDC</span>
              </div>
              <div>
                <h2 className="font-bold text-sm text-sidebar-foreground">Rwanda Drone</h2>
                <p className="text-xs text-sidebar-foreground/60">Community Platform</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <AppSidebar />
          </SidebarContent>
        </Sidebar>

        {/* Mobile Sidebar — visible to all visitors */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--sidebar-background))] border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">RDC</span>
              </div>
              <div>
                <h2 className="font-bold text-sm text-sidebar-foreground">Rwanda Drone</h2>
                <p className="text-xs text-sidebar-foreground/60">Community Platform</p>
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

        <div className="flex-1 flex flex-col min-w-0">
          <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
