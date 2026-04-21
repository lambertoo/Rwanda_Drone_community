"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  MessageSquare,
  Shield,
  BookOpen,
  Wrench,
  ShoppingBag,
  User,
  Award,
  type LucideIcon,
  Compass,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onItemClick?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

interface NavSection {
  title?: string
  items: NavItem[]
}

export function AppSidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const getSections = (): NavSection[] => {
    const sections: NavSection[] = []

    // Main navigation — 5 items for everyone
    sections.push({
      items: [
        { title: "Community", href: "/community", icon: MessageSquare },
        { title: "Know-How", href: "/know-how", icon: BookOpen },
        { title: "Drone Tools", href: "/drone-tools", icon: Compass },
        { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
      ],
    })

    // My Account — logged in only
    if (user) {
      sections.push({
        title: "Account",
        items: [
          { title: "My Account", href: "/account", icon: User },
        ],
      })
    }

    // Admin — admin role only
    if (user?.role === "admin") {
      sections.push({
        title: "Administration",
        items: [
          { title: "Admin Panel", href: "/admin", icon: Shield },
        ],
      })
    }

    // Regulator — regulator role only
    if (user?.role === "regulator") {
      sections.push({
        title: "Regulation",
        items: [
          { title: "Regulator Panel", href: "/regulator", icon: Award },
        ],
      })
    }

    return sections
  }

  const sections = getSections()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Logo */}
      <div className="px-4 py-5 border-b">
        <Link href="/" className="flex items-center gap-2" onClick={onItemClick}>
          <img src="/icon.svg" alt="" className="w-8 h-8" />
          <span className="font-semibold text-sm">Rwanda UAS Community</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {sections.map((section, sIndex) => (
          <div key={sIndex}>
            {section.title && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!user && (
        <div className="px-3 py-4 border-t">
          <Link
            href="/login"
            onClick={onItemClick}
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  )
}
