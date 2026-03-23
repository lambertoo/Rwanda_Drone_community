"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormEditor from "@/components/forms/form-editor"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { FORM_TEMPLATES } from "@/lib/form-templates"
import {
  Plus,
  FileText,
  Calendar,
  Briefcase,
  Star,
  Plane,
  UserPlus,
  ClipboardCheck,
  Mail,
  ArrowLeft,
} from "lucide-react"

const ICON_MAP: Record<string, any> = {
  calendar: Calendar,
  briefcase: Briefcase,
  star: Star,
  plane: Plane,
  "user-plus": UserPlus,
  "clipboard-check": ClipboardCheck,
  mail: Mail,
}

export default function NewFormPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)

  const handleSave = async (formData: any) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const form = await response.json()
        router.push(`/forms/${form.id}/edit`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving form:", error)
      alert("Failed to save form")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (showEditor) {
      setShowEditor(false)
      setSelectedTemplate(null)
    } else {
      router.push("/forms")
    }
  }

  const startBlank = () => {
    setSelectedTemplate(null)
    setShowEditor(true)
  }

  const startFromTemplate = (templateData: any) => {
    setSelectedTemplate(templateData)
    setShowEditor(true)
  }

  // Show editor
  if (showEditor) {
    return (
      <AuthGuard>
        <FormEditor
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={selectedTemplate}
        />
      </AuthGuard>
    )
  }

  // Template picker
  const categories = [...new Set(FORM_TEMPLATES.map((t) => t.category))]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.push("/forms")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create a new form</h1>
              <p className="text-sm text-muted-foreground mt-1">Start from scratch or use a template</p>
            </div>
          </div>

          {/* Blank form */}
          <button
            onClick={startBlank}
            className="w-full bg-background rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/[0.02] transition-all p-8 text-center mb-8 group"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Blank form</h3>
            <p className="text-sm text-muted-foreground">Start from scratch with an empty form</p>
          </button>

          {/* Templates by category */}
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FORM_TEMPLATES.filter((t) => t.category === category).map((template) => {
                  const Icon = ICON_MAP[template.icon] || FileText
                  return (
                    <button
                      key={template.id}
                      onClick={() => startFromTemplate(template.data)}
                      className="bg-background rounded-xl border hover:border-primary/50 hover:shadow-md transition-all p-5 text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  )
}
