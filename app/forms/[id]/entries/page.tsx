"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Download, 
  Calendar,
  User,
  Eye,
  X
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

interface FormValue {
  id: string
  field: {
    id: string
    label: string
    name: string
    type: string
  }
  value: string
}

interface FormEntry {
  id: string
  createdAt: string
  ip?: string
  meta?: any
  user?: {
    id: string
    username: string
    fullName: string
    email: string
  }
  values: FormValue[]
}

interface Form {
  id: string
  title: string
  sections: any[]
}

export default function FormEntriesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [entries, setEntries] = useState<FormEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null)

  useEffect(() => {
    fetchForm()
    fetchEntries()
  }, [params.id])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      }
    } catch (error) {
      console.error('Error fetching form:', error)
    }
  }

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}/entries`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!form || entries.length === 0) return

    // Get all field names from the form
    const allFields = form.sections.flatMap(section => section.fields)
    const fieldNames = allFields.map(field => field.label)
    
    // Create CSV header
    const headers = ['Submitted At', 'User', 'Email', ...fieldNames]
    
    // Create CSV rows
    const rows = entries.map(entry => {
      const userInfo = entry.user ? `${entry.user.fullName} (${entry.user.username})` : 'Anonymous'
      const email = entry.user?.email || 'N/A'
      const submittedAt = new Date(entry.createdAt).toLocaleString()
      
      const fieldValues = allFields.map(field => {
        const value = entry.values.find(v => v.field.name === field.name)
        return value ? value.value : ''
      })
      
      return [submittedAt, userInfo, email, ...fieldValues]
    })
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title}_entries.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatValue = (value: string, type: string) => {
    if (type === 'FILE' && value.startsWith('{')) {
      try {
        const fileData = JSON.parse(value)
        return `${fileData.name} (${(fileData.size / 1024).toFixed(1)} KB)`
      } catch {
        return value
      }
    }
    return value
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading entries...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/forms')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forms
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{form?.title} - Entries</h1>
              <p className="text-gray-600">{entries.length} responses</p>
            </div>
          </div>
          <Button onClick={exportToCSV} disabled={entries.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
              <p className="text-gray-600">Share your form to start collecting responses.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {entry.user ? entry.user.fullName : 'Anonymous'}
                        </span>
                        {entry.user && (
                          <Badge variant="outline">{entry.user.username}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(entry.createdAt).toLocaleString()}</span>
                        </div>
                        {entry.ip && (
                          <span>IP: {entry.ip}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entry.values.slice(0, 6).map((value) => (
                      <div key={value.id} className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">
                          {value.field.label}
                        </p>
                        <p className="text-sm">
                          {formatValue(value.value, value.field.type)}
                        </p>
                      </div>
                    ))}
                    {entry.values.length > 6 && (
                      <div className="text-sm text-gray-500">
                        +{entry.values.length - 6} more fields
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Entry Details Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Response Details</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>
                          {selectedEntry.user ? selectedEntry.user.fullName : 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedEntry.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEntry(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {form?.sections.map((section) => (
                    <div key={section.id} className="space-y-4">
                      <div className="border-b pb-2">
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        {section.description && (
                          <p className="text-sm text-gray-600">{section.description}</p>
                        )}
                      </div>
                      <div className="space-y-4">
                        {section.fields.map((field) => {
                          const value = selectedEntry.values.find(v => v.field.name === field.name)
                          return (
                            <div key={field.id} className="space-y-1">
                              <p className="text-sm font-medium text-gray-600">
                                {field.label}
                              </p>
                              <p className="text-sm">
                                {value ? formatValue(value.value, field.type) : 'No response'}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
