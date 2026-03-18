"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import FormRenderer from "@/components/forms/form-renderer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"

interface FormData {
  id?: string
  title: string
  description: string
  sections: any[]
  settings: any
}

export default function PublicFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const formId = params.id as string
  const eventId = searchParams.get("eventId")

  const [formData, setFormData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/public/${formId}`)
        if (response.ok) {
          const data = await response.json()
          const mappedData = {
            ...data,
            id: data.id,
            sections: data.sections?.map((section: any) => ({
              ...section,
              fields: section.fields?.map((field: any) => ({
                ...field,
                required: field.validation?.required || false
              })) || []
            })) || []
          }
          setFormData(mappedData)
        } else {
          setError("Form not found")
        }
      } catch (err) {
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    if (formId) fetchForm()
  }, [formId])

  const handleSubmit = async (values: any) => {
    const response = await fetch(`/api/forms/public/${formId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || "Failed to submit form")
    }

    // If this form is linked to an event, also create the RSVP so registeredCount updates
    if (eventId) {
      await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {}) // silently ignore if already registered or not logged in
      setRegistered(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading form...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 pt-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Form Not Found</h2>
            <p className="text-muted-foreground">{error || "The form you are looking for does not exist or is not available."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // When coming from an event and registered, show event-specific success
  if (registered && eventId) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">You&apos;re Registered!</h2>
            <p className="text-muted-foreground">
              {formData.settings?.confirmationMessage || "Your registration has been received. We look forward to seeing you!"}
            </p>
            <div className="pt-2 flex gap-3 justify-center">
              <Link href={`/events/${eventId}`}>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" /> Back to Event
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="ghost">Browse Events</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <FormRenderer formData={formData} onSubmit={handleSubmit} />
    </div>
  )
}
