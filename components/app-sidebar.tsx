"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  Home, MessageSquare, Calendar, Briefcase, Users, FileText, Shield,
  BookOpen, Camera, Wrench, GraduationCap, ClipboardList, Settings,
  Map, Plane, BookMarked, AlertTriangle, ShoppingBag, Newspaper,
  Bell, Star, UserCheck, Radio, Award, CloudSun, Search, Image, BarChart3, Code2,
  BookMarked as LearnIcon, Trophy, Rss, type LucideIcon,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onItemClick?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

export function AppSidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetch("/api/notifications", { credentials: "include" })
        .then(r => r.json())
        .then(d => { if (d.unreadCount) setUnreadCount(d.unreadCount) })
        .catch(() => {})
    }
  }, [user])

  const getSections = (): NavSection[] => {
    const sections: NavSection[] = []

    const mainItems: NavItem[] = [{ title: "Home", href: "/", icon: Home }]
    if (user) {
      mainItems.push({
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
        badge: unreadCount > 0 ? String(unreadCount) : undefined,
      })
    }
    sections.push({ items: mainItems })

    sections.push({
      title: "Community",
      items: [
        { title: "Forum",               href: "/forum",    icon: MessageSquare },
        { title: "Projects",            href: "/projects", icon: Camera },
        { title: "Events",              href: "/events",   icon: Calendar },
        { title: "Drone Clubs",         href: "/clubs",    icon: Trophy },
        { title: "Community Directory", href: "/pilots",   icon: Users },
        { title: "Resources",           href: "/resources",icon: BookOpen },
      ],
    })

    const droneItems: NavItem[] = [
      { title: "Airspace Map",    href: "/airspace", icon: Map },
      { title: "Weather Briefing",href: "/weather",  icon: CloudSun },
      { title: "Safety Center",   href: "/safety",   icon: AlertTriangle },
    ]
    if (user) {
      droneItems.unshift(
        { title: "My Fleet",     href: "/equipment", icon: Plane },
        { title: "Flight Logbook",href: "/logbook",  icon: BookMarked },
        { title: "Compliance",   href: "/compliance",icon: Award },
      )
    }
    sections.push({ title: "Drone Tools", items: droneItems })

    const learnItems: NavItem[] = [{ title: "Courses", href: "/learn", icon: LearnIcon }]
    if (user) {
      learnItems.push(
        { title: "My Courses",  href: "/learn/my-courses", icon: BookOpen },
        { title: "Mentorship",  href: "/mentorship",       icon: Users },
      )
    }
    sections.push({ title: "Learn", items: learnItems })

    const marketItems: NavItem[] = [
      { title: "Marketplace",  href: "/marketplace",  icon: ShoppingBag },
      { title: "Services",     href: "/services",     icon: Wrench },
      { title: "Opportunities",href: "/opportunities",icon: Briefcase },
    ]
    if (user) {
      marketItems.push({ title: "My Opportunities", href: "/opportunities/my-opportunities", icon: Briefcase })
    }
    sections.push({ title: "Marketplace & Work", items: marketItems })

    const discoverItems: NavItem[] = [
      { title: "Search",     href: "/search",     icon: Search },
      { title: "Gallery",    href: "/gallery",    icon: Image },
      { title: "News",       href: "/news",       icon: Newspaper },
      { title: "Statistics", href: "/stats",      icon: BarChart3 },
      { title: "Developers", href: "/developers", icon: Code2 },
    ]
    if (user) {
      discoverItems.splice(1, 0, { title: "Activity Feed", href: "/feed", icon: Rss })
    }
    sections.push({ title: "Discover", items: discoverItems })

    if (user) {
      sections.push({
        title: "Account",
        items: [
          { title: "My Profile", href: "/profile", icon: Users },
          { title: "Forms",      href: "/forms",   icon: ClipboardList },
          { title: "Settings",   href: "/settings",icon: Settings },
        ],
      })
    }

    if (user?.role === "admin") {
      sections.push({
        title: "Administration",
        items: [
          { title: "Admin Dashboard",  href: "/admin",                  icon: Shield },
          { title: "User Management",  href: "/admin/users",            icon: Users },
          { title: "Content Approvals",href: "/admin/approvals",        icon: UserCheck },
          { title: "News Management",  href: "/admin/news",             icon: Newspaper },
          { title: "Safety Reports",   href: "/admin/safety-reports",   icon: AlertTriangle },
          { title: "Feature Flags",    href: "/admin/feature-flags",    icon: Radio },
        ],
      })
    }

    if (user?.role === "regulator") {
      sections.push({
        title: "Regulator",
        items: [
          { title: "Regulator Dashboard",href: "/regulator",             icon: Shield },
          { title: "Content Review",     href: "/regulator/review",      icon: FileText },
          { title: "Compliance Overview",href: "/regulator/compliance",  icon: Award },
          { title: "Incident Reports",   href: "/regulator/incidents",   icon: AlertTriangle },
        ],
      })
    }

    if (user?.role === "service_provider") {
      sections.push({
        title: "Provider",
        items: [
          { title: "My Services",  href: "/provider/services",  icon: Wrench },
          { title: "Portfolio",    href: "/provider/portfolio", icon: Camera },
          { title: "My Reviews",   href: "/provider/reviews",   icon: Star },
          { title: "Bookings",     href: "/provider/bookings",  icon: Calendar },
        ],
      })
    }

    if (user?.role === "student") {
      sections.push({
        title: "Student",
        items: [
          { title: "Learning Resources", href: "/student/resources",   icon: BookOpen },
          { title: "Internships",        href: "/student/internships", icon: GraduationCap },
        ],
      })
    }

    return sections
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  return (
    <div className={cn("app-sidebar-shell", className)}>
      {/* User pill — shown when logged in */}
      {user && (
        <div style={{ padding: "4px 4px 10px" }}>
          <div className="sidebar-user-pill">
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{user.fullName}</span>
          </div>
        </div>
      )}

      {getSections().map((section, i) => (
        <div key={section.title ?? `s-${i}`} className="app-sidebar-section">
          {section.title && (
            <p className="app-sidebar-section-label">{section.title}</p>
          )}
          {section.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn("app-nav-item", isActive(item.href) && "is-active")}
            >
              <span className="app-nav-item__icon">
                <item.icon size={16} />
              </span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.title}
              </span>
              {item.badge && (
                <span className="app-nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
