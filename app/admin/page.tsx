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
import { useAuth } from "@/lib/auth-context"

function AdminDashboard() {
  const { user } = useAuth()
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
    // Fetch admin counts
    fetchAdminCounts()
  }, [])

  const fetchAdminCounts = async () => {
    try {
      setLoading(true)
      console.log('Fetching admin counts...')
      
      const response = await fetch('/api/admin/dashboard-counts', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard counts data:', data)
        
        if (data.success && data.counts) {
          const newCounts = {
            pendingContent: data.counts.pendingContent || 0,
            totalUsers: data.counts.totalUsers || 0,
            publishedContent: data.counts.publishedContent || 0,
            forumCategories: data.counts.forumCategories || 0,
            projectCategories: data.counts.projectCategories || 0,
            eventCategories: data.counts.eventCategories || 0,
            resourceCategories: data.counts.resourceCategories || 0,
            serviceCategories: data.counts.serviceCategories || 0,
            opportunityCategories: data.counts.opportunityCategories || 0,
          }
          console.log('Setting counts:', newCounts)
          setCounts(prev => ({
            ...prev,
            ...newCounts,
          }))
        }
      } else {
        console.error('Failed to fetch dashboard counts:', response.status)
      }
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

