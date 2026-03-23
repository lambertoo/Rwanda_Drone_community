"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { X, ChevronDown, MessageSquare, Camera, Calendar, Trophy } from "lucide-react"

const communityLinks = [
  { key: "forum",    label: "Forum",        desc: "Discussions and knowledge sharing.",       href: "/forum",    icon: MessageSquare },
  { key: "projects", label: "Projects",     desc: "Explore drone projects and innovations.",  href: "/projects", icon: Camera },
  { key: "events",   label: "Events",       desc: "Workshops, meetups, and conferences.",     href: "/events",   icon: Calendar },
  { key: "clubs",    label: "Drone Clubs",  desc: "Find and join drone clubs near you.",      href: "/clubs",    icon: Trophy },
]

const mainNavLinks = [
  { label: "Opportunities", href: "/opportunities" },
  { label: "Resources",     href: "/resources" },
  { label: "Services",      href: "/services" },
]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)
  const { user } = useAuth()
  const pathname  = usePathname()

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href))

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
          {mainNavLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`mk-nav__link${isActive(link.href) ? " is-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Community dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setCommunityOpen(true)}
            onMouseLeave={() => setCommunityOpen(false)}
          >
            <button
              className="mk-nav__link"
              style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
              aria-haspopup="true"
              aria-expanded={communityOpen}
            >
              Community <ChevronDown size={13} style={{ opacity: 0.7 }} />
            </button>

            {communityOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                  background: "#fff", borderRadius: "16px", padding: "10px",
                  minWidth: "260px", zIndex: 60,
                  boxShadow: "0 12px 40px rgba(0,11,79,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,38,116,0.08)",
                }}
              >
                {communityLinks.map(item => (
                  <Link
                    key={item.key}
                    href={item.href}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      padding: "10px 12px", borderRadius: "10px", textDecoration: "none",
                    }}
                    className="hover:bg-[#f4f6fb] transition-colors"
                  >
                    <item.icon size={16} color="#0058dd" style={{ marginTop: "3px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "#002674", lineHeight: 1.2 }}>{item.label}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Auth actions */}
        <div className="mk-header-actions">
          {user ? (
            <Link href="/profile" className="mk-btn--join">My Dashboard</Link>
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

            {mainNavLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", padding: "12px 12px 4px", margin: 0 }}>
              Community
            </div>
            {communityLinks.map(link => (
              <Link key={link.key} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}

            <div className="mk-mobile-drawer__actions">
              {user ? (
                <Link href="/profile" className="mk-btn--join" style={{ textAlign: "center" }} onClick={() => setMobileOpen(false)}>
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" style={{ textAlign: "center", display: "block", padding: "11px", borderRadius: "8px", border: "1px solid rgba(0,38,116,0.15)", color: "#002674", fontWeight: 600, fontSize: "14px", textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
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
