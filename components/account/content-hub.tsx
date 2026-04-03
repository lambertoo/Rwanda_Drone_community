"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ClipboardList, MessageSquare, Camera, Calendar, Loader2, Plus, Eye, FileText, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MyForms {
  id: string; title: string; slug: string; isActive: boolean; isPublic: boolean
  createdAt: string; updatedAt: string; _count: { entries: number }
}
interface MyPost {
  id: string; title: string; content: string; isApproved: boolean
  createdAt: string; updatedAt: string; viewsCount: number; repliesCount: number; likesCount: number
}
interface MyProject {
  id: string; title: string; description: string; status: string
  thumbnail: string | null; createdAt: string; updatedAt: string
}
interface MyEvent {
  id: string; title: string; description: string; startDate: string; endDate: string
  location: string; isPublic: boolean; createdAt: string
  _count: { rsvps: number }
}

const SUB_TABS = [
  { id: "forms", label: "Forms", icon: ClipboardList },
  { id: "posts", label: "Posts", icon: MessageSquare },
  { id: "projects", label: "Projects", icon: Camera },
  { id: "events", label: "Events", icon: Calendar },
]

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function ContentHub() {
  const [activeSubTab, setActiveSubTab] = useState("forms")
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<MyForms[]>([])
  const [posts, setPosts] = useState<MyPost[]>([])
  const [projects, setProjects] = useState<MyProject[]>([])
  const [events, setEvents] = useState<MyEvent[]>([])

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch("/api/my-content", { credentials: "include" })
      .then(r => {
        if (!r.ok) {
          if (r.status === 401) throw new Error("Please log in to view your content")
          throw new Error(`Failed to fetch (${r.status})`)
        }
        return r.json()
      })
      .then(data => {
        setForms(data.forms || [])
        setPosts(data.posts || [])
        setProjects(data.projects || [])
        setEvents(data.events || [])
      })
      .catch((err) => {
        console.error("My content fetch error:", err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const counts = { forms: forms.length, posts: posts.length, projects: projects.length, events: events.length }

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 mb-4 overflow-x-auto">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon
          const count = counts[tab.id as keyof typeof counts]
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === tab.id
                  ? "bg-background shadow-sm font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {count > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : (
        <>
          {/* Forms */}
          {activeSubTab === "forms" && (
            <div className="space-y-2">
              <div className="flex justify-end mb-3">
                <Link href="/forms/new">
                  <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Form</Button>
                </Link>
              </div>
              {forms.length === 0 ? (
                <EmptyState icon={ClipboardList} label="No forms yet" actionHref="/forms/new" actionLabel="Create Form" />
              ) : forms.map(f => (
                <Link key={f.id} href={`/forms/${f.id}/edit`} className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{f.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Updated {formatDate(f.updatedAt)} · {f._count.entries} response{f._count.entries !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge variant={f.isActive ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {f.isActive ? "Active" : "Closed"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Posts */}
          {activeSubTab === "posts" && (
            <div className="space-y-2">
              <div className="flex justify-end mb-3">
                <Link href="/community?tab=forum">
                  <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Post</Button>
                </Link>
              </div>
              {posts.length === 0 ? (
                <EmptyState icon={MessageSquare} label="No posts yet" actionHref="/community?tab=forum" actionLabel="Write a Post" />
              ) : posts.map(p => (
                <Link key={p.id} href={`/forum/${p.id}`} className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{p.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{formatDate(p.createdAt)}</span>
                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{p.viewsCount}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{p.repliesCount}</span>
                      </div>
                    </div>
                    <Badge variant={p.isApproved ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {p.isApproved ? "Published" : "Pending"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Projects */}
          {activeSubTab === "projects" && (
            <div className="space-y-2">
              <div className="flex justify-end mb-3">
                <Link href="/community?tab=projects">
                  <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Project</Button>
                </Link>
              </div>
              {projects.length === 0 ? (
                <EmptyState icon={Camera} label="No projects yet" actionHref="/community?tab=projects" actionLabel="Create Project" />
              ) : projects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">{p.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Events */}
          {activeSubTab === "events" && (
            <div className="space-y-2">
              <div className="flex justify-end mb-3">
                <Link href="/community?tab=events">
                  <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Event</Button>
                </Link>
              </div>
              {events.length === 0 ? (
                <EmptyState icon={Calendar} label="No events yet" actionHref="/community?tab=events" actionLabel="Create Event" />
              ) : events.map(e => (
                <Link key={e.id} href={`/events/${e.id}`} className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{e.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{formatDate(e.startDate)}</span>
                        <span>{e.location}</span>
                        <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{e._count.rsvps}</span>
                      </div>
                    </div>
                    <Badge variant={new Date(e.startDate) > new Date() ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {new Date(e.startDate) > new Date() ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, label, actionHref, actionLabel }: { icon: any; label: string; actionHref: string; actionLabel: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground mb-3">{label}</p>
      <Link href={actionHref}>
        <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1.5" />{actionLabel}</Button>
      </Link>
    </div>
  )
}
