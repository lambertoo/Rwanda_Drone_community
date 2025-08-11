"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Users, 
  Eye, 
  Download, 
  Share2, 
  Settings, 
  BarChart3, 
  FileText, 
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  ExternalLink
} from "lucide-react"

interface Opportunity {
  id: string
  title: string
  description: string
  company: string
  opportunityType: string
  category: string
  location: string
  salary: string | null
  requirements: string | null
  isUrgent: boolean
  isRemote: boolean
  isActive: boolean
  tabCategory: string
  createdAt: string
  poster: {
    id: string
    fullName: string
    avatar: string | null
    isVerified: boolean
    organization: string | null
    email: string
  }
  applications: {
    id: string
    applicant: {
      id: string
      fullName: string
      avatar: string | null
      email: string
      isVerified: boolean
    }
    message: string | null
    createdAt: string
    status: string
  }[]
  applicationForm?: {
    id: string
    title: string
    fields: any[]
    isActive: boolean
  }
}

interface ApplicationSubmission {
  id: string
  applicant: {
    id: string
    fullName: string
    avatar: string | null
    email: string
    isVerified: boolean
  }
  submittedAt: string
  status: string
  fieldSubmissions: {
    fieldId: string
    field: {
      label: string
      type: string
    }
    value: string
  }[]
}

export default function OpportunityDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: opportunityId } = use(params)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [submissions, setSubmissions] = useState<ApplicationSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formActive, setFormActive] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunity()
      fetchSubmissions()
    }
  }, [opportunityId])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`)
      if (response.ok) {
        const data = await response.json()
        setOpportunity(data)
        if (data.applicationForm) {
          setFormActive(data.applicationForm.isActive)
        }
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      // This would need to be implemented in the API
      // For now, we'll use mock data
      setSubmissions([])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    }
  }

  const handleFormToggle = async (active: boolean) => {
    try {
      // This would need to be implemented in the API
      setFormActive(active)
    } catch (error) {
      console.error('Error updating form status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Opportunity not found</h3>
            <p className="text-muted-foreground mb-4">
              The opportunity you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/opportunities')}>
              Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentUser || currentUser.id !== opportunity.poster.id) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              Only the opportunity creator can access this dashboard.
            </p>
            <Button onClick={() => router.push(`/opportunities/${opportunityId}`)}>
              View Opportunity
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalApplications = opportunity.applications.length
  const pendingApplications = opportunity.applications.filter(app => app.status === 'pending').length
  const approvedApplications = opportunity.applications.filter(app => app.status === 'approved').length
  const rejectedApplications = opportunity.applications.filter(app => app.status === 'rejected').length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/opportunities/my-opportunities">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Opportunities
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{opportunity.title}</h1>
          <p className="text-muted-foreground">Dashboard & Analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Opportunity Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{opportunity.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{opportunity.location}</span>
              {opportunity.isRemote && (
                <Badge variant="outline">Remote</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span>{opportunity.salary || 'Salary not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Posted {formatDate(opportunity.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalApplications}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingApplications}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedApplications}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{rejectedApplications}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submissions
            <Badge variant="secondary" className="ml-1">
              {totalApplications}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Pending Review</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(pendingApplications / totalApplications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{pendingApplications}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approved</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(approvedApplications / totalApplications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{approvedApplications}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rejected</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(rejectedApplications / totalApplications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{rejectedApplications}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opportunity.applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{app.applicant.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Submissions</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applicants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {opportunity.applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground">
                    Applications will appear here once people start applying.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunity.applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {app.applicant.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{app.applicant.fullName}</h4>
                            <p className="text-sm text-muted-foreground">{app.applicant.email}</p>
                          </div>
                          {app.applicant.isVerified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(app.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Application trend charts will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Applicant Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Source analytics will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Opportunity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Direct Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={`${window.location.origin}/opportunities/${opportunityId}`}
                    readOnly
                  />
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share on LinkedIn
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share on Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Allow New Submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, no new applications can be submitted
                  </p>
                </div>
                <Switch
                  checked={formActive}
                  onCheckedChange={handleFormToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-approve Applications</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve new applications
                  </p>
                </div>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when new applications are submitted
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Opportunity</h4>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. All applications will be lost.
                    </p>
                  </div>
                  <Button variant="destructive">
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 