"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface HubTab {
  id: string
  label: string
  icon: LucideIcon
  href: string // actual page route to render
}

interface HubLayoutProps {
  title: string
  tabs: HubTab[]
  defaultTab: string
  children: (activeTab: string) => React.ReactNode
}

export function HubLayout({ title, tabs, defaultTab, children }: HubLayoutProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = searchParams.get("tab") || defaultTab

  const setTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with tabs */}
      <div className="bg-background border-b sticky top-[57px] z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children(activeTab)}
      </div>
    </div>
  )
}
