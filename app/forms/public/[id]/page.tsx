"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import TallyPublicRenderer from "@/components/forms/tally-public-renderer"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface FormData {
  title: string
  description: string
  sections: any[]
  settings: any
}

export default function PublicFormPage() {
  const params = useParams()
  const formId = params.id as string
  const [formData, setFormData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/public/${formId}`)
        if (response.ok) {
          const data = await response.json()
          
          // Map the data to match the expected structure
          const mappedData = {
            ...data,
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
          setError('Form not found')
        }
      } catch (err) {
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    if (formId) {
      fetchForm()
    }
  }, [formId])

  const handleSubmit = async (values: any) => {
    try {
      // Files are already uploaded when selected, so we just submit the form data
      const response = await fetch(`/api/forms/public/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        // Handle successful submission
        console.log('Form submitted successfully')
      } else {
        const errorData = await response.json()
        console.error('Failed to submit form:', errorData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading form...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Form Not Found</h2>
              <p className="text-gray-500">{error || 'The form you are looking for does not exist or is not available.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TallyPublicRenderer formData={formData} onSubmit={handleSubmit} />
    </div>
  )
}
