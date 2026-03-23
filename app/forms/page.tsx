"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  ExternalLink,
  ClipboardList,
  Copy,
  Link2,
  MoreHorizontal,
  FileText,
  ToggleLeft,
  ToggleRight,
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
  settings?: any
  _count: { entries: number }
}

export default function FormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms", { credentials: "include" })
      if (response.ok) setForms(await response.json())
      else setForms([])
    } catch {
      setForms([])
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form and all its submissions?")) return
    try {
      const res = await fetch(`/api/forms/${formId}`, { method: "DELETE" })
      if (res.ok) setForms(forms.filter((f) => f.id !== formId))
    } catch {}
  }

  const toggleStatus = async (formId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) setForms(forms.map((f) => (f.id === formId ? { ...f, isActive: !isActive } : f)))
    } catch {}
  }

  const duplicateForm = async (form: Form) => {
    try {
      const res = await fetch(`/api/forms/${form.id}`, { credentials: "include" })
      if (!res.ok) return
      const original = await res.json()

      const newForm = {
        title: `${form.title} (Copy)`,
        description: form.description,
        settings: original.settings,
        sections: original.sections?.map((s: any) => ({
          title: s.title,
          description: s.description,
          fields: s.fields?.map((f: any) => ({
            type: f.type,
            label: f.label,
            name: f.name,
            placeholder: f.placeholder,
            required: f.validation?.required || false,
            options: f.options,
            validation: f.validation,
            conditional: f.conditional,
            order: f.order,
          })) || [],
        })) || [],
      }

      const createRes = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      })

      if (createRes.ok) fetchForms()
    } catch {}
  }

  const copyLink = (formId: string) => {
    const url = `${window.location.origin}/forms/public/${formId}`
    navigator.clipboard.writeText(url)
    setCopiedId(formId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Forms</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {forms.length} form{forms.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button onClick={() => router.push("/forms/new")}>
              <Plus className="w-4 h-4 mr-1.5" /> Create form
            </Button>
          </div>

          {/* Empty State */}
          {forms.length === 0 ? (
            <div className="bg-background rounded-2xl border p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first form to start collecting responses from your community.
              </p>
              <Button onClick={() => router.push("/forms/new")}>
                <Plus className="w-4 h-4 mr-1.5" /> Create your first form
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {forms.map((form) => {
                const totalFields = form.sections?.reduce(
                  (sum: number, s: any) => sum + (s.fields?.length || s._count?.fields || 0),
                  0
                ) || 0

                return (
                  <div
                    key={form.id}
                    className="bg-background rounded-xl border hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Status indicator */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${form.isActive ? "bg-green-500" : "bg-gray-300"}`} />

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={() => router.push(`/forms/${form.id}/edit`)}
                          >
                            {form.title}
                          </h3>
                          {!form.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{form._count.entries} response{form._count.entries !== 1 ? "s" : ""}</span>
                          <span>·</span>
                          <span>{form.sections?.length || 0} section{(form.sections?.length || 0) !== 1 ? "s" : ""}</span>
                          <span>·</span>
                          <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/forms/${form.id}/submissions`)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View submissions"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/forms/public/${form.id}`, "_blank")}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Open public form"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyLink(form.id)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy link"
                        >
                          {copiedId === form.id ? (
                            <span className="text-xs text-green-600 font-medium px-1">Copied!</span>
                          ) : (
                            <Link2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => router.push(`/forms/${form.id}/edit`)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit form"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* More menu */}
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpen(menuOpen === form.id ? null : form.id)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {menuOpen === form.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 w-44 bg-popover border rounded-lg shadow-lg z-50 py-1">
                                <button
                                  onClick={() => { duplicateForm(form); setMenuOpen(null) }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Duplicate
                                </button>
                                <button
                                  onClick={() => { toggleStatus(form.id, form.isActive); setMenuOpen(null) }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  {form.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                  {form.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <div className="border-t my-1" />
                                <button
                                  onClick={() => { deleteForm(form.id); setMenuOpen(null) }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
