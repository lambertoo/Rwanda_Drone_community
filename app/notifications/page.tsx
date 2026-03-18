"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell, MessageSquare, Heart, CheckCircle, Calendar,
  Briefcase, FileText, AlertTriangle, Info, Trash2, CheckCheck
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

const typeIcon: Record<string, any> = {
  reply: MessageSquare,
  like: Heart,
  approval: CheckCircle,
  event_reminder: Calendar,
  application_update: Briefcase,
  content_review: FileText,
  safety: AlertTriangle,
  default: Info,
}

const typeColor: Record<string, string> = {
  reply: "text-blue-500",
  like: "text-red-500",
  approval: "text-green-500",
  event_reminder: "text-purple-500",
  application_update: "text-orange-500",
  safety: "text-red-600",
  default: "text-muted-foreground",
}

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  const now = new Date()
  notifications.forEach((n) => {
    const d = new Date(n.createdAt)
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    let label = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : diffDays < 7 ? "This week" : "Older"
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fetching, setFetching] = useState(true)
  const [tab, setTab] = useState("all")

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setFetching(false))
  }, [user])

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT", credentials: "include" })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PUT", credentials: "include" })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast.success("All notifications marked as read")
  }

  const filtered = tab === "unread" ? notifications.filter((n) => !n.isRead) : tab === "read" ? notifications.filter((n) => n.isRead) : notifications
  const groups = groupByDate(filtered)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading || fetching) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifications
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated on activity across the platform</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groups).map(([label, items]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{label}</p>
                  <div className="space-y-2">
                    {items.map((n) => {
                      const Icon = typeIcon[n.type] || typeIcon.default
                      const color = typeColor[n.type] || typeColor.default
                      return (
                        <Card
                          key={n.id}
                          className={`cursor-pointer transition-colors hover:bg-accent/50 ${!n.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
                          onClick={() => { markRead(n.id); if (n.link) router.push(n.link) }}
                        >
                          <CardContent className="p-4 flex gap-3 items-start">
                            <div className={`mt-0.5 shrink-0 ${color}`}><Icon className="h-5 w-5" /></div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
