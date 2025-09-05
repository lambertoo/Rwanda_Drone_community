"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FormInput, CheckCircle } from "lucide-react"
import DynamicApplicationForm from "@/components/opportunities/dynamic-application-form"
import MultiStageApplicationForm from "@/components/opportunities/multi-stage-application-form"
import { AuthGuard } from "@/components/auth-guard"

interface Opportunity {
  id: string
  title: string
  description: string
  company: string
  opportunityType: string
  subType?: string
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
}

function ApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const opportunityId = params.id as string
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [applicationForm, setApplicationForm] = useState<any>(null)
  const [hasApplied, setHasApplied] = useState(false)
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
      } else if (response.status === 401) {
        // User not authenticated, show login prompt
        setApplicationForm(null)
        setHasApplied(false)
      }
    } catch (error) {
      console.error('Error fetching application form:', error)
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
        alert('Application submitted successfully!')
        // Redirect to opportunity details page
        router.push(`/opportunities/${opportunityId}`)
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

  let requirements: string[] = []
  try {
    requirements = opportunity.requirements ? JSON.parse(opportunity.requirements) : []
  } catch (error) {
    console.error('Error parsing requirements for opportunity:', opportunity.id, error)
    requirements = []
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/opportunities/${opportunityId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Apply to {opportunity.title}</h1>
          <p className="text-muted-foreground">{opportunity.company} • {opportunity.location}</p>
        </div>
      </div>

      {/* Opportunity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{opportunity.title}</h3>
              {opportunity.isUrgent && (
                <Badge variant="destructive">Urgent</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{opportunity.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Company:</span> {opportunity.company}
              </div>
              <div>
                <span className="font-medium">Location:</span> {opportunity.location}
                {opportunity.isRemote && <Badge variant="outline" className="ml-2">Remote</Badge>}
              </div>
              <div>
                <span className="font-medium">Type:</span> {opportunity.opportunityType}
                {opportunity.subType && ` (${opportunity.subType})`}
              </div>
              <div>
                <span className="font-medium">Salary:</span> {opportunity.salary || 'Not specified'}
              </div>
            </div>

            {requirements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {requirements.map((requirement: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">{requirement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                <Link href={`/opportunities/${opportunityId}`}>
                  <Button variant="outline">
                    View Opportunity Details
                  </Button>
                </Link>
              </div>
            ) : (
              <MultiStageApplicationForm
                form={applicationForm}
                onSubmit={handleApplicationSubmit}
                isSubmitting={submitting}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FormInput className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {!currentUser ? 'Authentication Required' : 'No Application Form Available'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {!currentUser 
                ? 'Please sign in to view and submit the application form for this opportunity.'
                : 'This opportunity doesn\'t have a custom application form yet. Please contact the employer directly.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              {!currentUser ? (
                <>
                  <Link href="/login">
                    <Button>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/opportunities/${opportunityId}`}>
                    <Button variant="outline">
                      Back to Details
                    </Button>
                  </Link>
                  <Button onClick={() => window.history.back()}>
                    Go Back
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Wrap the entire page with AuthGuard
export default ApplicationPage
