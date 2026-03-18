"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react"

interface PendingItem { id: string; title?: string; content?: string; description?: string; createdAt: string; author?: { fullName: string; username: string }; organizer?: { fullName: string }; poster?: { fullName: string }; uploadedBy?: { fullName: string }; provider?: { fullName: string } }

export default function RegulatorReviewPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pending, setPending] = useState<{ forumPosts: PendingItem[]; projects: PendingItem[]; events: PendingItem[]; opportunities: PendingItem[]; resources: PendingItem[]; services: PendingItem[] }>({ forumPosts: [], projects: [], events: [], opportunities: [], resources: [], services: [] })
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && user && user.role !== "regulator" && user.role !== "admin") router.push("/")
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/admin/pending", { credentials: "include" })
      .then(r => r.json())
      .then(d => setPending(d))
      .catch(() => toast.error("Failed to load pending items"))
      .finally(() => setFetching(false))
  }, [user])

  const approve = async (type: string, id: string) => {
    try {
      await fetch("/api/admin/approve", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ type, id, approved: true }) })
      toast.success("Approved")
      setPending(prev => ({ ...prev, [type]: (prev as any)[type].filter((i: PendingItem) => i.id !== id) }))
    } catch { toast.error("Failed") }
  }

  const reject = async (type: string, id: string) => {
    try {
      await fetch("/api/admin/approve", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ type, id, approved: false }) })
      toast.success("Rejected")
      setPending(prev => ({ ...prev, [type]: (prev as any)[type].filter((i: PendingItem) => i.id !== id) }))
    } catch { toast.error("Failed") }
  }

  const sections = [
    { key: "forumPosts", label: "Forum Posts", items: pending.forumPosts },
    { key: "projects", label: "Projects", items: pending.projects },
    { key: "events", label: "Events", items: pending.events },
    { key: "opportunities", label: "Opportunities", items: pending.opportunities },
    { key: "resources", label: "Resources", items: pending.resources },
    { key: "services", label: "Services", items: pending.services },
  ]

  const total = sections.reduce((s, sec) => s + sec.items.length, 0)

  if (loading || fetching) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Content Review</h1>
        <p className="text-muted-foreground mt-1">{total} items pending review</p>
      </div>

      <Tabs defaultValue="forumPosts">
        <TabsList className="flex-wrap h-auto mb-6">
          {sections.map(s => (
            <TabsTrigger key={s.key} value={s.key} className="gap-1.5">
              {s.label}
              {s.items.length > 0 && <Badge variant="destructive" className="h-4 px-1 text-xs">{s.items.length}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map(section => (
          <TabsContent key={section.key} value={section.key}>
            {section.items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>All clear — nothing pending in {section.label}</p></div>
            ) : (
              <div className="space-y-3">
                {section.items.map(item => {
                  const author = item.author?.fullName || item.organizer?.fullName || item.poster?.fullName || item.uploadedBy?.fullName || item.provider?.fullName || "Unknown"
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{item.title || "Untitled"}</p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content || item.description || ""}</p>
                            <p className="text-xs text-muted-foreground mt-2">By {author} · {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950" onClick={() => approve(section.key, item.id)}>
                              <CheckCircle className="h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => reject(section.key, item.id)}>
                              <XCircle className="h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
