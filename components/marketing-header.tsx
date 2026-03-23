"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  X, ChevronDown, Menu,
  MessageSquare, Camera, Calendar, Trophy, Users, BookOpen,
  Map, CloudSun, AlertTriangle, GraduationCap,
  Briefcase, Wrench, ShoppingBag,
  Bell, User, Settings, Shield, LogOut, Search,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notification-bell"
import { Badge } from "@/components/ui/badge"

/* ── Shared nav data (mirrors app-sidebar sections) ─────────────────── */
const NAV = [
  {
    label: "Community",
    items: [
      { label: "Forum",               desc: "Discussions & knowledge sharing.",    href: "/forum",    icon: MessageSquare },
      { label: "Projects",            desc: "Explore drone projects.",              href: "/projects", icon: Camera },
      { label: "Events",              desc: "Workshops, meetups & conferences.",    href: "/events",   icon: Calendar },
      { label: "Drone Clubs",         desc: "Find and join clubs near you.",        href: "/clubs",    icon: Trophy },
      { label: "Community Directory", desc: "Browse pilots & organisations.",       href: "/pilots",   icon: Users },
      { label: "Resources",           desc: "Guides, reports, and reference docs.", href: "/resources",icon: BookOpen },
    ],
  },
  {
    label: "Drone Tools",
    items: [
      { label: "Airspace Map",     desc: "Rwanda airspace zones & restrictions.", href: "/airspace", icon: Map },
      { label: "Weather Briefing", desc: "Live METARs and flight-safety weather.", href: "/weather",  icon: CloudSun },
      { label: "Safety Center",    desc: "Incident reports & safety guidelines.",  href: "/safety",   icon: AlertTriangle },
      { label: "Courses",          desc: "Training and certification pathways.",   href: "/learn",    icon: GraduationCap },
    ],
  },
  {
    label: "Services",
    href: "/services",
    items: [
      { label: "Service Directory", desc: "Find drone professionals & operators.", href: "/services",    icon: Wrench },
      { label: "Marketplace",       desc: "Buy, sell and trade drone equipment.",  href: "/marketplace", icon: ShoppingBag },
    ],
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    items: [
      { label: "Browse Opportunities", desc: "Jobs, grants & programmes.",      href: "/opportunities", icon: Briefcase },
      { label: "Mentorship",           desc: "Connect with industry mentors.",   href: "/mentorship",    icon: Users },
    ],
  },
]

interface MarketingHeaderProps {
  onSidebarToggle?: () => void
}

export function MarketingHeader({ onSidebarToggle }: MarketingHeaderProps) {
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [openDropdown, setOpenDropdown]     = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [pendingCount, setPendingCount]     = useState(0)
  const [profileOpen, setProfileOpen]       = useState(false)

  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()

  const isActive = (href?: string) =>
    !!href && (pathname === href || (href !== "/" && pathname.startsWith(href)))

  // Admin pending count
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

  const initials = user
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : ""

  return (
    <header className="mk-site-header">
      <div className="mk-header-inner">
        {/* Sidebar toggle — visible on all screen sizes when authenticated */}
        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            aria-label="Open navigation"
            style={{ background: "none", border: "1px solid rgba(0,38,116,0.12)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", padding: "6px 8px", color: "#002674", gap: 6 }}
          >
            <Menu size={17} />
            <span style={{ fontSize: 12, fontWeight: 600, display: "none" }} className="sm:inline">Menu</span>
          </button>
        )}

        {/* Logo */}
        <Link href="/" className="mk-logo">
          <div className="mk-logo__mark">RDC</div>
          <span className="mk-logo__name">Rwanda Drone Community</span>
        </Link>

        {/* Desktop nav */}
        <nav className="mk-nav" aria-label="Main navigation">
          {NAV.map(section => (
            <div
              key={section.label}
              style={{ position: "relative" }}
              onMouseEnter={() => setOpenDropdown(section.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {section.href ? (
                <Link
                  href={section.href}
                  className={`mk-nav__link${isActive(section.href) ? " is-active" : ""}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  {section.label} <ChevronDown size={12} style={{ opacity: 0.6 }} />
                </Link>
              ) : (
                <button
                  className="mk-nav__link"
                  style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === section.label}
                >
                  {section.label} <ChevronDown size={12} style={{ opacity: 0.6 }} />
                </button>
              )}

              {openDropdown === section.label && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                  background: "#fff", borderRadius: 16, padding: 10,
                  minWidth: 280, zIndex: 60,
                  boxShadow: "0 12px 40px rgba(0,11,79,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,38,116,0.08)",
                }}>
                  {section.items.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="hover:bg-[#f4f6fb] transition-colors"
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 10, textDecoration: "none" }}
                    >
                      <item.icon size={15} color="#0058dd" style={{ marginTop: 3, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#002674", lineHeight: 1.2 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Auth / user actions */}
        <div className="mk-header-actions">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Admin pending */}
              {user.role === "admin" && pendingCount > 0 && (
                <Link href="/admin/approvals" style={{ position: "relative", display: "flex" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#f97316", display: "flex" }}>
                    <Bell size={18} />
                    <span style={{ position: "absolute", top: 2, right: 2, minWidth: 14, height: 14, background: "#f97316", borderRadius: 999, fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  </button>
                </Link>
              )}

              {/* Notification bell */}
              <NotificationBell />

              {/* Avatar — opens right-side profile panel */}
              <button
                onClick={() => setProfileOpen(true)}
                aria-label="Open profile"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%" }}
              >
                <Avatar style={{ width: 32, height: 32, outline: "2px solid rgba(0,88,221,0.2)", outlineOffset: 1 }}>
                  <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                  <AvatarFallback style={{ background: "#002674", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>
          ) : (
            <>
              <Link href="/login"    className="mk-btn--signin">Sign In</Link>
              <Link href="/register" className="mk-btn--join">Join Free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — only for guest nav drawer (authenticated uses sidebar toggle above) */}
        {!onSidebarToggle && (
          <button
            className="mk-nav-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        )}
      </div>

      {/* ── Profile side panel (authenticated) ──────────────────────── */}
      {profileOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 60, backdropFilter: "blur(2px)" }}
            onClick={() => setProfileOpen(false)}
          />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 300, zIndex: 70,
            background: "#fff", boxShadow: "-4px 0 32px rgba(0,11,79,0.14)",
            display: "flex", flexDirection: "column",
            transform: "translateX(0)", transition: "transform 0.25s",
          }}>
            {/* Panel header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(0,38,116,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#002674" }}>My Account</span>
              <button onClick={() => setProfileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(0,38,116,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar style={{ width: 48, height: 48, flexShrink: 0, outline: "3px solid rgba(0,88,221,0.15)", outlineOffset: 2 }}>
                  <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName} />
                  <AvatarFallback style={{ background: "#002674", color: "#fff", fontSize: 16, fontWeight: 700 }}>{initials}</AvatarFallback>
                </Avatar>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.fullName}</p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                  {user.role && (
                    <Badge variant="secondary" style={{ fontSize: 11 }}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Nav links */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
              {[
                { href: "/profile",  icon: User,     label: "My Profile" },
                { href: "/settings", icon: Settings,  label: "Settings" },
                ...(user?.role === "admin" ? [{ href: "/admin", icon: Shield, label: "Admin Panel" }] : []),
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setProfileOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, textDecoration: "none", color: "#374151", fontSize: 14, fontWeight: 500, marginBottom: 2 }}
                  className="hover:bg-[#f4f6fb] transition-colors"
                >
                  <Icon size={16} color="#0058dd" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: "12px 12px 20px", borderTop: "1px solid rgba(0,38,116,0.06)" }}>
              <button
                onClick={() => { setProfileOpen(false); handleLogout() }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "#fff5f5", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, fontWeight: 600 }}
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Guest mobile drawer */}
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

            {NAV.map(section => (
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
                {mobileExpanded === section.label && section.items.map(item => (
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
            ))}

            <div className="mk-mobile-drawer__actions">
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", display: "block", padding: 11, borderRadius: 8, border: "1px solid rgba(0,38,116,0.15)", color: "#002674", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                Sign In
              </Link>
              <Link href="/register" className="mk-btn--join" style={{ textAlign: "center" }} onClick={() => setMobileOpen(false)}>
                Join Free
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
