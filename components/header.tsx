"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, Settings, Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatar: string
  role: string
  isVerified: boolean
  organization?: string
}

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const router = useRouter()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const { user, logout, loading } = useAuth()

  // Fetch pending count for admin users
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user?.role === 'admin') {
        try {
          const response = await fetch('/api/admin/pending', {
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            const totalPending = Object.values(data.counts).reduce((sum: number, count: number) => sum + count, 0)
            setPendingCount(totalPending)
          }
        } catch (error) {
          console.error('Error fetching pending count:', error)
        }
      }
    }

    fetchPendingCount()
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [user?.role])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "hobbyist":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "pilot":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "regulator":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "student":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "service-provider":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />
      case "hobbyist":
        return <User className="h-3 w-3" />
      case "pilot":
        return <User className="h-3 w-3" />
      case "regulator":
        return <Shield className="h-3 w-3" />
      case "student":
        return <User className="h-3 w-3" />
      case "service-provider":
        return <User className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle mobile menu</span>
          </Button>

          {/* Logo - Hidden on mobile, shown on larger screens */}
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 bg-blue-600 rounded"></div>
              <span className="hidden font-bold sm:inline-block">Rwanda Drone Community</span>
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="mr-4 flex md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-blue-600 rounded"></div>
              <span className="font-bold text-sm">RDC</span>
            </Link>
          </div>

          {/* Search Bar - Right aligned, more compact */}
          <div className="flex flex-1 items-center justify-end px-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                id="search"
                name="search"
                placeholder="Search..." 
                className="pl-10 w-full bg-muted/50 border-muted-foreground/20 focus:bg-background focus:border-primary/50 transition-all duration-200" 
              />
            </div>
          </div>

          {/* Right Corner Actions - Theme, Notifications, Profile */}
          <nav className="flex items-center space-x-1 ml-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Open search</span>
            </Button>

            {/* Theme Toggle - More accessible position */}
            <ThemeToggle />

            {/* Notifications or Pending Contents for Admin */}
            {user?.role === 'admin' ? (
              <Link href="/admin/approvals">
                <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                  <Bell className="h-4 w-4" />
                  {/* Pending content badge - dynamic count */}
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[12px] h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center text-[10px] px-1">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                  <span className="sr-only">Pending Contents ({pendingCount})</span>
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                <Bell className="h-4 w-4" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            )}

            {/* Profile Section - Better separated and positioned */}
            <div className="ml-2 pl-2 border-l border-border">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
                </div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-muted/50 transition-colors">
                      <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-2 ring-offset-background">
                        <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{user.fullName}</p>
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2">
                          {user.role && getRoleIcon(user.role)}
                          {user.role && (
                            <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          )}
                          {!user.role && (
                            <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                              No Role
                            </Badge>
                          )}
                        </div>
                        {user.organization && (
                          <p className="text-xs text-muted-foreground">{user.organization}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="hidden sm:flex">
                      Sign Up
                    </Button>
                  </Link>
                  {/* Mobile auth buttons */}
                  <div className="flex sm:hidden">
                    <Link href="/login">
                      <Button variant="ghost" size="icon">
                        <User className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Search Overlay - Enhanced design */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-10 pr-4 h-12 text-base bg-muted/50 border-muted-foreground/20 focus:bg-background focus:border-primary/50"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSearchOpen(false)}
              className="ml-2 hover:bg-muted/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4 bg-muted/20">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Search for events, projects, services, and more...
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-xs">Projects</Badge>
                <Badge variant="outline" className="text-xs">Events</Badge>
                <Badge variant="outline" className="text-xs">Forum</Badge>
                <Badge variant="outline" className="text-xs">Resources</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
