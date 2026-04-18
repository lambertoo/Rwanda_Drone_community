'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, AlertTriangle, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

type InviteInfo = {
  id: string
  contentType: string
  contentId: string
  collaboratorEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED'
  message?: string
  createdAt: string
  invitedBy: { fullName: string; username: string; email: string }
}

const CONTENT_LABEL: Record<string, string> = {
  FORM: 'form',
  PROJECT: 'project',
  EVENT: 'event',
  OPPORTUNITY: 'opportunity',
  SERVICE: 'service',
  RESOURCE: 'resource',
  MARKETPLACE: 'marketplace listing',
  NEWS: 'news article',
  CLUB: 'club',
}

export default function AcceptCollaborationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AcceptCollaborationInner />
    </Suspense>
  )
}

function AcceptCollaborationInner() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [contentTitle, setContentTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token')
      setLoading(false)
      return
    }
    fetch(`/api/collaborators/accept?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Invitation not found')
        setInvite(data.invite)
        setContentTitle(data.contentTitle || 'Untitled')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    setAccepting(true)
    setError(null)
    try {
      const r = await fetch('/api/collaborators/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to accept')
      setAccepted(true)
      setTimeout(() => router.push(data.redirectUrl), 1200)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAccepting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Invitation unavailable</CardTitle>
            <CardDescription>{error || 'This invitation could not be found.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button variant="outline" className="w-full">Back to home</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invite.status === 'REVOKED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invitation revoked</CardTitle>
            <CardDescription>This invitation is no longer valid.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button variant="outline" className="w-full">Back to home</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invite.status === 'ACCEPTED' || accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>You are a collaborator</CardTitle>
            <CardDescription>
              Taking you to the {CONTENT_LABEL[invite.contentType] || 'content'}...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const inviterName = invite.invitedBy.fullName || invite.invitedBy.username
  const contentLabel = CONTENT_LABEL[invite.contentType] || 'content'

  // Not logged in: prompt to log in or register
  if (!user) {
    const next = encodeURIComponent(`/collaborate/accept?token=${token}`)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>You have been invited to collaborate</CardTitle>
            <CardDescription>
              <strong>{inviterName}</strong> invited you to edit the {contentLabel}{' '}
              <strong>{contentTitle}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please sign in or create an account with <strong>{invite.collaboratorEmail}</strong> to
              accept this invitation.
            </p>
            {invite.message && (
              <div className="rounded border-l-2 border-blue-500 bg-muted/50 p-3 text-sm italic">
                {invite.message}
              </div>
            )}
            <Link href={`/login?next=${next}`}>
              <Button className="w-full">Sign in to accept</Button>
            </Link>
            <Link href={`/register?email=${encodeURIComponent(invite.collaboratorEmail)}&next=${next}`}>
              <Button variant="outline" className="w-full">Create a new account</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Logged in but email doesn't match
  if (user.email.toLowerCase() !== invite.collaboratorEmail.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Wrong account</CardTitle>
            <CardDescription>
              This invitation was sent to <strong>{invite.collaboratorEmail}</strong>, but you are
              signed in as <strong>{user.email}</strong>. Please sign out and sign in with the
              correct account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Logged in with matching email: show accept button
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Collaborate on a {contentLabel}</CardTitle>
          <CardDescription>
            <strong>{inviterName}</strong> invited you to edit <strong>{contentTitle}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            As a collaborator you will be able to view and edit this {contentLabel}. Only the owner
            can delete it.
          </p>
          {invite.message && (
            <div className="rounded border-l-2 border-blue-500 bg-muted/50 p-3 text-sm italic">
              {invite.message}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" onClick={handleAccept} disabled={accepting}>
            {accepting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...</>) : 'Accept invitation'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
