"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"

/** Pages that render full-width (no content padding wrapper) */
const FULL_WIDTH_PATHS = new Set(["/"])

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const { user, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isFullWidth = FULL_WIDTH_PATHS.has(pathname)

  // ── Authenticated: sidebar layout ────────────────────────────────
  if (!loading && user) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          {/* Top nav header — always visible */}
          <MarketingHeader onSidebarToggle={() => setIsMobileMenuOpen(true)} />

          <div className="flex flex-1 min-h-0">
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Desktop Sidebar */}
            <Sidebar
              className="w-64 hidden lg:flex flex-col shrink-0"
              style={{ background: "#fff", borderRight: "1px solid rgba(0,38,116,0.08)", boxShadow: "1px 0 0 rgba(0,38,116,0.04)" }}
            >
              <SidebarHeader style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(0,38,116,0.06)" }}>
                <Link href="/" className="mk-logo" style={{ marginBottom: 0 }}>
                  <div className="mk-logo__mark">RDC</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#002674", lineHeight: 1.2 }}>Rwanda Drone</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Community Platform</div>
                  </div>
                </Link>
              </SidebarHeader>
              <SidebarContent style={{ flex: 1, overflow: "hidden" }}>
                <AppSidebar />
              </SidebarContent>
            </Sidebar>

            {/* Mobile Sidebar drawer */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
              style={{ background: "#fff", borderRight: "1px solid rgba(0,38,116,0.08)", boxShadow: "4px 0 32px rgba(0,38,116,0.12)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid rgba(0,38,116,0.06)" }}>
                <Link href="/" className="mk-logo" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="mk-logo__mark">RDC</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#002674", lineHeight: 1.2 }}>Rwanda Drone</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Community Platform</div>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} style={{ color: "#64748b" }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div style={{ flex: 1, overflow: "auto" }}>
                <AppSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>

            {/* Main content */}
            <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6 bg-background overflow-auto flex flex-col">
              <div className="max-w-7xl mx-auto w-full flex-1">{children}</div>
              <MarketingFooter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // ── Guest (and loading state): marketing header on all pages ─────
  return (
    <div className={isFullWidth ? "marketing-page" : "flex flex-col min-h-screen"}>
      <MarketingHeader />
      {isFullWidth ? (
        <>
          {children}
          <MarketingFooter />
        </>
      ) : (
        <>
          <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
          <MarketingFooter />
        </>
      )}
    </div>
  )
}
