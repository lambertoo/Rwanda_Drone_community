"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface NewResourceState {
  title: string
  description: string
  category: string
  isRegulation: boolean
  fileUrl: string
  file?: File | null
}

interface ResourceItem {
  id: string
  title: string
  description?: string
  category: string
  fileUrl: string
  fileType: string
  fileSize?: string
  isRegulation: boolean
  downloads: number
  views: number
  uploadedAt: string
  uploadedBy: { fullName: string }
}

export default function ResourcesPage() {
  const [loading, setLoading] = useState(true)
  const { user: currentUser, loading: authLoading } = useAuth()

  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [activeCategory, setActiveCategory] = useState<'all'|'REGULATIONS'|'SAFETY'|'TEMPLATES'|'TUTORIALS'>('all')
  const [newResource, setNewResource] = useState<NewResourceState>({
    title: "",
    description: "",
    category: "",
    isRegulation: false,
    fileUrl: "",
    file: null,
  })

  useEffect(() => {
    const init = async () => {
      await fetchResources()
      setLoading(false)
    }
    init()
  }, [])

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources')
      if (res.ok) {
        const data = await res.json()
        setResources(data.resources || [])
      }
    } catch {}
  }

  const handleChange = (field: keyof NewResourceState, value: any) => {
    setNewResource(prev => ({ ...prev, [field]: value }))
  }

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    if (!file) {
      setNewResource(prev => ({ ...prev, file: null }))
      return
    }
    // Upload file using the same API as projects
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'resource')
      fd.append('entityId', 'temp')
      fd.append('subfolder', 'files')

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Upload failed (${res.status})`)
      }
      const result = await res.json()
      // Use uploaded URL so it opens correctly
      setNewResource(prev => ({ ...prev, file: null, fileUrl: result.fileUrl }))
    } catch (err: any) {
      alert(err?.message || 'File upload failed')
      setNewResource(prev => ({ ...prev, file: null }))
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert("Please log in to share a resource.")
      return
    }

    if (!newResource.title || !newResource.category || (!newResource.file && !newResource.fileUrl)) {
      alert("Please fill all required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const body = {
        title: newResource.title,
        description: newResource.description,
        category: newResource.category,
        isRegulation: newResource.isRegulation,
        fileUrl: newResource.file ? newResource.file.name : newResource.fileUrl,
        fileUpload: newResource.file ? newResource.file.name : undefined,
      }

      const res = await fetch("/api/resources", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      // Reset form and hide
      setNewResource({ title: "", description: "", category: "", isRegulation: false, fileUrl: "", file: null })
      setShowAddForm(false)
      alert("Resource shared successfully.")
      // Refresh list
      await fetchResources()
    } catch (err: any) {
      alert(err?.message || "Failed to share resource.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = (r: ResourceItem) => {
    const href = r.fileUrl
    if (href.startsWith('http')) {
      window.open(href, '_blank')
      return
    }
    const a = document.createElement('a')
    a.href = href
    a.download = r.title
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resources & Downloads</h1>
          <p className="text-sm text-gray-500">Essential documents, guides, and tutorials for drone operators in Rwanda</p>
        </div>
        {currentUser && (
          <button
            type="button"
            onClick={() => setShowAddForm(v => !v)}
            className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            {showAddForm ? "Cancel" : "Share Resource"}
          </button>
        )}
      </div>

      {showAddForm && currentUser && (
        <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Resource Title *</label>
            <input id="title" className="w-full border rounded px-3 py-2"
              value={newResource.title} onChange={(e) => handleChange("title", e.target.value)} required />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea id="description" rows={3} className="w-full border rounded px-3 py-2"
              value={newResource.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File (upload name used) or URL *</label>
            <input type="file" onChange={onFileChange} className="block mb-2" />
            <input
              type="text"
              placeholder="https://example.com/file.pdf"
              className="w-full border rounded px-3 py-2"
              value={newResource.fileUrl}
              onChange={(e) => handleChange("fileUrl", e.target.value)}
              disabled={newResource.fileUrl.startsWith('/uploads/')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select className="w-full border rounded px-3 py-2" required
              value={newResource.category} onChange={(e) => handleChange("category", e.target.value)}>
              <option value="" disabled>Select category</option>
              <option value="REGULATIONS">Regulations</option>
              <option value="SAFETY">Safety</option>
              <option value="TEMPLATES">Templates</option>
              <option value="TUTORIALS">Tutorials</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input id="isRegulation" type="checkbox"
              checked={newResource.isRegulation}
              onChange={(e) => handleChange("isRegulation", e.target.checked)} />
            <label htmlFor="isRegulation" className="text-sm">This is a regulation resource</label>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded border">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
              {isSubmitting ? "Sharing..." : "Share Resource"}
            </button>
          </div>
        </form>
      )}

      {!currentUser && (
        <p className="text-sm text-gray-600">Log in to share a resource.</p>
      )}

      {/* Resource list can be added back later */}
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 mt-2 bg-gray-100 rounded-md p-1 w-full max-w-xl">
        {[
          {key:'all',label:'All'},
          {key:'REGULATIONS',label:'Regulations'},
          {key:'SAFETY',label:'Safety'},
          {key:'TEMPLATES',label:'Templates'},
          {key:'TUTORIALS',label:'Tutorials'},
        ].map((t:any) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveCategory(t.key)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${activeCategory===t.key ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 mt-4 min-w-0">
        {resources.length === 0 ? (
          <p className="text-sm text-gray-600">No resources yet.</p>
        ) : (
          <ul className="space-y-3">
            {resources
              .filter(r => activeCategory==='all' ? true : r.category === activeCategory)
              .map((r) => (
              <li key={r.id} className="p-4 border rounded-md bg-white flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  {r.description && (
                    <div className="text-sm text-gray-600 line-clamp-2 mt-1">{r.description}</div>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                    {r.fileType && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100">{r.fileType}</span>}
                    {r.fileSize && <span>{r.fileSize}</span>}
                    <span>{r.downloads} downloads</span>
                    <span>Updated {new Date(r.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(r)}
                  className="h-9 px-3 rounded-md border text-sm hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}