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
  Settings2,
  FileCode,
  Cog,
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
const EmploymentTypesContent = dynamic(() => import("@/app/admin/settings/employment-types/page"), { loading: () => <TabLoading /> })
const LegalPagesContent = dynamic(() => import("@/app/admin/settings/pages/page"), { loading: () => <TabLoading /> })

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
    </div>
  )
}

interface TabItem {
  id: string
  label: string
  icon: any
  iconColor: string
  countKey?: string
  badgeVariant?: "destructive" | "secondary" | "default" | "outline"
  badgeColor?: string
}

const CONTENT_TABS: TabItem[] = [
  { id: "approvals", label: "Pending Content", icon: AlertTriangle, iconColor: "text-orange-600", countKey: "pendingContent", badgeVariant: "destructive" },
  { id: "users", label: "Users", icon: Users, iconColor: "text-blue-600", countKey: "totalUsers", badgeVariant: "secondary" },
  { id: "review", label: "Review Contents", icon: Eye, iconColor: "text-purple-600", countKey: "publishedContent", badgeVariant: "default", badgeColor: "bg-green-600" },
]

const CATEGORY_TABS: TabItem[] = [
  { id: "forum-categories", label: "Forum", icon: MessageSquare, iconColor: "text-green-600", countKey: "forumCategories", badgeVariant: "outline" },
  { id: "project-categories", label: "Projects", icon: Briefcase, iconColor: "text-blue-600", countKey: "projectCategories", badgeVariant: "outline" },
  { id: "event-categories", label: "Events", icon: Calendar, iconColor: "text-green-600", countKey: "eventCategories", badgeVariant: "outline" },
  { id: "resource-categories", label: "Resources", icon: FileText, iconColor: "text-indigo-600", countKey: "resourceCategories", badgeVariant: "outline" },
  { id: "service-categories", label: "Services", icon: Wrench, iconColor: "text-orange-600", countKey: "serviceCategories", badgeVariant: "outline" },
  { id: "opportunity-categories", label: "Opportunities", icon: Briefcase, iconColor: "text-purple-600", countKey: "opportunityCategories", badgeVariant: "outline" },
  { id: "employment-types", label: "Employment Types", icon: Users, iconColor: "text-teal-600" },
]

const PLATFORM_TABS: TabItem[] = [
  { id: "legal-pages", label: "Legal Pages", icon: FileCode, iconColor: "text-indigo-600" },
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
  "employment-types": EmploymentTypesContent,
  "legal-pages": LegalPagesContent,
}

function TabButton({
  tab,
  isActive,
  count,
  loading,
  onClick,
}: {
  tab: TabItem
  isActive: boolean
  count?: number
  loading: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background hover:bg-muted border-border hover:border-primary/30"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${isActive ? "" : tab.iconColor}`} />
      <span>{tab.label}</span>
      {!loading && count !== undefined && count > 0 && (
        <Badge
          variant={isActive ? "secondary" : tab.badgeVariant || "outline"}
          className={`h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5 ${
            isActive
              ? "bg-primary-foreground/20 text-primary-foreground"
              : tab.badgeColor || ""
          }`}
        >
          {count}
        </Badge>
      )}
    </button>
  )
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
      const response = await fetch("/api/admin/dashboard-counts", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.counts) setCounts(data.counts)
      }
    } catch (error) {
      console.error("Error fetching admin counts:", error)
    } finally {
      setLoading(false)
    }
  }

  const ActiveComponent = activeTab ? TAB_COMPONENTS[activeTab] : null

  const allTabs = [...CONTENT_TABS, ...CATEGORY_TABS, ...PLATFORM_TABS]
  const activeLabel = allTabs.find((t) => t.id === activeTab)?.label

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.fullName}. Manage your platform settings and content.
          </p>
        </div>

        {/* Content Management */}
        <div className="bg-background rounded-xl border shadow-sm mb-4">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b">
            <Eye className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content Management</span>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {CONTENT_TABS.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  count={tab.countKey ? counts[tab.countKey] : undefined}
                  loading={loading}
                  onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-background rounded-xl border shadow-sm mb-4">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b">
            <Cog className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</span>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TABS.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  count={tab.countKey ? counts[tab.countKey] : undefined}
                  loading={loading}
                  onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-background rounded-xl border shadow-sm mb-6">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b">
            <Settings2 className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Settings</span>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {PLATFORM_TABS.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  count={undefined}
                  loading={loading}
                  onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Active tab content */}
        {activeTab && ActiveComponent && (
          <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">{activeLabel}</h2>
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

        {/* Empty state */}
        {!activeTab && (
          <div className="bg-background rounded-xl border p-12 text-center">
            <Settings2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select an option above to manage your platform.
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
