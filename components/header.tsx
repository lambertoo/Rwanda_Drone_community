"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, Settings, Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { NotificationBell } from "@/components/notification-bell"
import { useEffect } from "react"

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const router = useRouter()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingCount, setPendingCount] = useState(0)
  const { user, logout, loading } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileSearchOpen(false)
    }
  }

  useEffect(() => {
    if (user?.role !== 'admin') return
    const fetchPending = async () => {
      try {
        const r = await fetch('/api/admin/pending', { credentials: 'include' })
        if (r.ok) {
          const d = await r.json()
          setPendingCount(Object.values(d.counts).reduce((s: number, c: number) => s + c, 0))
        }
      } catch {}
    }
    fetchPending()
    const id = setInterval(fetchPending, 30000)
    return () => clearInterval(id)
  }, [user?.role])

  const handleLogout = async () => { await logout(); router.push("/login") }

  const getRoleColor = (role: string) => {
    const map: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      hobbyist: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      pilot: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      regulator: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      student: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    }
    return map[role] || "bg-muted text-foreground"
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center px-4 gap-3">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={onMobileMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">RDC</span>
            </div>
            <span className="hidden md:block font-bold text-sm text-gradient">Rwanda UAS Community</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center max-w-sm mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/60 border-border/50 rounded-full focus:border-primary/50 transition-all"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile search toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>

            <LanguageSwitcher />

            <div className="hidden sm:flex">
              <NotificationBell />
            </div>

            <div className="ml-1 pl-2 border-l border-border/60">
              {loading ? (
                <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
              ) : user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                        <AvatarFallback className="bg-brand-gradient text-white text-xs font-bold">
                          {user.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 ring-2 ring-background">
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 z-[100]" align="end" sideOffset={8} forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{user.fullName}</p>
                          {user.isVerified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.role && (
                          <Badge className={`text-xs w-fit ${getRoleColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/account" className="flex items-center"><User className="mr-2 h-4 w-4" />My Account</Link></DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/approvals" className="flex items-center justify-between">
                            <span className="flex items-center"><Shield className="mr-2 h-4 w-4" />Pending Approvals</span>
                            {pendingCount > 0 && (
                              <span className="min-w-[20px] h-5 bg-orange-500 rounded-full text-[11px] font-semibold text-white flex items-center justify-center px-1.5">
                                {pendingCount > 99 ? '99+' : pendingCount}
                              </span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin" className="flex items-center"><Shield className="mr-2 h-4 w-4" />Admin Settings</Link></DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="hidden sm:flex">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="hidden sm:flex">Join Free</Button>
                  </Link>
                  <Link href="/login" className="sm:hidden">
                    <Button variant="ghost" size="icon"><User className="h-4 w-4" /></Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm lg:hidden flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 h-11 rounded-full"
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
