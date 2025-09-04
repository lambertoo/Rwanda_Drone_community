"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Briefcase, 
  Users, 
  FileText, 
  Shield,
  BarChart,
  BookOpen,
  Camera,
  Wrench,
  GraduationCap
} from "lucide-react"
import { AuthUser, UserRole } from "@prisma/client"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onItemClick?: () => void
}

export function AppSidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const getRoleBasedNavItems = () => {
    const baseItems = [
      {
        title: "Home",
        href: "/",
        icon: Home,
      },
      {
        title: "Forum",
        href: "/forum",
        icon: MessageSquare,
      },
      {
        title: "Projects",
        href: "/projects",
        icon: Camera,
      },
      {
        title: "Events",
        href: "/events",
        icon: Calendar,
      },
      {
        title: "Services",
        href: "/services",
        icon: Wrench,
      },
      {
        title: "Opportunities",
        href: "/opportunities",
        icon: Briefcase,
      },
      {
        title: "My Opportunities",
        href: "/opportunities/my-opportunities",
        icon: Briefcase,
      },
      {
        title: "Resources",
        href: "/resources",
        icon: BookOpen,
      },
      {
        title: "Profile",
        href: "/profile",
        icon: Users,
      },
    ]

    // Add role-specific items
    const roleItems = []

    // Admin items
    if (user?.role === "admin") {
      roleItems.push(
        {
          title: "Admin Dashboard",
          href: "/admin",
          icon: Shield,
        },
        {
          title: "Analytics",
          href: "/analytics",
          icon: BarChart,
        },
        {
          title: "User Management",
          href: "/admin/users",
          icon: Users,
        }
      )
    }

    // Regulator items
    if (user?.role === "regulator") {
      roleItems.push(
        {
          title: "Regulator Panel",
          href: "/regulator",
          icon: Shield,
        },
        {
          title: "Content Review",
          href: "/regulator/review",
          icon: FileText,
        }
      )
    }

    // Pilot items
    if (user?.role === "pilot") {
      roleItems.push(
        {
          title: "My Certifications",
          href: "/pilot/certifications",
          icon: GraduationCap,
        },
        {
          title: "Tutorials",
          href: "/pilot/tutorials",
          icon: BookOpen,
        }
      )
    }

    // Service Provider items
    if (user?.role === "service_provider") {
      roleItems.push(
        {
          title: "My Services",
          href: "/provider/services",
          icon: Wrench,
        },
        {
          title: "Portfolio",
          href: "/provider/portfolio",
          icon: Camera,
        }
      )
    }

    // Student items
    if (user?.role === "student") {
      roleItems.push(
        {
          title: "Learning Resources",
          href: "/student/resources",
          icon: BookOpen,
        },
        {
          title: "Internships",
          href: "/student/internships",
          icon: GraduationCap,
        }
      )
    }

    return [...baseItems, ...roleItems]
  }

  const navItems = getRoleBasedNavItems()

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Navigation */}
      <div className="px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={handleItemClick}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start h-11 lg:h-9"
                size="sm"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span className="text-sm lg:text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
