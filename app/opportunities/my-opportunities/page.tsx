"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2, Clock, DollarSign, Calendar, Users, Briefcase, BookmarkCheck, ArrowLeft, Plus, Search, List, Grid3X3, Eye, BarChart3, Edit, Trash2, FormInput, UserCheck, Bookmark } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SavedOpportunity {
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
    createdAt: string
  }
  savedAt: string
}

export default function MyOpportunitiesPage() {
  const { user, loading: authLoading } = useAuth()
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("saved")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user && !authLoading) {
      fetchSavedOpportunities()
    }
  }, [mounted, user, authLoading])

  const fetchSavedOpportunities = async () => {
    try {
      const response = await fetch("/api/opportunities/saved", {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSavedOpportunities(data)
      }
    } catch (error) {
      console.error("Error fetching saved opportunities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsaveOpportunity = async (savedId: string) => {
    try {
      const response = await fetch(`/api/opportunities/saved`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ opportunityId: savedId })
      })

      if (response.ok) {
        setSavedOpportunities(prev => prev.filter(item => item.id !== savedId))
      }
    } catch (error) {
      console.error("Error unsaving opportunity:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTabCategoryColor = (tabCategory: string) => {
    switch (tabCategory) {
      case 'job': return 'bg-blue-100 text-blue-800'
      case 'gig': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!mounted) {
    return null
  }

  if (!user) {
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

  const filteredOpportunities = savedOpportunities.filter(saved => {
    const opportunity = saved.opportunity
    const matchesSearch = !searchTerm || 
                         opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || opportunity.tabCategory === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Opportunities</h1>
          <p className="text-muted-foreground">
            Manage your saved opportunities
          </p>
        </div>
        <Link href="/opportunities">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Opportunities
          </Button>
        </Link>
      </div>

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

      {/* Saved Opportunities */}
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
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved opportunities yet</h3>
            <p className="text-muted-foreground mb-4">
              Save interesting opportunities to review them later.
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
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredOpportunities.map((saved) => (
            <Card key={saved.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{saved.opportunity.title}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <BookmarkCheck className="h-3 w-3" />
                        Saved
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>{saved.opportunity.company}</span>
                      <span>{saved.opportunity.location}</span>
                      <Badge className={getTabCategoryColor(saved.opportunity.tabCategory)}>
                        {saved.opportunity.tabCategory === 'job' ? 'Job' : 
                         saved.opportunity.tabCategory === 'gig' ? 'Gig' : 'Other'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Posted by {saved.opportunity.poster.fullName}</span>
                      <span>Posted {formatDate(saved.opportunity.createdAt)}</span>
                      <span>Saved {formatDate(saved.savedAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/opportunities/${saved.opportunity.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnsaveOpportunity(saved.id)}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Unsave
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}