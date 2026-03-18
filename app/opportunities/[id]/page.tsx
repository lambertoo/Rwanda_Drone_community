"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building2, Clock, DollarSign, Calendar, Users, Briefcase, Edit, Trash2, ArrowLeft, FormInput, Settings, CheckCircle } from "lucide-react"
import { deleteOpportunityAction } from "@/lib/actions"
import DynamicApplicationForm from "@/components/opportunities/dynamic-application-form"
import OpportunityApplicationForm from "@/components/opportunities/opportunity-application-form"
import { AuthGuard } from "@/components/auth-guard"

interface Opportunity {
  id: string
  title: string
  description: string
  company: string
  opportunityType: string
  category: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  } | null
  employmentType: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  } | null
  location: string
  salary: string | null
  requirements: string | null
  isUrgent: boolean
  isRemote: boolean
  allowApplication: boolean
  applicationFormId?: string
  registrationForm?: {
    id: string
    title: string
    description?: string
    sections: any[]
  }
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
  }[]
}

function OpportunityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const opportunityId = params?.id as string
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [applicationForm, setApplicationForm] = useState<any>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  useEffect(() => {
    if (mounted && opportunityId) {
      fetchOpportunity()
      fetchApplicationForm()
    }
  }, [mounted, opportunityId])

  if (!opportunityId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Invalid Opportunity ID</h3>
            <p className="text-muted-foreground mb-4">
              The opportunity ID is missing or invalid.
            </p>
            <Button onClick={() => router.push('/opportunities')}>
              Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/opportunities")
          return
        }
        throw new Error("Failed to fetch opportunity")
      }
      
      const data = await response.json()
      setOpportunity(data)
    } catch (error) {
      console.error("Error fetching opportunity:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicationForm = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`)
      if (response.ok) {
        const data = await response.json()
        setApplicationForm(data.form)
        setHasApplied(data.hasApplied)
      }
    } catch (error) {
      console.error('Error fetching application form:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this opportunity?")) {
      return
    }

    try {
      await deleteOpportunityAction(opportunityId)
      router.push("/opportunities")
    } catch (error) {
      console.error("Error deleting opportunity:", error)
    }
  }

  const handleApplicationSubmit = async (submission: { formId: string; fieldSubmissions: { fieldId: string; value: string }[] }) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      })

      if (response.ok) {
        const result = await response.json()
        setHasApplied(true)
        setShowApplicationForm(false)
        alert('Application submitted successfully!')
        // Refresh the page to show updated application status
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Error submitting application: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
        return 'bg-muted text-foreground dark:bg-gray-900 dark:text-gray-200'
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
        return 'bg-muted text-foreground dark:bg-gray-900 dark:text-gray-200'
    }
  }

  let requirements: string[] = []
  try {
    requirements = opportunity.requirements ? JSON.parse(opportunity.requirements) : []
  } catch (error) {
    console.error('Error parsing requirements for opportunity:', opportunity.id, error)
    requirements = []
  }

  const canEdit = currentUser && (currentUser.id === opportunity.poster.id || currentUser.role === 'admin')

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/40 h-16 flex items-center px-4 md:px-8">
        <Link href="/opportunities">
          <Button variant="ghost" size="sm" className="gap-2 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <div className="ml-auto flex gap-2">
          {canEdit && (
            <>
              <Link href={`/opportunities/${opportunityId}/build-form`}>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 rounded-lg">
                  <FormInput className="h-4 w-4" />
                  Build Form
                </Button>
              </Link>
              <Link href={`/opportunities/${opportunityId}/edit`}>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 rounded-lg">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleDelete} className="gap-2 rounded-lg">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8 p-4 md:p-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Opportunity Header */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{opportunity.title}</h1>
                {opportunity.isUrgent && (
                  <Badge variant="destructive" className="rounded-md">Urgent</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-lg mb-4">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{opportunity.company}</span>
                {opportunity.poster.isVerified && (
                  <Badge variant="secondary" className="ml-2 rounded-md text-xs">Verified</Badge>
                )}
              </div>
            </div>

            {/* Opportunity Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">About this Opportunity</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{opportunity.description}</p>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Requirements</h2>
              <ul className="space-y-3">
                {requirements.map((requirement: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-muted-foreground">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator className="my-8" />

          {/* Company Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">About the Company</h2>
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                <p className="font-semibold text-lg">{opportunity.company}</p>
              </div>
              {opportunity.poster.organization && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Organization</p>
                  <p className="font-medium">{opportunity.poster.organization}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Posted By</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{opportunity.poster.fullName}</p>
                  {opportunity.poster.isVerified && (
                    <Badge variant="secondary" className="text-xs rounded-md">Verified</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Applications Section */}
          {opportunity.applications.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Applications ({opportunity.applications.length})</h2>
                <div className="space-y-3">
                  {opportunity.applications.map((application) => (
                    <div key={application.id} className="bg-card border border-border/40 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{application.applicant.fullName}</span>
                          {application.applicant.isVerified && (
                            <Badge variant="secondary" className="text-xs rounded-md">Verified</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(application.createdAt)}
                        </span>
                      </div>
                      {application.message && (
                        <p className="text-sm text-muted-foreground">{application.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Sidebar with Details & Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Opportunity Details Card */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Employment Type</p>
                <Badge className={`${getOpportunityTypeColor(opportunity.opportunityType)} rounded-lg text-xs`}>
                  {opportunity.opportunityType}
                </Badge>
              </div>

              {opportunity.category && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Category</p>
                  <Badge className={`${getCategoryColor(opportunity.category.name)} rounded-lg text-xs`}>
                    {opportunity.category.name}
                  </Badge>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{opportunity.location}</span>
                </div>
                {opportunity.isRemote && (
                  <Badge variant="outline" className="mt-2 rounded-lg text-xs">Remote</Badge>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Salary</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{opportunity.salary || 'Not specified'}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Posted</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-sm">{formatDate(opportunity.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Application Form Section */}
            {opportunity.registrationForm ? (
              <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FormInput className="h-5 w-5" />
                  Application Form
                </h3>
                {hasApplied ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <h4 className="font-semibold mb-2 text-sm">Application Submitted!</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      The employer will review your application.
                    </p>
                    <Button variant="outline" onClick={() => setShowApplicationForm(true)} className="w-full rounded-lg">
                      View Application
                    </Button>
                  </div>
                ) : showApplicationForm ? (
                  <OpportunityApplicationForm
                    form={opportunity.registrationForm}
                    onSubmit={handleApplicationSubmit}
                    isSubmitting={submitting}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      Custom form required to apply
                    </p>
                    <Button onClick={() => setShowApplicationForm(true)} className="w-full rounded-lg">
                      Start Application
                    </Button>
                  </div>
                )}
              </div>
            ) : opportunity.allowApplication ? (
              <Button className="w-full py-6 rounded-2xl text-base font-semibold" size="lg">
                Apply Now
              </Button>
            ) : null}

            {/* Share & Save Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-lg">
                Save
              </Button>
              <Button variant="outline" className="flex-1 rounded-lg">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrap the entire page with AuthGuard
export default OpportunityDetailPage 
