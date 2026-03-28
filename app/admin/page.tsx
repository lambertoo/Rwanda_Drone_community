"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  Calendar,
  Briefcase,
  AlertTriangle,
  Eye,
  MessageSquare,
  Wrench,
  Zap,
} from "lucide-react"
import { AdminOnly } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import dynamic from "next/dynamic"

// Lazy load admin sub-pages
const ApprovalsContent = dynamic(() => import("@/app/admin/approvals/page"), { loading: () => <TabLoading /> })
const UsersContent = dynamic(() => import("@/app/admin/users/page"), { loading: () => <TabLoading /> })
const ReviewContent = dynamic(() => import("@/app/admin/review-contents/page"), { loading: () => <TabLoading /> })
const ForumCatContent = dynamic(() => import("@/app/admin/settings/forum-categories/page"), { loading: () => <TabLoading /> })
const ProjectCatContent = dynamic(() => import("@/app/admin/settings/project-categories/page"), { loading: () => <TabLoading /> })
const EventCatContent = dynamic(() => import("@/app/admin/settings/event-categories/page"), { loading: () => <TabLoading /> })
const ResourceCatContent = dynamic(() => import("@/app/admin/settings/resource-categories/page"), { loading: () => <TabLoading /> })
const ServiceCatContent = dynamic(() => import("@/app/admin/settings/service-categories/page"), { loading: () => <TabLoading /> })
const OpportunityCatContent = dynamic(() => import("@/app/admin/settings/opportunity-categories/page"), { loading: () => <TabLoading /> })

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
    </div>
  )
}

interface QuickAction {
  id: string
  label: string
  icon: any
  iconColor: string
  countKey: string
  badgeVariant: "destructive" | "secondary" | "default" | "outline"
  badgeColor?: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: "approvals", label: "Pending Content", icon: AlertTriangle, iconColor: "text-orange-600", countKey: "pendingContent", badgeVariant: "destructive" },
  { id: "users", label: "Users", icon: Users, iconColor: "text-blue-600", countKey: "totalUsers", badgeVariant: "secondary" },
  { id: "review", label: "Review Contents", icon: Eye, iconColor: "text-purple-600", countKey: "publishedContent", badgeVariant: "default", badgeColor: "bg-green-600" },
  { id: "forum-categories", label: "Forum Categories", icon: MessageSquare, iconColor: "text-green-600", countKey: "forumCategories", badgeVariant: "outline" },
  { id: "project-categories", label: "Project Categories", icon: Briefcase, iconColor: "text-blue-600", countKey: "projectCategories", badgeVariant: "outline" },
  { id: "event-categories", label: "Event Categories", icon: Calendar, iconColor: "text-green-600", countKey: "eventCategories", badgeVariant: "outline" },
  { id: "resource-categories", label: "Resource Categories", icon: FileText, iconColor: "text-indigo-600", countKey: "resourceCategories", badgeVariant: "outline" },
  { id: "service-categories", label: "Service Categories", icon: Wrench, iconColor: "text-orange-600", countKey: "serviceCategories", badgeVariant: "outline" },
  { id: "opportunity-categories", label: "Opportunity Categories", icon: Briefcase, iconColor: "text-purple-600", countKey: "opportunityCategories", badgeVariant: "outline" },
]

const TAB_COMPONENTS: Record<string, any> = {
  approvals: ApprovalsContent,
  users: UsersContent,
  review: ReviewContent,
  "forum-categories": ForumCatContent,
  "project-categories": ProjectCatContent,
  "event-categories": EventCatContent,
  "resource-categories": ResourceCatContent,
  "service-categories": ServiceCatContent,
  "opportunity-categories": OpportunityCatContent,
}

function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminCounts()
  }, [])

  const fetchAdminCounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard-counts', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.counts) {
          setCounts(data.counts)
        }
      }
    } catch (error) {
      console.error("Error fetching admin counts:", error)
    } finally {
      setLoading(false)
    }
  }

  const ActiveComponent = activeTab ? TAB_COMPONENTS[activeTab] : null

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.fullName}.
          </p>
        </div>

        {/* Quick Actions as tab buttons */}
        <div className="bg-background rounded-xl border shadow-sm mb-6">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Zap className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold">Quick Actions</span>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                const count = counts[action.countKey] || 0
                const isActive = activeTab === action.id

                return (
                  <button
                    key={action.id}
                    onClick={() => setActiveTab(isActive ? null : action.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background hover:bg-muted border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "" : action.iconColor}`} />
                    <span>{action.label}</span>
                    {!loading && count > 0 && (
                      <Badge
                        variant={isActive ? "secondary" : action.badgeVariant}
                        className={`h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5 ${
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" :
                          action.badgeColor || ""
                        }`}
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Active tab content renders inline below */}
        {activeTab && ActiveComponent && (
          <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">
                {QUICK_ACTIONS.find(a => a.id === activeTab)?.label}
              </h2>
              <button
                onClick={() => setActiveTab(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-0">
              <ActiveComponent />
            </div>
          </div>
        )}

        {/* Empty state when no tab selected */}
        {!activeTab && (
          <div className="bg-background rounded-xl border p-12 text-center">
            <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Click a quick action above to manage content inline.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminOnly>
      <AdminDashboard />
    </AdminOnly>
  )
}
