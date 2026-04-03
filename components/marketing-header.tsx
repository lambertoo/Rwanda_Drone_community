"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  X, Menu, Search,
  MessageSquare, Award,
  User, Settings, LogOut, ClipboardList,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notification-bell"
import { MessageBadge } from "@/components/messages/message-badge"
import { Badge } from "@/components/ui/badge"

/* ── Nav data ────────────────────────────────────────────── */
const NAV = [
  { label: "Community", href: "/community" },
  { label: "Know-How", href: "/know-how" },
  { label: "Drone Tools", href: "/drone-tools" },
  { label: "Marketplace", href: "/marketplace" },
]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href?: string) =>
    !!href && (pathname === href || (href !== "/" && pathname.startsWith(href.split("?")[0])))

  useEffect(() => {
    if (user?.role !== "admin") return
    const fetchPending = () =>
      fetch("/api/admin/pending", { credentials: "include" })
        .then(r => r.json())
        .then(d => setPendingCount(Object.values(d.counts as Record<string, number>).reduce((s, c) => s + c, 0)))
        .catch(() => {})
    fetchPending()
    const id = setInterval(fetchPending, 30000)
    return () => clearInterval(id)
  }, [user?.role])

  const handleLogout = async () => { await logout(); router.push("/login") }
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  const initials = user
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : ""

  return (
    <header className="mk-site-header" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="mk-header-inner">
        {/* Logo */}
        <Link href="/" className="mk-logo">
          <img src="/logo.svg" alt="Rwanda UAS Community" style={{ height: '36px', width: 'auto' }} />
        </Link>

        {/* Desktop nav */}
        <nav className="mk-nav" aria-label="Main navigation">
          {NAV.map(section => (
            <Link
              key={section.label}
              href={section.href}
              className={`mk-nav__link${isActive(section.href) ? " is-active" : ""}`}
            >
              {section.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="mk-header-actions">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={14} style={{ color: "#94a3b8" }} />
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: 180, height: 34, paddingLeft: 32, paddingRight: 12,
                  borderRadius: 999, border: "1px solid rgba(0,51,102,0.12)",
                  background: "rgba(0,51,102,0.04)", fontSize: 13, outline: "none",
                }}
                className="focus:border-[#0066B3]/40 transition-colors"
              />
            </div>
          </form>

          {/* Mobile search */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#64748b", display: "flex" }}
          >
            <Search size={18} />
          </button>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MessageBadge />
              <NotificationBell />

              {/* Avatar with pending badge + dropdown */}
              <div
                style={{ position: "relative", marginLeft: 2 }}
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Open profile"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%", position: "relative" }}
                >
                  <Avatar style={{ width: 32, height: 32, outline: "2px solid rgba(0,102,179,0.2)", outlineOffset: 1 }}>
                    <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                    <AvatarFallback style={{ background: "linear-gradient(135deg,#003366,#0066B3)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {pendingCount > 0 && (
                    <span style={{
                      position: "absolute", top: -4, right: -4,
                      minWidth: 18, height: 18,
                      background: "#f97316", borderRadius: 999,
                      fontSize: 10, fontWeight: 700, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 4px",
                      border: "2px solid #fff",
                    }}>
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </button>

                {/* Dropdown overlay — same style as Community/Know-How menus */}
                {profileOpen && (
                  <div style={{
                    position: "absolute", top: "100%", right: 0,
                    paddingTop: 8, zIndex: 60,
                  }}>
                    <div style={{
                      background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)",
                      borderRadius: 16, padding: 8, width: 260,
                      boxShadow: "0 12px 40px rgba(0,34,68,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,51,102,0.08)",
                    }}>
                      {/* User info */}
                      <div style={{ padding: "10px 10px 12px", borderBottom: "1px solid #f1f3f5", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar style={{ width: 36, height: 36, flexShrink: 0, outline: "2px solid rgba(0,102,179,0.12)", outlineOffset: 1 }}>
                          <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                          <AvatarFallback style={{ background: "linear-gradient(135deg,#003366,#0066B3)", color: "#fff", fontSize: 12, fontWeight: 700 }}>{initials}</AvatarFallback>
                        </Avatar>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.fullName}</p>
                          <p style={{ fontSize: 11, color: "#6b7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                        </div>
                        {user.role && (
                          <Badge variant="secondary" style={{ fontSize: 10, flexShrink: 0, padding: "1px 6px" }}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        )}
                      </div>

                      {/* Main menu */}
                      {[
                        { href: "/account?tab=profile", icon: User, label: "My Profile", desc: "Personal details & account settings" },
                        { href: "/messages", icon: MessageSquare, label: "Messaging", desc: "Conversations & direct messages" },
                        { href: "/account?tab=content", icon: ClipboardList, label: "My Content", desc: "Posts, projects & events" },
                      ].map(({ href, icon: Icon, label, desc }: any) => (
                        <Link key={href} href={href} onClick={() => setProfileOpen(false)}
                          style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none" }}
                          className="hover:bg-[#f4f6fb] transition-colors"
                        >
                          <Icon size={15} color="#0066B3" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: "#003366", margin: 0, lineHeight: 1.2 }}>{label}</p>
                            <p style={{ fontSize: 11, color: "#6b7280", margin: 0, marginTop: 1 }}>{desc}</p>
                          </div>
                        </Link>
                      ))}

                      {/* Admin / Regulator */}
                      {(user?.role === "admin" || user?.role === "regulator") && (
                        <div style={{ borderTop: "1px solid #f1f3f5", marginTop: 4, paddingTop: 4 }}>
                          {user.role === "admin" && (
                            <Link href="/admin" onClick={() => setProfileOpen(false)}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none" }}
                              className="hover:bg-[#f4f6fb] transition-colors"
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Settings size={15} color="#0066B3" />
                                <span style={{ fontWeight: 600, fontSize: 13, color: "#003366" }}>Settings</span>
                              </span>
                              {pendingCount > 0 && (
                                <span style={{ minWidth: 20, height: 20, background: "#f97316", borderRadius: 999, fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                                  {pendingCount > 99 ? "99+" : pendingCount}
                                </span>
                              )}
                            </Link>
                          )}
                          {user.role === "regulator" && (
                            <Link href="/regulator" onClick={() => setProfileOpen(false)}
                              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none" }}
                              className="hover:bg-[#f4f6fb] transition-colors"
                            >
                              <Award size={15} color="#0066B3" />
                              <span style={{ fontWeight: 600, fontSize: 13, color: "#003366" }}>Regulator Panel</span>
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Logout */}
                      <div style={{ borderTop: "1px solid #f1f3f5", marginTop: 4, paddingTop: 4 }}>
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout() }}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 600 }}
                          className="hover:bg-[#fef2f2] transition-colors"
                        >
                          <LogOut size={14} />
                          Log out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="mk-btn--signin">Sign In</Link>
              <Link href="/register" className="mk-btn--join">Join Free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mk-nav-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile menu drawer ──────────────────────────────── */}
      {mobileOpen && (
        <>
          <div className="mk-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="mk-mobile-drawer">
            <div className="mk-mobile-drawer__head">
              <Link href="/" className="mk-logo" onClick={() => setMobileOpen(false)}>
                <img src="/logo.svg" alt="Rwanda UAS Community" style={{ height: '32px', width: 'auto' }} />
              </Link>
              <button className="mk-mobile-drawer__close" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {NAV.map(section => (
              <Link
                key={section.label}
                href={section.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block", padding: "11px 16px",
                  fontSize: 14, fontWeight: 600, color: "#0f172a", textDecoration: "none",
                  borderBottom: "1px solid rgba(0,51,102,0.06)",
                }}
              >
                {section.label}
              </Link>
            ))}

            {user ? (
              <div style={{ padding: "12px 16px" }}>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  style={{ display: "block", padding: 11, borderRadius: 8, border: "1px solid rgba(0,51,102,0.15)", color: "#003366", fontWeight: 600, fontSize: 14, textDecoration: "none", textAlign: "center", marginBottom: 8 }}
                >
                  My Account
                </Link>
              </div>
            ) : (
              <div className="mk-mobile-drawer__actions">
                <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", display: "block", padding: 11, borderRadius: 8, border: "1px solid rgba(0,51,102,0.15)", color: "#003366", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                  Sign In
                </Link>
                <Link href="/register" className="mk-btn--join" style={{ textAlign: "center" }} onClick={() => setMobileOpen(false)}>
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Mobile search overlay ──────────────────────────── */}
      {mobileSearchOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: "1px solid rgba(0,51,102,0.08)" }}>
            <form onSubmit={handleSearch} style={{ flex: 1 }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="search"
                  placeholder="Search..."
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: "100%", height: 44, paddingLeft: 40, borderRadius: 999, border: "1px solid rgba(0,51,102,0.15)", fontSize: 15, outline: "none" }}
                />
              </div>
            </form>
            <button onClick={() => setMobileSearchOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#64748b", display: "flex" }}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
