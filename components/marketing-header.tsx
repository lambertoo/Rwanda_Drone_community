"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { X, ChevronDown,
  MessageSquare, Camera, Calendar, Trophy, Users, BookOpen,
  Map, CloudSun, AlertTriangle, GraduationCap,
  Briefcase, Wrench, ShoppingBag,
} from "lucide-react"

/* ── Shared nav data (mirrors app-sidebar sections) ─────────────────── */
const NAV = [
  {
    label: "Community",
    items: [
      { label: "Forum",               desc: "Discussions & knowledge sharing.",     href: "/forum",    icon: MessageSquare },
      { label: "Projects",            desc: "Explore drone projects.",               href: "/projects", icon: Camera },
      { label: "Events",              desc: "Workshops, meetups & conferences.",     href: "/events",   icon: Calendar },
      { label: "Drone Clubs",         desc: "Find and join clubs near you.",         href: "/clubs",    icon: Trophy },
      { label: "Community Directory", desc: "Browse pilots & organisations.",        href: "/pilots",   icon: Users },
      { label: "Resources",           desc: "Guides, reports, and reference docs.",  href: "/resources",icon: BookOpen },
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
      { label: "Service Directory", desc: "Find drone professionals & operators.", href: "/services",      icon: Wrench },
      { label: "Marketplace",       desc: "Buy, sell and trade drone equipment.",  href: "/marketplace",   icon: ShoppingBag },
    ],
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    items: [
      { label: "Browse Opportunities", desc: "Jobs, grants & programmes.",        href: "/opportunities",  icon: Briefcase },
      { label: "Mentorship",           desc: "Connect with industry mentors.",    href: "/mentorship",     icon: Users },
    ],
  },
]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const { user }   = useAuth()
  const pathname   = usePathname()

  const isActive = (href?: string) =>
    !!href && (pathname === href || (href !== "/" && pathname.startsWith(href)))

  return (
    <header className="mk-site-header">
      <div className="mk-header-inner">
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
                  {section.label}
                  <ChevronDown size={12} style={{ opacity: 0.6 }} />
                </Link>
              ) : (
                <button
                  className="mk-nav__link"
                  style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === section.label}
                >
                  {section.label}
                  <ChevronDown size={12} style={{ opacity: 0.6 }} />
                </button>
              )}

              {openDropdown === section.label && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                  background: "#fff", borderRadius: "16px", padding: "10px",
                  minWidth: "280px", zIndex: 60,
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

        {/* Auth actions */}
        <div className="mk-header-actions">
          {user ? (
            <Link href="/profile" className="mk-btn--join">My Dashboard</Link>
          ) : (
            <>
              <Link href="/login"    className="mk-btn--signin">Sign In</Link>
              <Link href="/register" className="mk-btn--join">Join Free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="mk-nav-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
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
              {user ? (
                <Link href="/profile" className="mk-btn--join" style={{ textAlign: "center" }} onClick={() => setMobileOpen(false)}>
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", display: "block", padding: "11px", borderRadius: 8, border: "1px solid rgba(0,38,116,0.15)", color: "#002674", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                    Sign In
                  </Link>
                  <Link href="/register" className="mk-btn--join" style={{ textAlign: "center" }} onClick={() => setMobileOpen(false)}>
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
