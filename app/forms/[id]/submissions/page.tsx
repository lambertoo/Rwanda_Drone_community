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
    id: string
    fieldId: string
    value: string
    field: {
      id: string
      label: string
      name: string
      type: string
    }
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (formId) {
      fetchFormAndSubmissions()
    }
  }, [formId])

  const fetchFormAndSubmissions = async () => {
    try {
      setError(null)
      
      // Fetch form details
      const formResponse = await fetch(`/api/forms/${formId}`, {
        credentials: 'include'
      })
      
      if (formResponse.ok) {
        const formData = await formResponse.json()
        // Map the API response to the expected format
        const mappedForm = {
          id: formData.id,
          title: formData.title,
          description: formData.description,
          sections: formData.sections?.map((section: any) => ({
            id: section.id,
            title: section.title,
            fields: section.fields?.map((field: any) => ({
              id: field.id,
              name: field.name,
              label: field.label,
              type: field.type
            })) || []
          })) || []
        }
        setForm(mappedForm)
      } else if (formResponse.status === 401) {
        setError('Authentication required. Please log in to view submissions.')
        return
      } else if (formResponse.status === 404) {
        setError('Form not found.')
        return
      } else {
        setError('Failed to load form details.')
        return
      }

      // Fetch submissions with values
      const submissionsResponse = await fetch(`/api/forms/${formId}/submissions?includeValues=true`, {
        credentials: 'include'
      })
      
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)
      } else if (submissionsResponse.status === 401) {
        setError('Authentication required. Please log in to view submissions.')
        return
      } else {
        setError('Failed to load submissions.')
        return
      }
    } catch (error) {
      console.error('Error fetching form and submissions:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const exportSubmissions = () => {
    if (!form || !submissions || submissions.length === 0) return

    // Create CSV content with table structure
    const fieldHeaders = form.sections?.flatMap(section => 
      section.fields?.map(field => field.label || 'Untitled Field') || []
    ) || []
    
    const headers = ['Submission #', 'Submitted At', ...fieldHeaders]
    
    const csvContent = [
      headers.join(','),
      ...submissions.map((submission, index) => {
        const values = form.sections?.flatMap(section => 
          section.fields?.map(field => {
            const value = submission.values?.find(v => v.field.name === field.name)
            return `"${(value?.value || 'No response').replace(/"/g, '""')}"`
          }) || []
        ) || []
        const submissionNumber = index + 1
        const submittedAt = submission.meta?.submittedAt ? new Date(submission.meta.submittedAt).toLocaleString() : 'Unknown date'
        return [submissionNumber, `"${submittedAt}"`, ...values].join(',')
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

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/login')}>
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
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

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Submission #
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Submitted At
                    </th>
                    {form.sections?.map(section => 
                      section.fields?.map(field => (
                        <th key={field.id} className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          {field.label || 'Untitled Field'}
                        </th>
                      )) || []
                    ).flat()}
                  </tr>
                </thead>
                <tbody>
                  {submissions?.map((submission, index) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {submission.meta?.submittedAt ? new Date(submission.meta.submittedAt).toLocaleString() : 'Unknown date'}
                        </div>
                      </td>
                      {form.sections?.map(section => 
                        section.fields?.map(field => {
                          const value = submission.values?.find(v => v.field.name === field.name)
                          return (
                            <td key={field.id} className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                              <div className="max-w-xs truncate" title={value?.value || 'No response'}>
                                {value?.value || 'No response'}
                              </div>
                            </td>
                          )
                        }) || []
                      ).flat()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
