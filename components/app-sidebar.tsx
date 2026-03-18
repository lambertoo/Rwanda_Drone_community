"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
  Home, MessageSquare, Calendar, Briefcase, Users, FileText, Shield,
  BookOpen, Camera, Wrench, GraduationCap, ClipboardList, Settings,
  Map, Plane, BookMarked, AlertTriangle, ShoppingBag, Newspaper,
  Bell, Star, UserCheck, Radio, Award, CloudSun, Search, Rss, Image, BarChart3, Code2,
  BookMarked as LearnIcon
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onItemClick?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: any
  badge?: string
  badgeVariant?: "default" | "destructive" | "secondary"
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
      fetch('/api/notifications', { credentials: 'include' })
        .then(r => r.json())
        .then(d => { if (d.unreadCount) setUnreadCount(d.unreadCount) })
        .catch(() => {})
    }
  }, [user])

  const getSections = (): NavSection[] => {
    const sections: NavSection[] = []

    // Main navigation (everyone)
    sections.push({
      title: 'Main',
      items: [
        { title: 'Home', href: '/', icon: Home },
        {
          title: 'Notifications',
          href: '/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? String(unreadCount) : undefined,
          badgeVariant: 'destructive'
        },
      ]
    })

    // Community section
    sections.push({
      title: 'Community',
      items: [
        { title: 'Forum', href: '/forum', icon: MessageSquare },
        { title: 'Projects', href: '/projects', icon: Camera },
        { title: 'Events', href: '/events', icon: Calendar },
        { title: 'Community Directory', href: '/pilots', icon: Users },
        { title: 'Resources', href: '/resources', icon: BookOpen },
      ]
    })

    // Drone Tools
    sections.push({
      title: 'Drone Tools',
      items: [
        { title: 'My Fleet', href: '/equipment', icon: Plane },
        { title: 'Flight Logbook', href: '/logbook', icon: BookMarked },
        { title: 'Compliance', href: '/compliance', icon: Award },
        { title: 'Airspace Map', href: '/airspace', icon: Map },
        { title: 'Weather Briefing', href: '/weather', icon: CloudSun },
        { title: 'Safety Center', href: '/safety', icon: AlertTriangle },
      ]
    })

    // Learn
    sections.push({
      title: 'Learn',
      items: [
        { title: 'Courses', href: '/learn', icon: LearnIcon },
        { title: 'My Courses', href: '/learn/my-courses', icon: BookOpen },
        { title: 'Mentorship', href: '/mentorship', icon: Users },
      ]
    })

    // Marketplace & Work
    sections.push({
      title: 'Marketplace & Work',
      items: [
        { title: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
        { title: 'Services', href: '/services', icon: Wrench },
        { title: 'Opportunities', href: '/opportunities', icon: Briefcase },
        { title: 'My Opportunities', href: '/opportunities/my-opportunities', icon: Briefcase },
      ]
    })

    // Discover
    sections.push({
      title: 'Discover',
      items: [
        { title: 'Search', href: '/search', icon: Search },
        { title: 'Activity Feed', href: '/feed', icon: Rss },
        { title: 'Gallery', href: '/gallery', icon: Image },
        { title: 'News', href: '/news', icon: Newspaper },
        { title: 'Statistics', href: '/stats', icon: BarChart3 },
        { title: 'Developers', href: '/developers', icon: Code2 },
      ]
    })

    // Account
    sections.push({
      title: 'Account',
      items: [
        { title: 'My Profile', href: '/profile', icon: Users },
        { title: 'Forms', href: '/forms', icon: ClipboardList },
        { title: 'Settings', href: '/settings', icon: Settings },
      ]
    })

    // Role-specific sections
    if (user?.role === 'admin') {
      sections.push({
        title: 'Administration',
        items: [
          { title: 'Admin Dashboard', href: '/admin', icon: Shield },
          { title: 'User Management', href: '/admin/users', icon: Users },
          { title: 'Content Approvals', href: '/admin/approvals', icon: UserCheck },
          { title: 'News Management', href: '/admin/news', icon: Newspaper },
          { title: 'Safety Reports', href: '/admin/safety-reports', icon: AlertTriangle },
          { title: 'Feature Flags', href: '/admin/feature-flags', icon: Radio },
        ]
      })
    }

    if (user?.role === 'regulator') {
      sections.push({
        title: 'Regulator',
        items: [
          { title: 'Regulator Dashboard', href: '/regulator', icon: Shield },
          { title: 'Content Review', href: '/regulator/review', icon: FileText },
          { title: 'Compliance Overview', href: '/regulator/compliance', icon: Award },
          { title: 'Incident Reports', href: '/regulator/incidents', icon: AlertTriangle },
        ]
      })
    }

    if (user?.role === 'service_provider') {
      sections.push({
        title: 'Provider',
        items: [
          { title: 'My Services', href: '/provider/services', icon: Wrench },
          { title: 'Portfolio', href: '/provider/portfolio', icon: Camera },
          { title: 'My Reviews', href: '/provider/reviews', icon: Star },
          { title: 'Bookings', href: '/provider/bookings', icon: Calendar },
        ]
      })
    }

    if (user?.role === 'student') {
      sections.push({
        title: 'Student',
        items: [
          { title: 'Learning Resources', href: '/student/resources', icon: BookOpen },
          { title: 'Internships', href: '/student/internships', icon: GraduationCap },
        ]
      })
    }

    return sections
  }

  const sections = getSections()

  return (
    <div className={cn("space-y-1 py-2", className)}>
      {sections.map((section) => (
        <div key={section.title || 'main'} className="px-3 py-1">
          {section.title && (
            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <Link key={item.href} href={item.href} onClick={onItemClick}>
                <Button
                  variant={
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start h-9 text-sm"
                  size="sm"
                >
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || 'default'}
                      className="ml-auto h-5 px-1.5 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
