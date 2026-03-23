"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import FormRenderer from "@/components/forms/form-renderer"

export default function EditSubmissionPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/forms/submissions/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Submission not found")
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (values: any) => {
    const res = await fetch(`/api/forms/submissions/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Failed to update")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Submission not found</h2>
          <p className="text-muted-foreground">{error || "This edit link may have expired."}</p>
        </div>
      </div>
    )
  }

  // Pre-populate form with existing values
  const formData = {
    ...data.form,
    settings: data.form.settings || {},
  }

  return (
    <div>
      <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900 px-4 py-2 text-center">
        <p className="text-sm text-amber-800 dark:text-amber-400">
          You are editing a previously submitted response. Changes will update your original submission.
        </p>
      </div>
      <FormRenderer
        formData={formData}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
