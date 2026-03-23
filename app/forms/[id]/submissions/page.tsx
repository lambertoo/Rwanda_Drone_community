"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  FileText,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  BarChart3,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

interface FieldInfo {
  id: string
  label: string
  name: string
  type: string
}

interface FormSubmission {
  id: string
  formId: string
  createdAt: string
  meta: any
  values: {
    id: string
    fieldId: string
    value: string | null
    field: FieldInfo
  }[]
}

interface Form {
  id: string
  title: string
  description?: string
  sections: {
    id: string
    title: string
    fields: FieldInfo[]
  }[]
}

type SortDir = "asc" | "desc"

export default function FormSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<string>("_date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailId, setDetailId] = useState<string | null>(null)
  const [tab, setTab] = useState<"table" | "summary">("table")

  useEffect(() => {
    if (formId) fetchAll()
  }, [formId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    try {
      setError(null)
      const [formRes, subRes] = await Promise.all([
        fetch(`/api/forms/${formId}`, { credentials: "include" }),
        fetch(`/api/forms/${formId}/submissions?includeValues=true`, { credentials: "include" }),
      ])

      if (!formRes.ok) {
        setError(formRes.status === 401 ? "Please log in." : "Form not found.")
        return
      }
      if (!subRes.ok) {
        setError("Failed to load submissions.")
        return
      }

      const formData = await formRes.json()
      setForm({
        id: formData.id,
        title: formData.title,
        description: formData.description,
        sections: formData.sections?.map((s: any) => ({
          id: s.id,
          title: s.title,
          fields: s.fields?.map((f: any) => ({ id: f.id, name: f.name, label: f.label, type: f.type })) || [],
        })) || [],
      })

      setSubmissions(await subRes.json())
    } catch {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }

  // All fields flattened
  const allFields = useMemo(() => form?.sections?.flatMap((s) => s.fields) || [], [form])

  // Get cell value
  const getCellValue = (submission: FormSubmission, fieldName: string): string => {
    const val = submission.values?.find((v) => v.field.name === fieldName)
    return val?.value || ""
  }

  // Filtered & sorted
  const processed = useMemo(() => {
    let list = [...submissions]

    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) =>
        s.values?.some((v) => v.value?.toLowerCase().includes(q)) ||
        new Date(s.meta?.submittedAt || s.createdAt).toLocaleString().toLowerCase().includes(q)
      )
    }

    // Sort
    list.sort((a, b) => {
      let va: string, vb: string
      if (sortField === "_date") {
        va = a.meta?.submittedAt || a.createdAt || ""
        vb = b.meta?.submittedAt || b.createdAt || ""
      } else {
        va = getCellValue(a, sortField)
        vb = getCellValue(b, sortField)
      }
      const cmp = va.localeCompare(vb, undefined, { numeric: true })
      return sortDir === "asc" ? cmp : -cmp
    })

    return list
  }, [submissions, search, sortField, sortDir]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />
  }

  // Selection
  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === processed.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(processed.map((s) => s.id)))
    }
  }

  // Delete
  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} submission${ids.length > 1 ? "s" : ""}?`)) return
    try {
      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ submissionIds: ids }),
      })
      if (res.ok) {
        setSubmissions(submissions.filter((s) => !ids.includes(s.id)))
        setSelected(new Set())
        setDetailId(null)
      }
    } catch {
      alert("Failed to delete.")
    }
  }

  // Export
  const exportCSV = () => {
    if (!form || processed.length === 0) return
    const headers = ["#", "Submitted At", ...allFields.map((f) => f.label)]
    const rows = processed.map((s, i) => {
      const date = s.meta?.submittedAt ? new Date(s.meta.submittedAt).toLocaleString() : ""
      const vals = allFields.map((f) => `"${(getCellValue(s, f.name) || "").replace(/"/g, '""')}"`)
      return [i + 1, `"${date}"`, ...vals].join(",")
    })
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${form.title}-submissions.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Detail modal
  const detailSubmission = submissions.find((s) => s.id === detailId)

  // Summary stats
  const summaryData = useMemo(() => {
    if (!allFields.length || !submissions.length) return []
    return allFields.map((field) => {
      const values = submissions
        .map((s) => getCellValue(s, field.name))
        .filter(Boolean)
      const counts: Record<string, number> = {}
      values.forEach((v) => {
        // For choice fields, count each option
        try {
          const arr = JSON.parse(v)
          if (Array.isArray(arr)) {
            arr.forEach((item: string) => { counts[item] = (counts[item] || 0) + 1 })
            return
          }
        } catch {}
        counts[v] = (counts[v] || 0) + 1
      })
      return { field, totalResponses: values.length, counts }
    })
  }, [allFields, submissions]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{form?.title || "Submissions"}</h1>
                <p className="text-xs text-muted-foreground">{submissions.length} response{submissions.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <Button size="sm" variant="destructive" onClick={() => handleDelete(Array.from(selected))}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete ({selected.size})
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={exportCSV} disabled={processed.length === 0}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Tabs + Search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setTab("table")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === "table" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1.5" />Responses
              </button>
              <button
                onClick={() => setTab("summary")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === "summary" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />Summary
              </button>
            </div>
            {tab === "table" && (
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search responses..."
                  className="pl-9 h-9"
                />
              </div>
            )}
          </div>

          {/* Table Tab */}
          {tab === "table" && (
            <>
              {processed.length === 0 ? (
                <div className="bg-background rounded-xl border p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium mb-1">{submissions.length === 0 ? "No responses yet" : "No matching responses"}</p>
                  <p className="text-sm text-muted-foreground">
                    {submissions.length === 0 ? "Share your form to start collecting responses." : "Try a different search term."}
                  </p>
                </div>
              ) : (
                <div className="bg-background rounded-xl border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="w-10 px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selected.size === processed.length && processed.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded"
                            />
                          </th>
                          <th className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap" onClick={() => toggleSort("_date")}>
                            Date <SortIcon field="_date" />
                          </th>
                          {allFields.map((field) => (
                            <th
                              key={field.id}
                              className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                              onClick={() => toggleSort(field.name)}
                            >
                              {field.label} <SortIcon field={field.name} />
                            </th>
                          ))}
                          <th className="w-10 px-3 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {processed.map((submission) => (
                          <tr
                            key={submission.id}
                            className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${selected.has(submission.id) ? "bg-primary/5" : ""}`}
                            onClick={() => setDetailId(submission.id)}
                          >
                            <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selected.has(submission.id)}
                                onChange={() => toggleSelect(submission.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                              {new Date(submission.meta?.submittedAt || submission.createdAt).toLocaleDateString()}{" "}
                              <span className="text-xs">{new Date(submission.meta?.submittedAt || submission.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </td>
                            {allFields.map((field) => {
                              const val = getCellValue(submission, field.name)
                              return (
                                <td key={field.id} className="px-3 py-3 max-w-[200px] truncate" title={val}>
                                  {val || <span className="text-muted-foreground/40">—</span>}
                                </td>
                              )
                            })}
                            <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDelete([submission.id])}
                                className="p-1 rounded hover:bg-red-50 text-muted-foreground/40 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Summary Tab */}
          {tab === "summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-xl border p-5">
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                  <p className="text-3xl font-bold mt-1">{submissions.length}</p>
                </div>
                <div className="bg-background rounded-xl border p-5">
                  <p className="text-sm text-muted-foreground">Last Response</p>
                  <p className="text-lg font-semibold mt-1">
                    {submissions.length > 0
                      ? new Date(submissions[0].meta?.submittedAt || submissions[0].createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="bg-background rounded-xl border p-5">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold mt-1">
                    {submissions.length > 0
                      ? Math.round(
                          (submissions.filter((s) => s.values?.some((v) => v.value)).length / submissions.length) * 100
                        )
                      : 0}%
                  </p>
                </div>
              </div>

              {summaryData.map(({ field, totalResponses, counts }) => (
                <div key={field.id} className="bg-background rounded-xl border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{field.label}</h3>
                    <Badge variant="outline">{totalResponses} responses</Badge>
                  </div>
                  {Object.keys(counts).length > 0 && Object.keys(counts).length <= 20 ? (
                    <div className="space-y-2">
                      {Object.entries(counts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([value, count]) => (
                          <div key={value} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm truncate max-w-[300px]">{value}</span>
                                <span className="text-xs text-muted-foreground">{count} ({Math.round((count / totalResponses) * 100)}%)</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${(count / totalResponses) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{totalResponses} unique text responses</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {detailSubmission && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end">
            <div className="w-full max-w-md h-full bg-background border-l shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between z-10">
                <h3 className="font-semibold">Response Detail</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { handleDelete([detailSubmission.id]) }}
                    className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDetailId(null)} className="p-1.5 rounded hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(detailSubmission.meta?.submittedAt || detailSubmission.createdAt).toLocaleString()}
                </div>
                {allFields.map((field) => {
                  const val = getCellValue(detailSubmission, field.name)
                  return (
                    <div key={field.id} className="border-b pb-3">
                      <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                      <p className="text-sm whitespace-pre-wrap">{val || <span className="text-muted-foreground/40 italic">No response</span>}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
