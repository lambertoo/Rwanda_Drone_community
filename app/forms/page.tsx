"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  Users,
  Calendar,
  ExternalLink,
  ClipboardList
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

interface Form {
  id: string
  title: string
  slug: string
  description?: string
  isActive: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
  sections: any[]
  _count: {
    entries: number
  }
}

export default function FormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      } else {
        console.log('Forms API returned:', response.status)
        setForms([])
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
      setForms([])
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setForms(forms.filter(form => form.id !== formId))
      }
    } catch (error) {
      console.error('Error deleting form:', error)
    }
  }

  const toggleFormStatus = async (formId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setForms(forms.map(form => 
          form.id === formId ? { ...form, isActive: !isActive } : form
        ))
      }
    } catch (error) {
      console.error('Error updating form:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading forms...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Forms</h1>
            <p className="text-gray-600">Create and manage your forms</p>
          </div>
          <Button onClick={() => router.push('/forms/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Form
          </Button>
        </div>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
              <p className="text-gray-600 mb-4">Create your first form to get started</p>
              <Button onClick={() => router.push('/forms/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <CardTitle className="text-lg pr-3">{form.title}</CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant={form.isActive ? "default" : "secondary"}>
                        {form.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {form.isPublic && (
                        <Badge variant="outline">Public</Badge>
                      )}
                    </div>
                  </div>
                  {form.description && (
                    <p className="text-sm text-gray-600">{form.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>{form.sections.length} sections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{form._count.entries} responses</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created {new Date(form.createdAt).toLocaleDateString()}
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/forms/${form.slug}`)}
                          className="flex-1 min-w-0"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/forms/${form.id}/edit`)}
                          className="flex-1 min-w-0"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/forms/public/${form.id}`, '_blank')}
                          className="flex-1 min-w-0"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Public
                        </Button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/forms/${form.id}/submissions`)}
                          className="flex-1 min-w-0"
                        >
                          <ClipboardList className="w-4 h-4 mr-1" />
                          Submissions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFormStatus(form.id, form.isActive)}
                          className="flex-1 min-w-0"
                        >
                          {form.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteForm(form.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}