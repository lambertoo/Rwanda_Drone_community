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
  regulators: [
    { label: "RISA",                href: "https://www.risa.gov.rw/", external: true },
    { label: "RISA Drone Centre",   href: "https://www.risa.gov.rw/projects/drone-operation-center-doc", external: true },
    { label: "CAA Rwanda",          href: "https://www.caa.gov.rw/", external: true },
    { label: "RURA",                href: "https://www.rura.rw/", external: true },
    { label: "Rwanda National Police", href: "https://www.police.gov.rw/", external: true },
  ],
}

export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mk-site-footer">
      <div className="mk-footer-inner">
        {/* Newsletter card */}
        <div className="mk-footer-newsletter">
          <p>Stay connected with Rwanda's drone community — news, events, and opportunities in your inbox.</p>
          <div className="mk-footer-newsletter-combo">
            <input type="email" placeholder="Your email address" />
            <button className="mk-footer-newsletter-submit">Keep me updated →</button>
          </div>
        </div>

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

          {/* Regulators / Quick Links */}
          <div className="mk-footer-col">
            <h4>Regulatory Bodies</h4>
            {footerLinks.regulators.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
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
