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
  const slug = params.slug as string
  const [formData, setFormData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/public/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setFormData(data)
        } else {
          setError('Form not found')
        }
      } catch (err) {
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchForm()
    }
  }, [slug])

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch(`/api/forms/public/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      return await response.json()
    } catch (error) {
      console.error('Submission error:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
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
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
              <p className="text-gray-600">{error || 'The form you are looking for does not exist.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TallyPublicRenderer
      formData={formData}
      onSubmit={handleSubmit}
    />
  )
}
