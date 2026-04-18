"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormEditor from "@/components/forms/form-editor"
import { AuthGuard } from "@/components/auth-guard"
import CollaborationPanel from "@/components/collaboration/collaboration-panel"
import { useAuth } from "@/lib/auth-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, MoreHorizontal, FileSpreadsheet, Bell, ChevronDown, ClipboardList, Eye } from "lucide-react"

interface Form {
  id: string
  title: string
  description?: string
  isActive: boolean
  isPublic: boolean
  sections: any[]
  settings?: any
  _count?: { entries: number }
  user?: { id: string }
  userId?: string
}

interface SheetStatus {
  googleConnected: boolean
  sheetLinked: boolean
  spreadsheetId: string | null
  spreadsheetUrl: string | null
}

export default function EditFormPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const { user } = useAuth()
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

  const connectGoogleAccount = () => {
    // Redirect to Google OAuth flow for Sheets, passing formId so it redirects back
    window.location.href = `/api/auth/google-sheets?formId=${params.id}`
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
        setSheetStatus({ googleConnected: true, sheetLinked: true, spreadsheetId: data.spreadsheetId, spreadsheetUrl: data.spreadsheetUrl })
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
      if (res.ok) setSheetStatus(prev => prev ? { ...prev, sheetLinked: false, spreadsheetId: null, spreadsheetUrl: null } : null)
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 flex items-center justify-between gap-2 sm:gap-3">

          {/* ── Left: Back + Title + Status ── */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Back to forms"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-border/60 select-none hidden sm:inline">|</span>

            <h2 className="text-sm font-medium truncate min-w-0" title={form.title}>
              {form.title}
            </h2>

            <span
              className={`hidden md:inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                form.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {form.isActive ? 'Accepting responses' : 'Closed'}
            </span>
          </div>

          {/* ── Right: Controls (desktop inline, mobile overflow menu) ── */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* ── Desktop: full inline controls (hidden on mobile) ── */}
            <div className="hidden sm:flex items-center gap-2">

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
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {form.isActive ? 'Active' : 'Closed'}
                </span>
              </div>

              <span className="w-px h-4 bg-border/60" />

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
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  Email alerts
                </span>
              </div>

              <span className="w-px h-4 bg-border/60" />

              {/* Google Sheets */}
              {sheetStatus?.sheetLinked ? (
                <div className="flex items-center gap-0.5">
                  <a
                    href={sheetStatus.spreadsheetUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                    title="Open linked Google Sheet"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
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
              ) : sheetStatus?.googleConnected ? (
                <button
                  onClick={connectSheet}
                  disabled={sheetLoading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
                  title="Create & connect a Google Sheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  {sheetLoading ? 'Creating...' : 'Create Sheet'}
                </button>
              ) : sheetStatus ? (
                <button
                  onClick={connectGoogleAccount}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
                  title="Connect your Google account to sync responses to Google Sheets"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Connect Google
                </button>
              ) : null}

              {sheetStatus && <span className="w-px h-4 bg-border/60" />}

              {/* Submissions link */}
              <button
                onClick={() => router.push(`/forms/${params.id}/submissions`)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-muted transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Responses</span>
                <span className="tabular-nums">({responseCount})</span>
              </button>
            </div>

            {/* ── Mobile: overflow menu for secondary actions ── */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="sm:hidden inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Accept responses</span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleAcceptResponses() }}
                    role="switch"
                    aria-checked={form.isActive}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${form.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                  </button>
                </DropdownMenuLabel>
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Email alerts</span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleEmailNotifications() }}
                    role="switch"
                    aria-checked={emailEnabled}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${emailEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${emailEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                  </button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push(`/forms/${params.id}/submissions`)}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Responses ({responseCount})
                </DropdownMenuItem>
                {sheetStatus?.sheetLinked ? (
                  <>
                    <DropdownMenuItem asChild>
                      <a href={sheetStatus.spreadsheetUrl!} target="_blank" rel="noopener noreferrer">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Open Google Sheet
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={disconnectSheet} disabled={sheetLoading}>
                      Disconnect sheet
                    </DropdownMenuItem>
                  </>
                ) : sheetStatus?.googleConnected ? (
                  <DropdownMenuItem onSelect={connectSheet} disabled={sheetLoading}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {sheetLoading ? 'Creating sheet...' : 'Create Google Sheet'}
                  </DropdownMenuItem>
                ) : sheetStatus ? (
                  <DropdownMenuItem onSelect={connectGoogleAccount}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Connect Google
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collaborators button (owner only) */}
            {user && form && (form.userId === user.id || form.user?.id === user.id) && (
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-muted transition-colors"
                    title="Manage collaborators"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Collaborators</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Collaborators</SheetTitle>
                    <SheetDescription>
                      Invite people to help edit this form. They can view and edit everything except delete.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <CollaborationPanel
                      contentType="FORM"
                      contentId={params.id}
                      canManage
                      bare
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}

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
