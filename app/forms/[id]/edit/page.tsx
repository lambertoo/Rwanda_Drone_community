"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormEditor from "@/components/forms/form-editor"
import { AuthGuard } from "@/components/auth-guard"

interface Form {
  id: string
  title: string
  description?: string
  isActive: boolean
  isPublic: boolean
  sections: any[]
  settings?: any
  _count?: { entries: number }
}

interface SheetStatus {
  configured: boolean
  connected: boolean
  spreadsheetId: string | null
  spreadsheetUrl: string | null
}

export default function EditFormPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [sheetStatus, setSheetStatus] = useState<SheetStatus | null>(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)

  useEffect(() => {
    fetchForm()
    fetchSheetStatus()
  }, [params.id])

  // Sync email toggle state from form settings
  useEffect(() => {
    if (form?.settings?.notifyEmails && form.settings.notifyEmails.length > 0) {
      setEmailEnabled(true)
    } else {
      setEmailEnabled(false)
    }
  }, [form?.settings?.notifyEmails])

  const fetchSheetStatus = async () => {
    try {
      const res = await fetch(`/api/forms/${params.id}/google-sheets`, { credentials: 'include' })
      if (res.ok) setSheetStatus(await res.json())
    } catch {}
  }

  const connectSheet = async () => {
    setSheetLoading(true)
    try {
      const res = await fetch(`/api/forms/${params.id}/google-sheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      })
      if (res.ok) {
        const data = await res.json()
        setSheetStatus({ configured: true, connected: true, spreadsheetId: data.spreadsheetId, spreadsheetUrl: data.spreadsheetUrl })
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to connect')
      }
    } catch {
      alert('Failed to connect Google Sheet')
    } finally {
      setSheetLoading(false)
    }
  }

  const disconnectSheet = async () => {
    if (!confirm('Disconnect Google Sheet? The sheet will remain but new responses won\'t sync.')) return
    setSheetLoading(true)
    try {
      const res = await fetch(`/api/forms/${params.id}/google-sheets`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) setSheetStatus({ configured: true, connected: false, spreadsheetId: null, spreadsheetUrl: null })
    } catch {} finally {
      setSheetLoading(false)
    }
  }

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`, { credentials: 'include' })
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
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

  const toggleAcceptResponses = async () => {
    if (!form) return
    try {
      const newActive = !form.isActive
      const newPublic = newActive
      const res = await fetch(`/api/forms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: newActive, isPublic: newPublic }),
      })
      if (res.ok) {
        setForm({ ...form, isActive: newActive, isPublic: newPublic })
      }
    } catch {}
  }

  const toggleEmailNotifications = async () => {
    if (!form) return
    const newEnabled = !emailEnabled
    try {
      const updatedSettings = { ...(form.settings || {}) }
      if (newEnabled) {
        // Enable: set a placeholder email list so the backend knows to notify
        updatedSettings.notifyEmails = updatedSettings.notifyEmails?.length
          ? updatedSettings.notifyEmails
          : ['default']
      } else {
        // Disable: remove notifyEmails
        delete updatedSettings.notifyEmails
      }
      const res = await fetch(`/api/forms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: updatedSettings }),
      })
      if (res.ok) {
        const updated = await res.json()
        setForm(updated)
        setEmailEnabled(newEnabled)
      }
    } catch {}
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
          <p className="text-muted-foreground mb-4">The form you are looking for does not exist or you do not have access to it.</p>
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

  const responseCount = form._count?.entries ?? 0

  return (
    <AuthGuard>
      {/* Sticky toolbar below main header */}
      <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-3">

          {/* ── Left: Back + Title + Status ── */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Back to forms"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-border/60 select-none">|</span>

            <h2 className="text-sm font-medium truncate max-w-[180px] sm:max-w-[280px]" title={form.title}>
              {form.title}
            </h2>

            <span
              className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                form.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {form.isActive ? 'Accepting responses' : 'Closed'}
            </span>
          </div>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Accept Responses toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleAcceptResponses}
                role="switch"
                aria-checked={form.isActive}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  form.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    form.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
              <span className="text-[11px] text-muted-foreground hidden sm:inline whitespace-nowrap">
                {form.isActive ? 'Active' : 'Closed'}
              </span>
            </div>

            <span className="w-px h-4 bg-border/60 hidden sm:block" />

            {/* Email Notifications toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleEmailNotifications}
                role="switch"
                aria-checked={emailEnabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  emailEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    emailEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
              <span className="text-[11px] text-muted-foreground hidden sm:inline whitespace-nowrap">
                Email alerts
              </span>
            </div>

            <span className="w-px h-4 bg-border/60 hidden sm:block" />

            {/* Google Sheets */}
            {sheetStatus?.connected ? (
              <div className="flex items-center gap-0.5">
                <a
                  href={sheetStatus.spreadsheetUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                  title="Open linked Google Sheet"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18" />
                  </svg>
                  Sheet
                </a>
                <button
                  onClick={disconnectSheet}
                  disabled={sheetLoading}
                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  title="Disconnect Google Sheet"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : sheetStatus?.configured ? (
              <button
                onClick={connectSheet}
                disabled={sheetLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
                title="Connect to Google Sheets"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18" />
                </svg>
                {sheetLoading ? 'Connecting...' : 'Connect Sheets'}
              </button>
            ) : null}

            {sheetStatus && <span className="w-px h-4 bg-border/60 hidden sm:block" />}

            {/* Submissions link */}
            <button
              onClick={() => router.push(`/forms/${params.id}/submissions`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-muted transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="hidden sm:inline">Responses</span>
              <span className="tabular-nums">({responseCount})</span>
            </button>

            {/* Preview button */}
            <button
              onClick={() => window.open(`/forms/public/${params.id}`, '_blank')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-muted transition-colors"
              title="Preview public form"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Editor */}
      <FormEditor
        initialData={form}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </AuthGuard>
  )
}
