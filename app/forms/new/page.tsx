"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import TallyCloneBuilder from "@/components/forms/tally-clone-builder"
import { AuthGuard } from "@/components/auth-guard"

export default function NewFormPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (formData: any) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const form = await response.json()
        router.push(`/forms/${form.id}/edit`)
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

  return (
    <AuthGuard>
      <TallyCloneBuilder
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </AuthGuard>
  )
}