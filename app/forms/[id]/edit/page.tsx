"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import TallyFormBuilder from "@/components/forms/tally-form-builder"
import { AuthGuard } from "@/components/auth-guard"

interface Form {
  id: string
  title: string
  description?: string
  sections: any[]
}

export default function EditFormPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [params.id])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      } else {
        router.push('/forms')
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      router.push('/forms')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: any) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/forms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedForm = await response.json()
        setForm(updatedForm)
        alert('Form saved successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('Failed to save form')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/forms')
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading form...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Form not found</h1>
          <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/forms')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <TallyFormBuilder
        initialData={form}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </AuthGuard>
  )
}
