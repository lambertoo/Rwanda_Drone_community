"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Building2, Clock, DollarSign, Calendar, Users, Briefcase, Bookmark, BookmarkCheck } from "lucide-react"

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
  tabCategory: string
  createdAt: string
  poster: {
    id: string
    fullName: string
    avatar: string | null
    isVerified: boolean
    organization: string | null
  }
  applications: { id: string }[]
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("job")
  const [opportunityType, setOpportunityType] = useState("all")
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setMounted(true)
    // Get current user from localStorage
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  // Fetch saved opportunities when user is available
  useEffect(() => {
    if (currentUser && mounted) {
      fetchSavedOpportunities()
    }
  }, [currentUser, mounted])

  const fetchSavedOpportunities = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/opportunities/saved", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const savedIds = data.map((item: any) => item.opportunity.id)
        setSavedOpportunities(new Set(savedIds))
      }
    } catch (error) {
      console.error("Error fetching saved opportunities:", error)
    }
  }

  const fetchOpportunities = async () => {
    try {
      const params = new URLSearchParams()
      if (activeTab !== "all") params.append("tabCategory", activeTab)
      if (opportunityType !== "all") params.append("opportunityType", opportunityType)
      if (category !== "all") params.append("category", category)
      if (location !== "all") params.append("location", location)

      const response = await fetch(`/api/opportunities?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch opportunities")
      
      const data = await response.json()
      setOpportunities(data)
    } catch (error) {
      console.error("Error fetching opportunities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchOpportunities()
    }
  }, [activeTab, opportunityType, category, location, mounted])

  const handleSaveOpportunity = async (opportunityId: string) => {
    if (!currentUser) {
      // Redirect to login if user is not authenticated
      window.location.href = '/login'
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`/api/opportunities/${opportunityId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state based on API response
        const newSavedOpportunities = new Set(savedOpportunities)
        if (data.saved) {
          newSavedOpportunities.add(opportunityId)
          console.log("💾 Added opportunity to saved:", opportunityId)
        } else {
          newSavedOpportunities.delete(opportunityId)
          console.log("🗑️ Removed opportunity from saved:", opportunityId)
        }
        
        setSavedOpportunities(newSavedOpportunities)
      } else {
        console.error("Failed to save/unsave opportunity")
      }
    } catch (error) {
      console.error("Error saving/unsaving opportunity:", error)
    }
  }

  const isOpportunitySaved = (opportunityId: string) => {
    return savedOpportunities.has(opportunityId)
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
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

  const renderOpportunities = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (opportunities.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check back later for new opportunities.
            </p>
            <Link href="/opportunities/new">
              <Button>Post an Opportunity</Button>
            </Link>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          let requirements: string[] = []
          
          // Handle requirements parsing more robustly
          if (opportunity.requirements) {
            try {
              // Try to parse as JSON first
              if (typeof opportunity.requirements === 'string') {
                requirements = JSON.parse(opportunity.requirements)
              } else if (Array.isArray(opportunity.requirements)) {
                requirements = opportunity.requirements
              } else {
                requirements = []
              }
            } catch (error) {
              // If JSON parsing fails, try to handle as plain text
              if (typeof opportunity.requirements === 'string') {
                // Check if it looks like a comma-separated list
                if (opportunity.requirements.includes(',')) {
                  requirements = opportunity.requirements.split(',').map(req => req.trim()).filter(req => req.length > 0)
                } else {
                  // Single requirement
                  requirements = [opportunity.requirements.trim()]
                }
              } else {
                requirements = []
              }
            }
          }

          const isSaved = isOpportunitySaved(opportunity.id)

          return (
            <Card key={opportunity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-xl">{opportunity.title}</h3>
                        <p className="text-muted-foreground">{opportunity.company}</p>
                      </div>
                      <div className="flex gap-2">
                        {opportunity.isUrgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        <Badge className={getOpportunityTypeColor(opportunity.opportunityType)}>{opportunity.opportunityType}</Badge>
                        <Badge className={getCategoryColor(opportunity.category)}>{opportunity.category}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {opportunity.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(opportunity.createdAt)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{opportunity.description}</p>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Requirements:</h4>
                      <div className="flex flex-wrap gap-1">
                        {requirements.map((req, reqIndex) => (
                          <Badge key={reqIndex} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/opportunities/${opportunity.id}`}>
                      <Button>Apply Now</Button>
                    </Link>
                    <Button 
                      variant={isSaved ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleSaveOpportunity(opportunity.id)}
                      className={isSaved ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save Opportunity
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Opportunities Board</h1>
        <p className="text-lg text-muted-foreground">
          Find drone-related career opportunities across Rwanda
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="job">Jobs</TabsTrigger>
          <TabsTrigger value="gig">Gigs</TabsTrigger>
          <TabsTrigger value="other">Other Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="job" className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-xl font-semibold mb-2">Full-time & Part-time Jobs</h3>
            <p className="text-muted-foreground">Find permanent drone operator positions and career opportunities</p>
          </div>
          {renderOpportunities()}
        </TabsContent>
        
        <TabsContent value="gig" className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-xl font-semibold mb-2">Freelance Gigs</h3>
            <p className="text-muted-foreground">Short-term projects and freelance drone work opportunities</p>
          </div>
          {renderOpportunities()}
        </TabsContent>
        
        <TabsContent value="other" className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-xl font-semibold mb-2">Other Opportunities</h3>
            <p className="text-muted-foreground">Internships, training programs, and other drone-related opportunities</p>
          </div>
          {renderOpportunities()}
        </TabsContent>
      </Tabs>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={opportunityType} onValueChange={setOpportunityType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Opportunity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Photography">Photography</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Conservation">Conservation</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Kigali">Kigali</SelectItem>
              <SelectItem value="Musanze">Musanze</SelectItem>
              <SelectItem value="Huye">Huye</SelectItem>
              <SelectItem value="Akagera">Akagera National Park</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Link href="/opportunities/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Post Opportunity
          </Button>
        </Link>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Looking to hire drone professionals?</h3>
          <p className="text-muted-foreground mb-4">
            Post your opportunity and connect with qualified drone operators across Rwanda
          </p>
          <Link href="/opportunities/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Post an Opportunity
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 