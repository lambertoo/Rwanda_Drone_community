"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"

const FULL_WIDTH_PATHS = new Set(["/"])

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const isFullWidth = FULL_WIDTH_PATHS.has(pathname)

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
          <main className="flex-1 bg-background overflow-auto">
            <div className="w-full">{children}</div>
          </main>
          <MarketingFooter />
        </>
      )}
    </div>
  )
}
