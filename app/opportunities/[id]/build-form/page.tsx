"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, FormInput, Users, CheckCircle } from "lucide-react"
import FormBuilder from "@/components/opportunities/form-builder"

interface Opportunity {
  id: string
  title: string
  company: string
  poster: {
    id: string
    fullName: string
  }
}

interface ApplicationForm {
  id: string
  title: string
  description?: string
  fields: any[]
}

export default function BuildFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: opportunityId } = use(params)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [existingForm, setExistingForm] = useState<ApplicationForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchOpportunity()
    fetchExistingForm()
  }, [opportunityId])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`)
      if (response.ok) {
        const data = await response.json()
        setOpportunity(data)
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingForm = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/application-form`)
      if (response.ok) {
        const data = await response.json()
        setExistingForm(data)
      }
    } catch (error) {
      // Form doesn't exist yet, which is fine
    }
  }

  const handleSaveForm = async (formData: { title: string; description: string; fields: any[] }) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/application-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setExistingForm(result)
        alert('Application form saved successfully!')
        router.push(`/opportunities/${opportunityId}`)
      } else {
        const error = await response.json()
        alert(`Error saving form: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('Failed to save form. Please try again.')
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Build Application Form</h1>
        <p className="text-lg text-muted-foreground">
          Create a custom application form for your opportunity
        </p>
      </div>

      {/* Opportunity Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FormInput className="h-5 w-5" />
            Opportunity Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{opportunity.title}</h4>
              <p className="text-muted-foreground">{opportunity.company}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Posted by</p>
              <p className="font-medium">{opportunity.poster.fullName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Builder */}
      <FormBuilder
        opportunityId={opportunityId}
        onSave={handleSaveForm}
        initialForm={existingForm}
      />

      {/* Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Form Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FormInput className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Multiple Field Types</h4>
              <p className="text-sm text-muted-foreground">
                Text, email, phone, number, select, radio, checkbox, date, file upload, and more
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Conditional Logic</h4>
              <p className="text-sm text-muted-foreground">
                Show/hide fields, make required/optional based on other field values
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Easy Applications</h4>
              <p className="text-sm text-muted-foreground">
                Applicants get a dynamic, user-friendly form that adapts to their responses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 