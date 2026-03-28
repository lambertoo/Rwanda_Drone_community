"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  X, ChevronDown, Menu, Search,
  MessageSquare, Camera, Calendar, Trophy, Users, BookOpen,
  Map, CloudSun, AlertTriangle, Plane, BookMarked, Award,
  Briefcase, Wrench, ShoppingBag,
  Bell, User, Settings, Shield, LogOut, ClipboardList,
  Compass, GraduationCap, Newspaper,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notification-bell"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

/* ── Nav data ────────────────────────────────────────────── */
interface NavItem {
  label: string
  desc: string
  href: string
  icon: any
  authOnly?: boolean
}

interface NavSection {
  label: string
  href?: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    label: "Community",
    href: "/community",
    items: [
      { label: "Forum", desc: "Discussions & knowledge sharing.", href: "/community?tab=forum", icon: MessageSquare },
      { label: "Projects", desc: "Explore drone projects.", href: "/community?tab=projects", icon: Camera },
      { label: "Events", desc: "Workshops, meetups & conferences.", href: "/community?tab=events", icon: Calendar },
      { label: "News", desc: "Latest drone industry news.", href: "/community?tab=news", icon: Newspaper },
      { label: "Opportunities", desc: "Jobs, grants & programmes.", href: "/community?tab=opportunities", icon: Briefcase },
      { label: "Directory", desc: "Find pilots, clubs & providers.", href: "/community?tab=directory", icon: Users },
    ],
  },
  {
    label: "Know-How",
    href: "/know-how",
    items: [
      { label: "Courses", desc: "Training and certification pathways.", href: "/know-how?tab=courses", icon: GraduationCap },
      { label: "My Courses", desc: "Continue your learning.", href: "/know-how?tab=my-courses", icon: BookOpen, authOnly: true },
      { label: "Mentorship", desc: "Connect with industry mentors.", href: "/know-how?tab=mentorship", icon: Users },
      { label: "Resources", desc: "Guides, reports & reference docs.", href: "/know-how?tab=resources", icon: BookOpen },
    ],
  },
  {
    label: "Drone Tools",
    href: "/drone-tools",
    items: [
      { label: "My Fleet", desc: "Manage your drone equipment.", href: "/drone-tools?tab=fleet", icon: Plane, authOnly: true },
      { label: "Flight Logbook", desc: "Record and track your flights.", href: "/drone-tools?tab=logbook", icon: BookMarked, authOnly: true },
      { label: "Airspace Map", desc: "Rwanda airspace zones & restrictions.", href: "/drone-tools?tab=airspace", icon: Map },
      { label: "Weather", desc: "Live METARs and flight-safety weather.", href: "/drone-tools?tab=weather", icon: CloudSun },
      { label: "Safety Center", desc: "Incident reports & safety guidelines.", href: "/drone-tools?tab=safety", icon: AlertTriangle },
      { label: "Compliance", desc: "Permits and regulatory compliance.", href: "/drone-tools?tab=compliance", icon: Award, authOnly: true },
    ],
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    items: [],
  },
]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleDropdownEnter = (label: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setOpenDropdown(label)
    setProfileOpen(false)
  }
  const handleDropdownLeave = () => {
    leaveTimer.current = setTimeout(() => setOpenDropdown(null), 150)
  }

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

  // Filter nav items by auth
  const getVisibleItems = (items: NavItem[]) =>
    items.filter(item => !item.authOnly || user)

  return (
    <header className="mk-site-header" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="mk-header-inner">
        {/* Logo */}
        <Link href="/" className="mk-logo">
          <div className="mk-logo__mark">RDC</div>
          <span className="mk-logo__name">Rwanda Drone Community</span>
        </Link>

        {/* Desktop nav */}
        <nav className="mk-nav" aria-label="Main navigation">
          {NAV.map(section => {
            const visibleItems = getVisibleItems(section.items)
            // Direct link (no dropdown) for items with no sub-items
            if (visibleItems.length === 0) {
              return (
                <Link
                  key={section.label}
                  href={section.href || "/"}
                  className={`mk-nav__link${isActive(section.href) ? " is-active" : ""}`}
                >
                  {section.label}
                </Link>
              )
            }

            return (
              <div
                key={section.label}
                style={{ position: "relative" }}
                onMouseEnter={() => handleDropdownEnter(section.label)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href={section.href || "/"}
                  className={`mk-nav__link${isActive(section.href) ? " is-active" : ""}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  {section.label} <ChevronDown size={12} style={{ opacity: 0.5 }} />
                </Link>

                {openDropdown === section.label && (
                  <div style={{
                    position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                    paddingTop: 8, zIndex: 60,
                  }}>
                    <div style={{
                      background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
                      borderRadius: 16, padding: 8,
                      boxShadow: "0 12px 40px rgba(0,11,79,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,38,116,0.08)",
                      display: "grid",
                      gridTemplateColumns: visibleItems.length > 3 ? "1fr 1fr" : "1fr",
                      gap: 2,
                      minWidth: visibleItems.length > 3 ? 480 : 280,
                    }}>
                      {visibleItems.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="hover:bg-[#f4f6fb] transition-colors"
                          style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none" }}
                        >
                          <item.icon size={15} color="#0058dd" style={{ marginTop: 3, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#002674", lineHeight: 1.2 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 1.3 }}>{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
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
                  borderRadius: 999, border: "1px solid rgba(0,38,116,0.12)",
                  background: "rgba(0,38,116,0.04)", fontSize: 13, outline: "none",
                }}
                className="focus:border-[#0058dd]/40 transition-colors"
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
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <NotificationBell />

              {/* Avatar with pending badge + dropdown */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Open profile"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%", position: "relative" }}
                >
                  <Avatar style={{ width: 32, height: 32, outline: "2px solid rgba(0,88,221,0.2)", outlineOffset: 1 }}>
                    <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                    <AvatarFallback style={{ background: "linear-gradient(135deg,#002674,#0058dd)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
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
                      boxShadow: "0 12px 40px rgba(0,11,79,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,38,116,0.08)",
                    }}>
                      {/* User info */}
                      <div style={{ padding: "10px 10px 12px", borderBottom: "1px solid #f1f3f5", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar style={{ width: 36, height: 36, flexShrink: 0, outline: "2px solid rgba(0,88,221,0.12)", outlineOffset: 1 }}>
                          <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                          <AvatarFallback style={{ background: "linear-gradient(135deg,#002674,#0058dd)", color: "#fff", fontSize: 12, fontWeight: 700 }}>{initials}</AvatarFallback>
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

                      {/* Menu items */}
                      {[
                        { href: "/account?tab=profile", icon: User, label: "Profile" },
                        { href: "/account?tab=notifications", icon: Bell, label: "Notifications" },
                        { href: "/account?tab=forms", icon: ClipboardList, label: "My Forms" },
                        ...(user?.role === "admin" ? [
                          { href: "/admin", icon: Settings, label: "Settings", badge: pendingCount },
                        ] : []),
                        ...(user?.role === "regulator" ? [{ href: "/regulator", icon: Award, label: "Regulator Panel" }] : []),
                      ].map(({ href, icon: Icon, label, badge }: any) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setProfileOpen(false)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "#374151", fontSize: 13, fontWeight: 500 }}
                          className="hover:bg-[#f4f6fb] transition-colors"
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Icon size={15} color="#0058dd" />
                            {label}
                          </span>
                          {badge > 0 && (
                            <span style={{
                              minWidth: 20, height: 20,
                              background: "#f97316", borderRadius: 999,
                              fontSize: 10, fontWeight: 700, color: "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              padding: "0 5px",
                            }}>
                              {badge > 99 ? "99+" : badge}
                            </span>
                          )}
                        </Link>
                      ))}

                      {/* Divider + Logout */}
                      <div style={{ borderTop: "1px solid #f1f3f5", marginTop: 4, paddingTop: 4 }}>
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout() }}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 600 }}
                          className="hover:bg-[#fef2f2] transition-colors"
                        >
                          <LogOut size={15} />
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
                <div className="mk-logo__mark">RDC</div>
                <span className="mk-logo__name">Rwanda Drone</span>
              </Link>
              <button className="mk-mobile-drawer__close" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {NAV.map(section => {
              const visibleItems = getVisibleItems(section.items)
              if (visibleItems.length === 0) {
                return (
                  <Link
                    key={section.label}
                    href={section.href || "/"}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block", padding: "11px 16px",
                      fontSize: 14, fontWeight: 600, color: "#0f172a", textDecoration: "none",
                      borderBottom: "1px solid rgba(0,38,116,0.06)",
                    }}
                  >
                    {section.label}
                  </Link>
                )
              }
              return (
                <div key={section.label}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === section.label ? null : section.label)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "11px 16px", background: "none", border: "none", cursor: "pointer",
                      fontSize: 14, fontWeight: 600, color: "#0f172a", textAlign: "left",
                      borderBottom: "1px solid rgba(0,38,116,0.06)",
                    }}
                  >
                    {section.label}
                    <ChevronDown size={14} style={{ opacity: 0.5, transform: mobileExpanded === section.label ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                  {mobileExpanded === section.label && visibleItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 16px 9px 32px",
                        fontSize: 13, color: "#374151", textDecoration: "none",
                        borderBottom: "1px solid rgba(0,38,116,0.04)",
                      }}
                    >
                      <item.icon size={14} color="#0058dd" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )
            })}

            {user ? (
              <div style={{ padding: "12px 16px" }}>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  style={{ display: "block", padding: 11, borderRadius: 8, border: "1px solid rgba(0,38,116,0.15)", color: "#002674", fontWeight: 600, fontSize: 14, textDecoration: "none", textAlign: "center", marginBottom: 8 }}
                >
                  My Account
                </Link>
              </div>
            ) : (
              <div className="mk-mobile-drawer__actions">
                <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", display: "block", padding: 11, borderRadius: 8, border: "1px solid rgba(0,38,116,0.15)", color: "#002674", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: "1px solid rgba(0,38,116,0.08)" }}>
            <form onSubmit={handleSearch} style={{ flex: 1 }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="search"
                  placeholder="Search..."
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: "100%", height: 44, paddingLeft: 40, borderRadius: 999, border: "1px solid rgba(0,38,116,0.15)", fontSize: 15, outline: "none" }}
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
