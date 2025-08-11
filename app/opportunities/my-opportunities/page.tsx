"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Building2, Clock, DollarSign, Calendar, Users, Briefcase, Edit, Trash2, Plus, Search, Filter, FormInput, Eye, Grid3X3, List, BarChart3, Settings, Share2, FileText, UserCheck } from "lucide-react"
import { deleteOpportunityAction } from "@/lib/actions"

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
  }[]
  applicationForm?: {
    id: string
    title: string
    fields: any[]
  }
}

interface AppliedOpportunity {
  id: string
  opportunity: {
    id: string
    title: string
    company: string
    location: string
    tabCategory: string
    poster: {
      fullName: string
    }
  }
  status: string
  submittedAt: string
}

export default function MyOpportunitiesPage() {
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [appliedOpportunities, setAppliedOpportunities] = useState<AppliedOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("created")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  useEffect(() => {
    if (mounted && currentUser) {
      fetchMyOpportunities()
      fetchAppliedOpportunities()
    }
  }, [mounted, currentUser])

  const fetchMyOpportunities = async () => {
    try {
      const response = await fetch("/api/opportunities")
      if (response.ok) {
        const data = await response.json()
        // Filter opportunities posted by current user
        const myOpportunities = data.filter((opp: Opportunity) => 
          opp.poster?.id === currentUser.id
        )
        setOpportunities(myOpportunities)
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppliedOpportunities = async () => {
    try {
      // This would need to be implemented in the API
      // For now, we'll use a placeholder
      setAppliedOpportunities([])
    } catch (error) {
      console.error("Error fetching applied opportunities:", error)
    }
  }

  const handleDelete = async (opportunityId: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) {
      return
    }

    try {
      await deleteOpportunityAction(opportunityId)
      // Refresh the list
      fetchMyOpportunities()
    } catch (error) {
      console.error("Error deleting opportunity:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Posted today"
    if (diffDays === 2) return "Posted yesterday"
    if (diffDays <= 7) return `Posted ${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getOpportunityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'part-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'contract':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'agriculture':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'photography':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'construction':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'technical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'conservation':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'education':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTabCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'job':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'gig':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'other':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Filter opportunities based on search and filters
  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && opportunity.isActive) ||
                         (statusFilter === "inactive" && !opportunity.isActive)
    
    const matchesCategory = categoryFilter === "all" || opportunity.tabCategory === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (!mounted) {
    return null
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">
              Please log in to view your opportunities.
            </p>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Opportunities</h1>
          <p className="text-muted-foreground">
            Manage your posted opportunities and track applications
          </p>
        </div>
        <Link href="/opportunities/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Opportunity
          </Button>
        </Link>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Opportunities I Created
            <Badge variant="secondary" className="ml-1">
              {opportunities.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="applied" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Opportunities I Applied To
            <Badge variant="secondary" className="ml-1">
              {appliedOpportunities.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Created Opportunities Tab */}
        <TabsContent value="created" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="job">Jobs</SelectItem>
                    <SelectItem value="gig">Gigs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities List/Grid */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "You haven't posted any opportunities yet."}
                </p>
                {!searchTerm && statusFilter === "all" && categoryFilter === "all" && (
                  <Link href="/opportunities/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Opportunity
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {filteredOpportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-semibold ${viewMode === "grid" ? "text-lg" : "text-xl"}`}>
                              {opportunity.title}
                            </h3>
                            {opportunity.isUrgent && (
                              <Badge variant="destructive">Urgent</Badge>
                            )}
                            <Badge variant={opportunity.isActive ? "default" : "secondary"}>
                              {opportunity.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Building2 className="h-4 w-4" />
                            <span>{opportunity.company}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getOpportunityTypeColor(opportunity.opportunityType)}>
                            {opportunity.opportunityType}
                          </Badge>
                          <Badge className={getCategoryColor(opportunity.category)}>
                            {opportunity.category}
                          </Badge>
                          <Badge className={getTabCategoryColor(opportunity.tabCategory)}>
                            {opportunity.tabCategory === 'job' ? 'Job' : 
                             opportunity.tabCategory === 'gig' ? 'Gig' : 'Other'}
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{opportunity.location}</span>
                          {opportunity.isRemote && (
                            <Badge variant="outline">Remote</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{opportunity.salary || 'Salary not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(opportunity.createdAt)}</span>
                        </div>
                      </div>

                      {/* Applications Count */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{opportunity.applications.length} application{opportunity.applications.length !== 1 ? 's' : ''}</span>
                        {opportunity.applicationForm && (
                          <Badge variant="outline" className="ml-2">
                            <FormInput className="h-3 w-3 mr-1" />
                            Custom Form
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Link href={`/opportunities/${opportunity.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/opportunities/${opportunity.id}/dashboard`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href={`/opportunities/${opportunity.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        {opportunity.applicationForm ? (
                          <Link href={`/opportunities/${opportunity.id}/build-form`}>
                            <Button variant="outline" size="sm">
                              <FormInput className="h-4 w-4 mr-2" />
                              Edit Form
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/opportunities/${opportunity.id}/build-form`}>
                            <Button variant="outline" size="sm">
                              <FormInput className="h-4 w-4 mr-2" />
                              Build Form
                            </Button>
                          </Link>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(opportunity.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Applied Opportunities Tab */}
        <TabsContent value="applied" className="space-y-6">
          {appliedOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't applied to any opportunities yet.
                </p>
                <Link href="/opportunities">
                  <Button>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Opportunities
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appliedOpportunities.map((applied) => (
                <Card key={applied.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{applied.opportunity.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{applied.opportunity.company}</span>
                          <span>{applied.opportunity.location}</span>
                          <Badge className={getTabCategoryColor(applied.opportunity.tabCategory)}>
                            {applied.opportunity.tabCategory === 'job' ? 'Job' : 
                             applied.opportunity.tabCategory === 'gig' ? 'Gig' : 'Other'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{applied.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Applied {formatDate(applied.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 