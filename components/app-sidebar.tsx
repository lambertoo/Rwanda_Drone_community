import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Home, MessageSquare, Calendar, Users, BookOpen, Camera, Briefcase, Settings, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Main",
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Forum", url: "/forum", icon: MessageSquare },
      { title: "Services", url: "/services", icon: Users },
      { title: "Events", url: "/events", icon: Calendar },
    ],
  },
  {
    title: "Community",
    items: [
      { title: "Resources", url: "/resources", icon: BookOpen },
      { title: "Projects", url: "/projects", icon: Camera },
      { title: "Jobs", url: "/jobs", icon: Briefcase },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Profile", url: "/profile", icon: User },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
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
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <Link href="/login">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="w-full">
              Join Community
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
