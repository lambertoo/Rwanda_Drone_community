"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Calendar,
  User,
  FileText
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

interface FormSubmission {
  id: string
  formId: string
  meta: {
    submittedAt: string
    userAgent?: string
    referrer?: string
  }
  values: {
    fieldName: string
    value: string
  }[]
}

interface Form {
  id: string
  title: string
  description?: string
  sections: {
    id: string
    title: string
    fields: {
      id: string
      name: string
      label: string
      type: string
    }[]
  }[]
}

export default function FormSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFormAndSubmissions()
  }, [formId])

  const fetchFormAndSubmissions = async () => {
    try {
      // Fetch form details
      const formResponse = await fetch(`/api/forms/${formId}`, {
        credentials: 'include'
      })
      if (formResponse.ok) {
        const formData = await formResponse.json()
        setForm(formData)
      }

      // Fetch submissions
      const submissionsResponse = await fetch(`/api/forms/${formId}/submissions`, {
        credentials: 'include'
      })
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)
      }
    } catch (error) {
      console.error('Error fetching form and submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportSubmissions = () => {
    if (!form || submissions.length === 0) return

    // Create CSV content
    const headers = form.sections.flatMap(section => 
      section.fields.map(field => field.label)
    )
    
    const csvContent = [
      ['Submission ID', 'Submitted At', ...headers].join(','),
      ...submissions.map(submission => {
        const values = form.sections.flatMap(section => 
          section.fields.map(field => {
            const value = submission.values.find(v => v.fieldName === field.name)
            return `"${(value?.value || '').replace(/"/g, '""')}"`
          })
        )
        return [submission.id, submission.meta.submittedAt, ...values].join(',')
      })
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title}-submissions.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading submissions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Form Submissions</h1>
              {form && (
                <p className="text-gray-600">{form.title}</p>
              )}
            </div>
          </div>
          {submissions.length > 0 && (
            <Button onClick={exportSubmissions}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {!form ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Form not found</h3>
              <p className="text-gray-600">The form you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-gray-600 mb-4">This form hasn't received any submissions yet.</p>
              <Button onClick={() => window.open(`/forms/public/${form.id}`, '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                View Public Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="default">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Submission #{index + 1}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(submission.meta.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.sections.map(section => (
                        <div key={section.id} className="space-y-3">
                          <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                            {section.title}
                          </h4>
                          {section.fields.map(field => {
                            const value = submission.values.find(v => v.fieldName === field.name)
                            return (
                              <div key={field.id} className="space-y-1">
                                <label className="text-sm font-medium text-gray-600">
                                  {field.label}
                                </label>
                                <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                                  {value?.value || 'No response'}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
