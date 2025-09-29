"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Shield, 
  FileText, 
  Calendar, 
  Briefcase, 
  Settings, 
  BarChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MessageSquare,
  MapPin,
  Star,
  Zap,
  Activity,
  Wrench
} from "lucide-react"
import { AdminOnly } from "@/components/auth-guard"
import { AuthUser } from "@prisma/client"

function AdminDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [counts, setCounts] = useState({
    pendingContent: 0,
    totalUsers: 0,
    publishedContent: 0,
    forumCategories: 0,
    projectCategories: 0,
    eventCategories: 0,
    resourceCategories: 0,
    serviceCategories: 0,
    opportunityCategories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
      }
    }

    // Fetch admin counts
    fetchAdminCounts()
  }, [])

  const fetchAdminCounts = async () => {
    try {
      setLoading(true)
      // 1) pending content
      const pendingRes = await fetch("/api/admin/pending", { credentials: 'include' })
      let pendingTotal = 0
      if (pendingRes.ok) {
        const data = await pendingRes.json()
        if (data?.counts?.total != null) pendingTotal = Number(data.counts.total) || 0
        else if (data?.counts) {
          const c = data.counts
          pendingTotal = [c.forum, c.project, c.event, c.resource, c.opportunity, c.service]
            .filter((n: any) => typeof n === 'number')
            .reduce((a: number, b: number) => a + b, 0)
        } else if (data?.data) {
          const d = data.data
          pendingTotal = [d.forumPosts, d.projects, d.events, d.resources, d.opportunities, d.services]
            .map((arr: any) => Array.isArray(arr) ? arr.length : 0)
            .reduce((a: number, b: number) => a + b, 0)
        }
      }

      // 2) users
      const usersRes = await fetch('/api/admin/users', { credentials: 'include' })
      let totalUsers = 0
      if (usersRes.ok) {
        const users = await usersRes.json()
        totalUsers = Array.isArray(users) ? users.length : (users?.total || 0)
      }

      // 3) category counts (forum/project/event)
      const [forumCatRes, projectCatRes, eventCatRes] = await Promise.all([
        fetch('/api/admin/forum-categories', { credentials: 'include' }),
        fetch('/api/admin/project-categories', { credentials: 'include' }),
        fetch('/api/admin/event-categories', { credentials: 'include' })
      ])
      const forumCategories = forumCatRes.ok ? ((await forumCatRes.json())?.categories?.length || 0) : 0
      const projectCategories = projectCatRes.ok ? ((await projectCatRes.json())?.categories?.length || 0) : 0
      const eventCategories = eventCatRes.ok ? ((await eventCatRes.json())?.length || (await eventCatRes.json())?.categories?.length || 0) : 0

      // 4) published (for Review Contents) – use review-contents API
      const reviewRes = await fetch('/api/admin/review-contents', { credentials: 'include' })
      let publishedContent = 0
      if (reviewRes.ok) {
        const r = await reviewRes.json()
        if (r?.counts) {
          const c = r.counts
          publishedContent = [c.forum, c.project, c.event, c.resource, c.opportunity, c.service]
            .filter((n: any) => typeof n === 'number')
            .reduce((a: number, b: number) => a + b, 0)
        } else if (r?.data) {
          const d = r.data
          publishedContent = [d.forumPosts, d.projects, d.events, d.resources, d.opportunities, d.services]
            .map((arr: any) => Array.isArray(arr) ? arr.length : 0)
            .reduce((a: number, b: number) => a + b, 0)
        }
      }

      setCounts(prev => ({
        ...prev,
        pendingContent: pendingTotal,
        totalUsers,
        publishedContent,
        forumCategories,
        projectCategories,
        eventCategories,
      }))
    } catch (error) {
      console.error("Error fetching admin counts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Welcome back, {user?.fullName}. Quick access to admin functions.
              </p>
            </div>
          </div>
        </div>
        {/* Quick Actions - Main Content */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/approvals'}
              >
                <AlertTriangle className="h-4 w-4 mb-1 text-orange-600" />
                <span className="text-xs">Pending Content</span>
                {!loading && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.pendingContent}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/users'}
              >
                <Users className="h-4 w-4 mb-1 text-blue-600" />
                <span className="text-xs">Users</span>
                {!loading && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.totalUsers}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/review-contents'}
              >
                <Eye className="h-4 w-4 mb-1 text-purple-600" />
                <span className="text-xs">Review Contents</span>
                {!loading && (
                  <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-green-600">
                    {counts.publishedContent}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/settings/forum-categories'}
              >
                <MessageSquare className="h-4 w-4 mb-1 text-green-600" />
                <span className="text-xs">Forum Categories</span>
                {!loading && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.forumCategories}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/settings/project-categories'}
              >
                <Briefcase className="h-4 w-4 mb-1 text-blue-600" />
                <span className="text-xs">Project Categories</span>
                {!loading && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.projectCategories}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/settings/event-categories'}
              >
                <Calendar className="h-4 w-4 mb-1 text-green-600" />
                <span className="text-xs">Event Categories</span>
                {!loading && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.eventCategories}
                  </Badge>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/settings/resource-categories'}
              >
                <FileText className="h-4 w-4 mb-1 text-indigo-600" />
                <span className="text-xs">Resource Categories</span>
                {!loading && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.resourceCategories}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/settings/service-categories'}
              >
                <Wrench className="h-4 w-4 mb-1 text-orange-600" />
                <span className="text-xs">Service Categories</span>
                {!loading && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.serviceCategories}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex flex-col items-center h-auto py-3 relative"
                onClick={() => window.location.href = '/admin/settings/opportunity-categories'}
              >
                <Briefcase className="h-4 w-4 mb-1 text-purple-600" />
                <span className="text-xs">Opportunity Categories</span>
                {!loading && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {counts.opportunityCategories}
                  </Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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

