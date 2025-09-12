"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import TallyCloneBuilder from "@/components/forms/tally-clone-builder"
import { AuthGuard } from "@/components/auth-guard"

interface Opportunity {
  id: string
  title: string
  company: string
  opportunityType: string
  applicationFormId?: string
}

function BuildOpportunityFormPage() {
  const router = useRouter()
  const params = useParams()
  const opportunityId = params?.id as string
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && opportunityId) {
      fetchOpportunity()
    }
  }, [mounted, opportunityId])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`)
      if (!response.ok) {
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

  const handleSave = async (formData: any) => {
    setSaving(true)
    try {
      // Create the form first
      const formResponse = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!formResponse.ok) {
        throw new Error('Failed to create form')
      }

      const formResult = await formResponse.json()
      
      // Update the opportunity with the form ID
      const updateResponse = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          applicationFormId: formResult.id
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update opportunity')
      }

      // Redirect back to opportunity detail page
      router.push(`/opportunities/${opportunityId}`)
    } catch (error) {
      console.error('Error saving form:', error)
      alert('Failed to save form. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/opportunities/${opportunityId}`)
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="max-w-6xl mx-auto p-6">
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

  return (
    <TallyCloneBuilder
      onSave={handleSave}
      onCancel={handleCancel}
      initialData={{
        title: `${opportunity.title} - Application Form`,
        description: `Apply for the ${opportunity.opportunityType} position at ${opportunity.company}`,
        sections: [
          {
            id: 'section_1',
            title: 'Personal Information',
            description: 'Tell us about yourself',
            fields: [
              {
                id: 'field_1',
                type: 'SHORT_TEXT',
                label: 'Full Name',
                name: 'full_name',
                placeholder: 'Enter your full name',
                required: true,
                validation: { required: true },
                order: 1
              },
              {
                id: 'field_2',
                type: 'EMAIL',
                label: 'Email Address',
                name: 'email',
                placeholder: 'Enter your email address',
                required: true,
                validation: { required: true },
                order: 2
              },
              {
                id: 'field_3',
                type: 'PHONE',
                label: 'Phone Number',
                name: 'phone',
                placeholder: 'Enter your phone number',
                required: false,
                validation: { required: false },
                order: 3
              }
            ]
          }
        ]
      }}
    />
  )
}

export default function BuildOpportunityFormPageWrapper() {
  return (
    <AuthGuard>
      <BuildOpportunityFormPage />
    </AuthGuard>
  )
}