"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, MessageSquare, Users, Calendar, BookOpen, Camera, Briefcase, Settings, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Forum",
    url: "/forum",
    icon: MessageSquare,
  },
  {
    title: "Services",
    url: "/services",
    icon: Users,
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Resources",
    url: "/resources",
    icon: BookOpen,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Camera,
  },
  {
    title: "Jobs",
    url: "/jobs",
    icon: Briefcase,
  },
]

const adminItems = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg"></div>
          <div>
            <h2 className="font-bold text-lg">Rwanda Drones</h2>
            <p className="text-xs text-muted-foreground">Community Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <Button className="w-full" asChild>
            <Link href="/register">Join Community</Link>
          </Button>
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
