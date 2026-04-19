"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ClipboardList, MessageSquare, Camera, Calendar, Loader2, Plus, Eye, Users, GraduationCap, BookOpen, UserCheck, Pencil, Trash2, FileText, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Role = 'owner' | 'collaborator'
interface MyForms {
  id: string; title: string; slug: string; isActive: boolean; isPublic: boolean
  createdAt: string; updatedAt: string; _count: { entries: number }
  _role?: Role
}
interface MyPost {
  id: string; title: string; content: string; isApproved: boolean
  createdAt: string; updatedAt: string; viewsCount: number; repliesCount: number; likesCount: number
}
interface MyProject {
  id: string; title: string; description: string; status: string
  thumbnail: string | null; createdAt: string; updatedAt: string
  _role?: Role
}
interface MyEvent {
  id: string; title: string; description: string; startDate: string; endDate: string
  location: string; isPublic: boolean; createdAt: string
  _count: { rsvps: number }
  _role?: Role
}
interface MyCourse {
  id: string; title: string; slug: string; category: string; level: string
  isPublished: boolean; enrollmentCount: number; price: number
  createdAt: string; updatedAt: string; _count: { lessons: number }
}
interface MyEnrollment {
  id: string; createdAt: string; completedAt: string | null
  course: { id: string; title: string; slug: string; category: string; level: string; thumbnail: string | null; instructor: { fullName: string } }
}
interface MyMentorProfile {
  id: string; specialties: any; bio: string | null; isAccepting: boolean; maxMentees: number
  _count: { receivedRequests: number }
}

interface MyResource {
  id: string; title: string; fileUrl: string; fileType: string; fileSize: string | null
  isRegulation: boolean; isApproved: boolean; downloads: number; views: number
  uploadedAt: string; updatedAt: string; category: { name: string }
  _role?: Role
}

const SUB_TABS = [
  { id: "forms", label: "Forms", icon: ClipboardList },
  { id: "posts", label: "Posts", icon: MessageSquare },
  { id: "projects", label: "Projects", icon: Camera },
  { id: "events", label: "Events", icon: Calendar },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "enrolled", label: "My Courses", icon: BookOpen },
  { id: "mentorship", label: "Mentorship", icon: UserCheck },
]

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function ContentHub() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "forms"
  const [activeSubTab, setActiveSubTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<MyForms[]>([])
  const [posts, setPosts] = useState<MyPost[]>([])
  const [projects, setProjects] = useState<MyProject[]>([])
  const [events, setEvents] = useState<MyEvent[]>([])
  const [courses, setCourses] = useState<MyCourse[]>([])
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([])
  const [mentorProfile, setMentorProfile] = useState<MyMentorProfile | null>(null)
  const [resources, setResources] = useState<MyResource[]>([])

  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (type: string, id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const endpoints: Record<string, string> = {
        forms: `/api/forms/${id}`,
        posts: `/api/forum/posts/${id}`,
        projects: `/api/projects/${id}`,
        events: `/api/events/${id}`,
        courses: `/api/courses/${id}`,
        resources: `/api/resources/${id}`,
      }
      const res = await fetch(endpoints[type], { method: "DELETE", credentials: "include" })
      if (res.ok) {
        toast.success(`"${title}" deleted`)
        if (type === "forms") setForms(prev => prev.filter(f => f.id !== id))
        if (type === "posts") setPosts(prev => prev.filter(p => p.id !== id))
        if (type === "projects") setProjects(prev => prev.filter(p => p.id !== id))
        if (type === "events") setEvents(prev => prev.filter(e => e.id !== id))
        if (type === "courses") setCourses(prev => prev.filter(c => c.id !== id))
        if (type === "resources") setResources(prev => prev.filter(r => r.id !== id))
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to delete")
      }
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(null)
    }
  }

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
        setCourses(data.courses || [])
        setEnrollments(data.enrollments || [])
        setMentorProfile(data.mentorProfile || null)
        setResources(data.resources || [])
      })
      .catch((err) => {
        console.error("My content fetch error:", err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const counts: Record<string, number> = {
    forms: forms.length, posts: posts.length, projects: projects.length, events: events.length,
    resources: resources.length, courses: courses.length, enrolled: enrollments.length, mentorship: mentorProfile ? 1 : 0,
  }

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
              ) : forms.map(f => {
                const isCollab = f._role === 'collaborator'
                return (
                  <div key={f.id} className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Link href={`/forms/${f.id}/edit`} className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{f.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Updated {formatDate(f.updatedAt)} · {f._count.entries} response{f._count.entries !== 1 ? "s" : ""}
                      </p>
                    </Link>
                    {isCollab && (
                      <Badge variant="outline" className="shrink-0 text-[10px] border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                        Collaborator
                      </Badge>
                    )}
                    <Badge variant={f.isActive ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {f.isActive ? "Active" : "Closed"}
                    </Badge>
                    {/* Collaborators cannot delete — only edit */}
                    {isCollab ? (
                      <Link href={`/forms/${f.id}/edit`} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <ItemActions editHref={`/forms/${f.id}/edit`} onDelete={() => handleDelete("forms", f.id, f.title)} deleting={deleting === f.id} />
                    )}
                  </div>
                )
              })}
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
                <div key={p.id} className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Link href={`/forum/${p.id}`} className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{p.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{formatDate(p.createdAt)}</span>
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{p.viewsCount}</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{p.repliesCount}</span>
                    </div>
                  </Link>
                  <Badge variant={p.isApproved ? "default" : "secondary"} className="shrink-0 text-[10px]">
                    {p.isApproved ? "Published" : "Pending"}
                  </Badge>
                  <ItemActions editHref={`/forum/${p.id}`} onDelete={() => handleDelete("posts", p.id, p.title)} deleting={deleting === p.id} />
                </div>
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
              ) : projects.map(p => {
                const isCollab = p._role === 'collaborator'
                return (
                  <div key={p.id} className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Link href={`/projects/${p.id}`} className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                    </Link>
                    {isCollab && <Badge variant="outline" className="shrink-0 text-[10px] border-blue-300 text-blue-700">Collaborator</Badge>}
                    <Badge variant="secondary" className="shrink-0 text-[10px]">{p.status}</Badge>
                    {isCollab ? (
                      <Link href={`/projects/${p.id}/edit`} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <ItemActions editHref={`/projects/${p.id}/edit`} onDelete={() => handleDelete("projects", p.id, p.title)} deleting={deleting === p.id} />
                    )}
                  </div>
                )
              })}
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
              ) : events.map(e => {
                const isCollab = e._role === 'collaborator'
                return (
                  <div key={e.id} className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Link href={`/events/${e.id}`} className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{e.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{formatDate(e.startDate)}</span>
                        <span>{e.location}</span>
                        <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{e._count.rsvps}</span>
                      </div>
                    </Link>
                    {isCollab && <Badge variant="outline" className="shrink-0 text-[10px] border-blue-300 text-blue-700">Collaborator</Badge>}
                    <Badge variant={new Date(e.startDate) > new Date() ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {new Date(e.startDate) > new Date() ? "Upcoming" : "Past"}
                    </Badge>
                    {isCollab ? (
                      <Link href={`/events/${e.id}/edit`} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <ItemActions editHref={`/events/${e.id}/edit`} onDelete={() => handleDelete("events", e.id, e.title)} deleting={deleting === e.id} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Resources */}
          {activeSubTab === "resources" && (
            <div className="space-y-2">
              <div className="flex justify-end mb-3">
                <Link href="/know-how?tab=resources">
                  <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Resource</Button>
                </Link>
              </div>
              {resources.length === 0 ? (
                <EmptyState icon={FileText} label="No resources shared yet" actionHref="/know-how?tab=resources" actionLabel="Share Resource" />
              ) : resources.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{r.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{r.category.name}</span>
                      <span>{r.fileType}</span>
                      {r.fileSize && <span>{r.fileSize}</span>}
                      <span className="flex items-center gap-0.5"><Download className="h-3 w-3" />{r.downloads}</span>
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{r.views}</span>
                    </div>
                  </div>
                  <Badge variant={r.isApproved ? "default" : "secondary"} className="shrink-0 text-[10px]">
                    {r.isApproved ? "Approved" : "Pending"}
                  </Badge>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete("resources", r.id, r.title) }}
                    disabled={deleting === r.id}
                    className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50 shrink-0"
                    title="Delete"
                  >
                    {deleting === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Courses (created by user) */}
          {activeSubTab === "courses" && (
            <div className="space-y-2">
              <div className="flex justify-end mb-3">
                <Link href="/know-how?tab=courses">
                  <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Course</Button>
                </Link>
              </div>
              {courses.length === 0 ? (
                <EmptyState icon={GraduationCap} label="No courses created yet" actionHref="/know-how?tab=courses" actionLabel="Create Course" />
              ) : courses.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Link href={`/know-how/courses/${c.slug}`} className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{c.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="capitalize">{c.category}</span>
                      <span className="capitalize">{c.level}</span>
                      <span>{c._count.lessons} lesson{c._count.lessons !== 1 ? "s" : ""}</span>
                      <span>{c.enrollmentCount} enrolled</span>
                    </div>
                  </Link>
                  <Badge variant={c.isPublished ? "default" : "secondary"} className="shrink-0 text-[10px]">
                    {c.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <ItemActions editHref={`/know-how/courses/${c.slug}`} onDelete={() => handleDelete("courses", c.id, c.title)} deleting={deleting === c.id} />
                </div>
              ))}
            </div>
          )}

          {/* My Courses (enrolled) */}
          {activeSubTab === "enrolled" && (
            <div className="space-y-2">
              {enrollments.length === 0 ? (
                <EmptyState icon={BookOpen} label="No courses enrolled yet" actionHref="/know-how?tab=courses" actionLabel="Browse Courses" />
              ) : enrollments.map(e => (
                <Link key={e.id} href={`/know-how/courses/${e.course.slug}`} className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{e.course.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="capitalize">{e.course.category}</span>
                        <span className="capitalize">{e.course.level}</span>
                        <span>by {e.course.instructor.fullName}</span>
                        <span>Enrolled {formatDate(e.createdAt)}</span>
                      </div>
                    </div>
                    <Badge variant={e.completedAt ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {e.completedAt ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mentorship */}
          {activeSubTab === "mentorship" && (
            <div className="space-y-2">
              {!mentorProfile ? (
                <EmptyState icon={UserCheck} label="No mentor profile yet" actionHref="/know-how?tab=mentorship" actionLabel="Become a Mentor" />
              ) : (
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Your Mentor Profile</h3>
                    <Badge variant={mentorProfile.isAccepting ? "default" : "secondary"} className="text-[10px]">
                      {mentorProfile.isAccepting ? "Accepting Mentees" : "Not Accepting"}
                    </Badge>
                  </div>
                  {mentorProfile.bio && <p className="text-xs text-muted-foreground">{mentorProfile.bio}</p>}
                  {mentorProfile.specialties && Array.isArray(mentorProfile.specialties) && (
                    <div className="flex flex-wrap gap-1">
                      {(mentorProfile.specialties as string[]).map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{mentorProfile._count.receivedRequests} mentorship request{mentorProfile._count.receivedRequests !== 1 ? "s" : ""}</span>
                    <span>Max {mentorProfile.maxMentees} mentees</span>
                  </div>
                  <Link href="/know-how?tab=mentorship">
                    <Button size="sm" variant="outline" className="mt-1">Manage Mentorship</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ItemActions({ editHref, onDelete, deleting }: { editHref: string; onDelete: () => void; deleting: boolean }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <Link href={editHref}
        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }}
        disabled={deleting}
        className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
        title="Delete"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
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
