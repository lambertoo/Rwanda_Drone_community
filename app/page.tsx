import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Calendar, MapPin, Users, MessageSquare, Eye, Heart, Clock, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

async function getHomePageData() {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    return { featuredProjects: [], recentPosts: [], upcomingEvents: [], stats: { projects: 0, users: 0, events: 0, services: 0 } }
  }
  try {
    const [featuredProjects, recentPosts, upcomingEvents, ...counts] = await Promise.all([
      prisma.project.findMany({
        where: { isFeatured: true, isApproved: true },
        take: 3,
        include: {
          author: { select: { fullName: true, avatar: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.forumPost.findMany({
        where: { isApproved: true },
        take: 4,
        include: {
          author: { select: { fullName: true, avatar: true } },
          category: { select: { name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        where: { startDate: { gte: new Date() }, isPublished: true, isApproved: true },
        take: 3,
        include: { _count: { select: { rsvps: true } } },
        orderBy: { startDate: "asc" },
      }),
      prisma.project.count({ where: { isApproved: true } }),
      prisma.user.count(),
      prisma.event.count({ where: { isPublished: true, isApproved: true } }),
      prisma.service.count({ where: { isApproved: true } }),
    ])
    return {
      featuredProjects,
      recentPosts,
      upcomingEvents,
      stats: { projects: counts[0], users: counts[1], events: counts[2], services: counts[3] },
    }
  } catch {
    return { featuredProjects: [], recentPosts: [], upcomingEvents: [], stats: { projects: 0, users: 0, events: 0, services: 0 } }
  }
}

const fmt = (d: Date) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

export default async function HomePage() {
  const { featuredProjects, recentPosts, upcomingEvents, stats } = await getHomePageData()

  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────────── */}
      <section className="mk-hero" id="hero" aria-label="Hero">
        <div className="mk-hero__bg" aria-hidden="true" />
        <div className="mk-hero__content">
          <p className="mk-eyebrow mk-eyebrow--light">Rwanda Drone Community</p>
          <h1>The platform that connects Rwanda&apos;s drone ecosystem</h1>
          <p className="mk-hero__sub">
            Discover projects, join events, connect with pilots, and access opportunities shaping drone
            innovation across East Africa.
          </p>
          <div className="mk-hero__actions">
            <Link href="/projects" className="mk-btn mk-btn--white">Explore projects</Link>
            <Link href="/register" className="mk-btn mk-btn--ghost-inv">Join the community</Link>
          </div>
        </div>
      </section>

      {/* ── 2. Feature row — img right ───────────────────────── */}
      <article className="mk-feature mk-feature--img-right" id="discover">
        <div className="mk-feature__media">
          <figure>
            <img src="/images/rwanda-drone-1.jpg" alt="Drone operators in Rwanda" loading="lazy" />
            <p className="mk-photo-credit"><a href="https://www.flickr.com/photos/paulkagame/49492233882/" target="_blank" rel="noopener noreferrer">© Paul Kagame / Flickr</a></p>
          </figure>
        </div>
        <div className="mk-feature__text">
          <p className="mk-eyebrow mk-eyebrow--inline"><span style={{ display: "inline-block", width: 8, height: 8, marginRight: 8, borderRadius: "50%", background: "#0058dd", verticalAlign: "middle" }} />Drone Community</p>
          <h2>From the air to the community — connect pilots, partners, and programmes</h2>
          <p>Discover the full spectrum of Rwanda's drone ecosystem: skilled pilots, innovative projects, and support organisations all in one place.</p>
          <Link href="/projects" className="mk-text-link">Explore projects →</Link>
        </div>
      </article>

      {/* ── 3. Feature row — img left ────────────────────────── */}
      <article className="mk-feature mk-feature--img-left">
        <div className="mk-feature__media">
          <figure>
            <img src="/images/rwanda-drone-2.jpg" alt="Drone operators and service providers" loading="lazy" />
            <p className="mk-photo-credit"><a href="https://www.flickr.com/photos/paulkagame/49491530603/" target="_blank" rel="noopener noreferrer">© Paul Kagame / Flickr</a></p>
          </figure>
        </div>
        <div className="mk-feature__text">
          <h2>One platform for pilots, operators, and service providers</h2>
          <p>
            List your organisation, discover service opportunities, and connect with businesses seeking drone expertise across agriculture, delivery, surveying, and more.
          </p>
          <Link href="/services" className="mk-text-link">Browse services →</Link>
        </div>
      </article>

      {/* ── 4. Feature row — img right ───────────────────────── */}
      <article className="mk-feature mk-feature--img-right">
        <div className="mk-feature__media">
          <figure>
            <img src="/images/rwanda-drone-3.jpg" alt="Drone programme coordination" loading="lazy" />
            <p className="mk-photo-credit"><a href="https://www.flickr.com/photos/paulkagame/49492274612/" target="_blank" rel="noopener noreferrer">© Paul Kagame / Flickr</a></p>
          </figure>
        </div>
        <div className="mk-feature__text">
          <h2>Smarter, more coordinated drone programmes</h2>
          <p>Organisations running drone training, certification, and deployment programmes can publish opportunities and reach the right participants efficiently.</p>
          <Link href="/opportunities" className="mk-text-link">View opportunities →</Link>
        </div>
      </article>

      {/* ── 5. Feature row — img left ────────────────────────── */}
      <article className="mk-feature mk-feature--img-left">
        <div className="mk-feature__media">
          <figure>
            <img src="/images/rwanda-drone-4.jpg" alt="Learning and training resources" loading="lazy" />
            <p className="mk-photo-credit"><a href="https://www.flickr.com/photos/paulkagame/49492065031/" target="_blank" rel="noopener noreferrer">© Paul Kagame / Flickr</a></p>
          </figure>
        </div>
        <div className="mk-feature__text">
          <h2>Opportunities and skills for your drone career</h2>
          <p>
            Access training resources, certifications, and career opportunities that match your skills and ambitions — whether you&apos;re a beginner or a licensed professional.
          </p>
          <Link href="/resources" className="mk-text-link">Find resources →</Link>
        </div>
      </article>

      {/* ── 6. Hero block ────────────────────────────────────── */}
      <section className="mk-hero-block" id="visibility" aria-label="Visibility for innovators">
        <div className="mk-hero-block__bg" aria-hidden="true" />
        <div className="mk-hero-block__inner">
          <p className="mk-eyebrow mk-eyebrow--light"><span style={{ display: "inline-block", width: 8, height: 8, marginRight: 8, borderRadius: "50%", background: "#fff", verticalAlign: "middle" }} />Building the future</p>
          <h2>Visibility for Rwanda&apos;s drone innovators</h2>
          <p>
            Give your drone projects and organisation a profile — stories and impact visible to partners, investors, regulators, and the wider East African community.
          </p>
          <Link href="/register" className="mk-btn mk-btn--white" style={{ marginTop: "8px", display: "inline-flex" }}>Get started</Link>
        </div>
      </section>

      {/* ── 7. Split cards ───────────────────────────────────── */}
      <section className="mk-split-cards" aria-label="Highlights">
        <article className="mk-split-card">
          <img src="/images/rwanda-drone-5.jpg" alt="East Africa drone ecosystem" loading="lazy" />
          <div className="mk-split-card__overlay" />
          <p className="mk-photo-credit" style={{ zIndex: 2 }}><a href="https://www.flickr.com/photos/paulkagame/albums/72157712984865473/" target="_blank" rel="noopener noreferrer">© Paul Kagame / Flickr</a></p>
          <div className="mk-split-card__text">
            <h3>East Africa&apos;s drone ecosystem</h3>
            <p>
              Help international partners and investors discover Rwanda&apos;s ecosystem — collaborations, funding pathways, and market access across the region.
            </p>
          </div>
        </article>
        <article className="mk-split-card">
          <img src="/images/rwanda-drone-1.jpg" alt="Inclusive drone innovation" loading="lazy" />
          <div className="mk-split-card__overlay" />
          <p className="mk-photo-credit" style={{ zIndex: 2 }}><a href="https://www.flickr.com/photos/paulkagame/49492233882/" target="_blank" rel="noopener noreferrer">© Paul Kagame / Flickr</a></p>
          <div className="mk-split-card__text">
            <h3>Inclusive and open to all</h3>
            <p>
              Bring opportunities to more people — across cities and districts — not only those already inside the industry. Everyone has a role in Rwanda&apos;s sky.
            </p>
          </div>
        </article>
      </section>

      {/* ── 8. CTA band ──────────────────────────────────────── */}
      <section className="mk-cta-band" id="opportunities" aria-label="Call to action">
        <h2>Connect with operators and programmes ready to work with you</h2>
        <Link href="/register" className="mk-btn mk-btn--primary">Join the community</Link>
      </section>

      {/* ── 9. Icon cards ────────────────────────────────────── */}
      <section className="mk-icon-cards" id="community" aria-label="Platform features">
        <article className="mk-icon-card">
          <img src="/images/showcase-profile-icon.svg" alt="" width={56} height={56} />
          <h3>Showcase Your Profile</h3>
          <p>
            Put your drone project, club, or service in front of the local and global innovation community. Attract visibility, partners, and collaborators.
          </p>
          <Link href="/projects/new" className="mk-text-link">Share a project →</Link>
        </article>
        <article className="mk-icon-card">
          <img src="/images/partnership-icon.svg" alt="" width={56} height={56} />
          <h3>Strategic Partnerships</h3>
          <p>Connect with organisations offering funding, mentorship, training, and tools to accelerate your drone operations and career.</p>
          <Link href="/opportunities" className="mk-text-link">View opportunities →</Link>
        </article>
        <article className="mk-icon-card">
          <img src="/images/collaborate-icon.svg" alt="" width={56} height={56} />
          <h3>Collaborate and Innovate</h3>
          <p>
            Engage with ecosystem players through events, discussion forums, and shared resources designed to drive collective growth in Rwanda&apos;s drone sector.
          </p>
          <Link href="/forum" className="mk-text-link">Join the forum →</Link>
        </article>
      </section>

      {/* ── Stats divider ─────────────────────────────────────── */}
      {(stats.projects > 0 || stats.users > 0) && (
        <section
          style={{
            background: "linear-gradient(135deg, #002674 0%, #0058dd 100%)",
            padding: "48px 24px",
            color: "#fff",
          }}
          aria-label="Community statistics"
        >
          <div style={{ maxWidth: "var(--t-max)", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "32px", textAlign: "center" }}>
            {[
              { value: `${stats.projects}+`, label: "Active Projects" },
              { value: `${stats.users}+`,    label: "Community Members" },
              { value: `${stats.events}+`,   label: "Events & Workshops" },
              { value: `${stats.services}+`, label: "Service Providers" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "14px", marginTop: "6px", color: "rgba(255,255,255,0.75)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Projects ─────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="mk-section" aria-label="Featured projects">
          <div className="mk-section__header">
            <div>
              <p className="mk-eyebrow mk-eyebrow--inline">Showcase</p>
              <h2 className="mk-section__title">Featured Projects</h2>
              <p className="mk-section__sub">Innovative drone projects making impact across Rwanda</p>
            </div>
            <Link href="/projects" className="mk-text-link" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mk-cards-grid">
            {featuredProjects.map(project => {
              let techs: string[] = []
              try { techs = project.technologies ? JSON.parse(project.technologies) : [] } catch {}
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="mk-card">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="mk-card__img"
                  />
                  <div className="mk-card__body">
                    {project.category && <span className="mk-card__cat">{project.category.name}</span>}
                    <h3 className="mk-card__title">{project.title}</h3>
                    <p className="mk-card__desc">{project.description}</p>
                    {techs.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                        {techs.slice(0, 3).map(t => (
                          <span key={t} style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: "rgba(0,88,221,0.08)", color: "#0058dd" }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mk-card__footer">
                    <span style={{ fontWeight: 600, color: "#002674" }}>{project.author.fullName}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Eye size={13} />{project.viewsCount}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Heart size={13} />{project.likesCount}</span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Recent Forum Discussions ──────────────────────────── */}
      {recentPosts.length > 0 && (
        <section style={{ background: "var(--t-surface)", padding: "64px 0" }} aria-label="Forum discussions">
          <div style={{ maxWidth: "var(--t-max)", margin: "0 auto", padding: "0 24px" }}>
            <div className="mk-section__header" style={{ marginBottom: "24px" }}>
              <div>
                <p className="mk-eyebrow mk-eyebrow--inline">Community</p>
                <h2 className="mk-section__title">Recent Discussions</h2>
                <p className="mk-section__sub">Join the conversation and share your expertise</p>
              </div>
              <Link href="/forum" className="mk-text-link" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                View forum <ChevronRight size={14} />
              </Link>
            </div>

            <div>
              {recentPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/forum/${post.category.name.toLowerCase().replace(/\s+/g, "-")}/${post.id}`}
                  className="mk-list-row"
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "10px", flexShrink: 0,
                    background: "linear-gradient(135deg, #002674 0%, #0058dd 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <MessageSquare size={18} color="rgba(255,255,255,0.9)" />
                  </div>
                  <div className="mk-list-row__body">
                    <div className="mk-list-row__title">{post.title}</div>
                    <div className="mk-list-row__meta">
                      <span style={{ background: "rgba(0,88,221,0.08)", color: "#0058dd", padding: "1px 7px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, marginRight: "8px" }}>
                        {post.category.name}
                      </span>
                      {post.author.fullName}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "var(--t-muted-dark)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MessageSquare size={13} />{post._count.comments}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Eye size={13} />{post.viewsCount}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                      <Clock size={11} />{fmt(post.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Upcoming Events ───────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section className="mk-section" aria-label="Upcoming events">
          <div className="mk-section__header">
            <div>
              <p className="mk-eyebrow mk-eyebrow--inline">Calendar</p>
              <h2 className="mk-section__title">Upcoming Events</h2>
              <p className="mk-section__sub">Don&apos;t miss these exciting drone community events</p>
            </div>
            <Link href="/events" className="mk-text-link" style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mk-cards-grid">
            {upcomingEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`} className="mk-card">
                <div style={{ height: "6px", background: "linear-gradient(135deg, #002674 0%, #0058dd 100%)" }} />
                <div className="mk-card__body">
                  <span className="mk-card__cat">{event.category || "General"}</span>
                  <h3 className="mk-card__title">{event.title}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--t-muted-dark)" }}>
                      <Calendar size={13} color="#002674" />
                      {fmt(event.startDate)}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--t-muted-dark)" }}>
                      <MapPin size={13} color="#0058dd" />{event.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--t-muted-dark)" }}>
                      <Users size={13} color="#002674" />{event._count.rsvps} registered
                    </span>
                  </div>
                </div>
                <div className="mk-card__footer">
                  <span style={{ fontWeight: 700, color: "#002674" }}>
                    {event.price === 0 ? "Free" : `${event.price.toLocaleString()} ${event.currency}`}
                  </span>
                  <span className="mk-text-link" style={{ fontSize: "13px" }}>Register →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
