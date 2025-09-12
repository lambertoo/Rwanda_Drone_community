"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import TallyPublicRenderer from "@/components/forms/tally-public-renderer"

interface OpportunityApplicationFormProps {
  form: {
    id: string
    title: string
    description?: string
    sections: any[]
  }
  onSubmit: (submission: { formId: string; fieldSubmissions: { fieldId: string; value: string }[] }) => void
  isSubmitting?: boolean
}

export default function OpportunityApplicationForm({ form, onSubmit, isSubmitting = false }: OpportunityApplicationFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFormSubmit = (formData: any) => {
    // Convert form data to the expected format
    const fieldSubmissions = Object.entries(formData).map(([fieldId, value]) => ({
      fieldId,
      value: Array.isArray(value) ? JSON.stringify(value) : String(value)
    }))

    onSubmit({
      formId: form.id,
      fieldSubmissions
    })
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Application Submitted Successfully!</h3>
            <p className="text-muted-foreground">
              Thank you for your application. We'll review it and get back to you soon.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        {form.description && (
          <p className="text-muted-foreground">{form.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <TallyPublicRenderer
          form={form}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  )
}