"use client"

import { useState, useEffect } from "react"
import { FileText, Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import DocumentEditor from "@/components/ui/document-editor"

interface PageData {
  slug: string
  title: string
  content: string
  updatedAt: string | null
}

export default function AdminPagesSettings() {
  const [pages, setPages] = useState<PageData[]>([])
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setPages(data.pages)
        // If no pages exist, create defaults
        if (data.pages.length === 0) {
          // Privacy and terms will be auto-created on first GET
          const [p, t] = await Promise.all([
            fetch("/api/pages/privacy").then(r => r.json()),
            fetch("/api/pages/terms").then(r => r.json()),
          ])
          // Save them
          await Promise.all([
            fetch("/api/admin/pages/privacy", {
              method: "PUT", credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: p.title, content: p.content }),
            }),
            fetch("/api/admin/pages/terms", {
              method: "PUT", credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: t.title, content: t.content }),
            }),
          ])
          const res2 = await fetch("/api/admin/pages", { credentials: "include" })
          if (res2.ok) {
            const data2 = await res2.json()
            setPages(data2.pages)
          }
        }
        if (!activeSlug && data.pages.length > 0) {
          setActiveSlug(data.pages[0].slug)
        }
      }
    } catch {}
    finally { setLoading(false) }
  }

  const current = pages.find(p => p.slug === activeSlug)

  function updateField(field: "title" | "content", value: string) {
    setPages(prev => prev.map(p =>
      p.slug === activeSlug ? { ...p, [field]: value } : p
    ))
    setStatus("idle")
  }

  async function save() {
    if (!current) return
    setSaving(true)
    setStatus("idle")
    try {
      const r = await fetch(`/api/admin/pages/${activeSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: current.title, content: current.content }),
      })
      setStatus(r.ok ? "saved" : "error")
      if (r.ok) setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
    } finally {
      setSaving(false)
    }
  }

  async function createPage() {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle.trim(), slug: newSlug.trim() || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setShowNewForm(false)
        setNewTitle("")
        setNewSlug("")
        await fetchPages()
        setActiveSlug(data.slug)
      } else {
        const err = await res.json()
        alert(err.error || "Failed to create page")
      }
    } catch {
      alert("Failed to create page")
    } finally {
      setCreating(false)
    }
  }

  async function deletePage(slug: string) {
    if (!confirm(`Delete the "${pages.find(p => p.slug === slug)?.title}" page? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, { method: "DELETE", credentials: "include" })
      if (res.ok) {
        if (activeSlug === slug) setActiveSlug(null)
        await fetchPages()
      } else {
        const err = await res.json()
        alert(err.error || "Failed to delete page")
      }
    } catch {}
  }

  const isCorePage = (slug: string) => ["privacy", "terms"].includes(slug)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Legal & Custom Pages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage legal pages and create custom pages. Custom pages will appear in the footer under Guidelines.
        </p>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {pages.map(p => (
          <div key={p.slug} className="flex items-center gap-0">
            <button
              onClick={() => { setActiveSlug(p.slug); setStatus("idle") }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                activeSlug === p.slug
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background hover:bg-muted border-border hover:border-primary/30"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              {p.title || p.slug}
              {isCorePage(p.slug) && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0">Core</Badge>
              )}
            </button>
            {!isCorePage(p.slug) && activeSlug !== p.slug && (
              <button
                onClick={() => deletePage(p.slug)}
                className="p-1 ml-0.5 rounded hover:bg-red-50 text-muted-foreground/40 hover:text-red-600 transition-colors"
                title="Delete page"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Add page button */}
        {showNewForm ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background">
            <input
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value)
                setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
              }}
              placeholder="Page title..."
              className="text-xs bg-transparent border-none outline-none w-32"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") createPage(); if (e.key === "Escape") setShowNewForm(false) }}
            />
            <span className="text-[10px] text-muted-foreground">/{newSlug || "..."}</span>
            <button onClick={createPage} disabled={creating || !newTitle.trim()} className="p-1 rounded hover:bg-primary/10 text-primary">
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setShowNewForm(false); setNewTitle(""); setNewSlug("") }} className="p-1 rounded hover:bg-muted text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-dashed border-border hover:border-primary/30 hover:bg-muted transition-all text-muted-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Page
          </button>
        )}
      </div>

      {/* Editor */}
      {current ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Page Title</label>
            <input
              value={current.title}
              onChange={e => updateField("title", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <DocumentEditor
            value={current.content}
            onChange={(html) => updateField("content", html)}
            label="Content"
            placeholder="Write or upload your page content..."
            minHeight={400}
          />

          {/* Action bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-70"
              style={{ background: "linear-gradient(135deg,#003366,#0066B3)" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href={`/${activeSlug}`}
              target="_blank"
              className="text-xs text-primary hover:underline"
            >
              View live page
            </Link>

            {status === "saved" && (
              <span className="flex items-center gap-1.5 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5" /> Failed
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Select a page to edit, or create a new one.
        </div>
      )}
    </div>
  )
}
