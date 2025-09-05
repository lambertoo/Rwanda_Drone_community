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
import { AuthGuard } from "@/components/auth-guard"

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
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
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

  let requirements: string[] = []
  try {
    requirements = opportunity.requirements ? JSON.parse(opportunity.requirements) : []
  } catch (error) {
    console.error('Error parsing requirements for opportunity:', opportunity.id, error)
    requirements = []
  }

  const canEdit = currentUser && (currentUser.id === opportunity.poster.id || currentUser.role === 'admin')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/opportunities">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </Link>
        {canEdit && (
          <div className="flex gap-2 ml-auto">
            <Link href={`/opportunities/${opportunityId}/build-form`}>
              <Button variant="outline" size="sm">
                <FormInput className="h-4 w-4 mr-2" />
                Build Form
              </Button>
            </Link>
            <Link href={`/opportunities/${opportunityId}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Opportunity Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{opportunity.title}</h1>
                  {opportunity.isUrgent && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-lg text-muted-foreground mb-2">
                  <Building2 className="h-5 w-5" />
                  <span>{opportunity.company}</span>
                  {opportunity.poster.isVerified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getOpportunityTypeColor(opportunity.opportunityType)}>
                  {opportunity.opportunityType}
                </Badge>
                <Badge className={getCategoryColor(opportunity.category)}>
                  {opportunity.category}
                </Badge>
              </div>
            </div>

            {/* Opportunity Details */}
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
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Description */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {requirements.map((requirement: string, index: number) => (
                <li key={index} className="text-muted-foreground">{requirement}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>About the Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{opportunity.company}</span>
            </div>
            {opportunity.poster.organization && (
              <div className="text-sm text-muted-foreground">
                {opportunity.poster.organization}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Posted by {opportunity.poster.fullName}
              {opportunity.poster.isVerified && (
                <Badge variant="secondary" className="ml-2">Verified</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications */}
      {opportunity.applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applications ({opportunity.applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunity.applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{application.applicant.fullName}</span>
                      {application.applicant.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
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
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Application Form Section */}
        {applicationForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FormInput className="h-5 w-5" />
                Application Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasApplied ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground mb-4">
                    You have successfully applied to this opportunity. The employer will review your application.
                  </p>
                  <Button variant="outline" onClick={() => setShowApplicationForm(true)}>
                    View Application
                  </Button>
                </div>
              ) : showApplicationForm ? (
                <DynamicApplicationForm
                  form={applicationForm}
                  onSubmit={handleApplicationSubmit}
                  isSubmitting={submitting}
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    This opportunity has a custom application form. Click below to start your application.
                  </p>
                  <Button onClick={() => setShowApplicationForm(true)} className="w-full">
                    Apply Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8">
            <FormInput className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Application Form</h3>
            <p className="text-muted-foreground mb-4">
              This opportunity doesn't have a custom application form yet.
            </p>
            {currentUser && currentUser.id === opportunity?.poster.id && (
              <Link href={`/opportunities/${opportunityId}/build-form`}>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Build Application Form
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Other Action Buttons */}
        <div className="flex gap-4">
          {!applicationForm && (
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Apply Now
            </Button>
          )}
          <Button variant="outline">
            Save Opportunity
          </Button>
          <Button variant="outline">
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}

// Wrap the entire page with AuthGuard
export default OpportunityDetailPage 