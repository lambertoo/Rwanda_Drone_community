"use client"

import { useState } from "react"
import Link from "next/link"

const footerLinks = {
  community: [
    { label: "Forum",               href: "/forum" },
    { label: "Projects",            href: "/projects" },
    { label: "Events",              href: "/events" },
    { label: "Drone Clubs",         href: "/clubs" },
    { label: "Pilot Directory",     href: "/pilots" },
  ],
  resources: [
    { label: "Opportunities",       href: "/opportunities" },
    { label: "Resource Library",    href: "/resources" },
    { label: "Services",            href: "/services" },
    { label: "Learn",               href: "/learn" },
  ],
  getInvolved: [
    { label: "Join the Community",  href: "/register" },
    { label: "Share a Project",     href: "/projects/new" },
    { label: "Post an Opportunity", href: "/opportunities/new" },
    { label: "Create an Event",     href: "/events/new" },
  ],
  quickLinks: [
    { label: "RISA",                href: "https://www.risa.gov.rw/" },
    { label: "RISA Drone Centre",   href: "https://www.risa.gov.rw/projects/drone-operation-center-doc" },
    { label: "CAA Rwanda",          href: "https://www.caa.gov.rw/" },
    { label: "RURA",                href: "https://www.rura.rw/" },
    { label: "MINICT",              href: "https://www.minict.gov.rw/" },
    { label: "Rwanda National Police", href: "https://www.police.gov.rw/" },
  ],
}

function FooterNewsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    setErrMsg("")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topics: ["events", "opportunities", "resources", "news"] }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("success")
      } else {
        setErrMsg(data.error || "Something went wrong.")
        setStatus("error")
      }
    } catch {
      setErrMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="mk-footer-newsletter">
        <div style={{ background: "rgba(22,163,74,0.12)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 8, padding: "14px 16px", color: "#15803d", fontWeight: 600, fontSize: 14, textAlign: "center" }}>
          ✓ You're subscribed to the community!
        </div>
        <p style={{ fontSize: 12, textAlign: "center", marginTop: 8, opacity: 0.7 }}>
          <Link href="/unsubscribe" style={{ color: "inherit", textDecoration: "underline" }}>Unsubscribe</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mk-footer-newsletter">
      <p>Stay connected with Rwanda's drone community — news, events, and opportunities in your inbox.</p>
      <form onSubmit={handleSubmit}>
        <div className="mk-footer-newsletter-combo">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email address"
            required
          />
          <button
            type="submit"
            className="mk-footer-newsletter-submit"
            disabled={status === "loading"}
            style={{ background: "linear-gradient(135deg,#002674,#0058dd)", opacity: status === "loading" ? 0.7 : 1, cursor: status === "loading" ? "not-allowed" : "pointer" }}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe →"}
          </button>
        </div>
        {errMsg && <p style={{ fontSize: 12, color: "#dc2626", margin: "4px 0 0" }}>{errMsg}</p>}
      </form>
      <p style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>
        You can manage your content preferences in your{" "}
        <Link href="/profile/edit" style={{ color: "inherit", textDecoration: "underline" }}>profile settings</Link>.
        {" · "}
        <Link href="/unsubscribe" style={{ color: "inherit", textDecoration: "underline" }}>Unsubscribe</Link>
      </p>
    </div>
  )
}

export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mk-site-footer">
      <div className="mk-footer-inner">
        {/* Newsletter card */}
        <FooterNewsletter />

        {/* Footer grid */}
        <div className="mk-footer-grid">
          {/* Brand */}
          <div className="mk-footer-brand">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div className="mk-logo__mark">RDC</div>
              <span style={{ fontWeight: 700, fontSize: "14px", color: "#002674" }}>Rwanda Drone Community</span>
            </Link>
            <p>
              The hub connecting Rwanda's drone pilots, operators, innovators, and organizations shaping the future of unmanned aviation across East Africa.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mk-footer-col">
            <h4>Quick Links</h4>
            {footerLinks.quickLinks.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
            ))}
          </div>

          {/* Community */}
          <div className="mk-footer-col">
            <h4>Community</h4>
            {footerLinks.community.map(link => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </div>

          {/* Resources */}
          <div className="mk-footer-col">
            <h4>Resources</h4>
            {footerLinks.resources.map(link => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </div>

          {/* Get Involved */}
          <div className="mk-footer-col">
            <h4>Get Involved</h4>
            {footerLinks.getInvolved.map(link => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mk-footer-bottom">
          <span>© {year} Rwanda Drone Community. All rights reserved.</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </div>
          <div className="mk-footer-socials">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="mk-footer-social-btn" aria-label="X / Twitter">𝕏</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="mk-footer-social-btn" aria-label="LinkedIn">in</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="mk-footer-social-btn" aria-label="Instagram">ig</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
