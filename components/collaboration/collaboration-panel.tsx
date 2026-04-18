'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus, Mail, X, Check, Clock, Loader2, UserCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type CollaboratorRow = {
  id: string
  collaboratorEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED'
  createdAt: string
  acceptedAt?: string | null
  message?: string | null
  collaborator?: { id: string; fullName: string; username: string; email: string; avatar?: string | null } | null
  invitedBy: { fullName: string; username: string }
}

export interface CollaborationPanelProps {
  contentType: 'FORM' | 'PROJECT' | 'EVENT' | 'OPPORTUNITY' | 'SERVICE' | 'RESOURCE' | 'MARKETPLACE' | 'NEWS' | 'CLUB'
  contentId: string
  /** Only render when the current user owns this content. */
  canManage: boolean
  /** Skip the Card wrapper when embedded inside a Sheet or drawer. */
  bare?: boolean
}

export default function CollaborationPanel({ contentType, contentId, canManage, bare }: CollaborationPanelProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  // Preview of the invitee: if they already have an account we show their
  // name and avatar so the owner can confirm they're inviting the right person.
  const [lookup, setLookup] = useState<
    | { state: 'idle' }
    | { state: 'checking' }
    | { state: 'found'; user: { id: string; username: string; fullName: string; avatar?: string | null; isVerified: boolean } }
    | { state: 'not-found' }
  >({ state: 'idle' })

  const load = async () => {
    if (!canManage) {
      setLoading(false)
      return
    }
    try {
      const r = await fetch(`/api/collaborators?contentType=${contentType}&contentId=${contentId}`)
      if (!r.ok) throw new Error('Failed to load collaborators')
      const data = await r.json()
      setCollaborators(data.collaborators || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [contentType, contentId, canManage])

  // Debounced lookup: whenever the email input is a valid email, check whether
  // that person already has an account so we can preview their profile.
  useEffect(() => {
    const e = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setLookup({ state: 'idle' })
      return
    }
    setLookup({ state: 'checking' })
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/users/lookup?email=${encodeURIComponent(e)}`)
        if (!r.ok) { setLookup({ state: 'not-found' }); return }
        const data = await r.json()
        if (data.user) setLookup({ state: 'found', user: data.user })
        else setLookup({ state: 'not-found' })
      } catch {
        setLookup({ state: 'not-found' })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [email])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setError(null)
    setSuccess(null)
    try {
      const r = await fetch('/api/collaborators/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentId, email, message: message || undefined }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Invite failed')
      setSuccess(
        data.alreadyAccepted
          ? `${email} is already a collaborator`
          : `Invitation sent to ${email}`,
      )
      setEmail('')
      setMessage('')
      await load()
      setTimeout(() => { setOpen(false); setSuccess(null) }, 1500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setInviting(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this invitation? The collaborator will lose edit access immediately.')) return
    try {
      const r = await fetch(`/api/collaborators/${id}`, { method: 'DELETE' })
      if (!r.ok) {
        const data = await r.json()
        throw new Error(data.error || 'Revoke failed')
      }
      await load()
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (!canManage) return null

  const inviteDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleInvite}>
          <DialogHeader>
            <DialogTitle>Invite a collaborator</DialogTitle>
            <DialogDescription>
              They will be able to view and edit this content, but only you can delete it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="collab-email">Email address</Label>
              <Input
                id="collab-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
              {/* Live lookup: preview the account if one exists for this email. */}
              {lookup.state === 'checking' && (
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking…
                </p>
              )}
              {lookup.state === 'found' && (
                <div className="mt-2 flex items-center gap-2 rounded-md border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 p-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={lookup.user.avatar || undefined} alt={lookup.user.fullName} />
                    <AvatarFallback className="text-[10px]">
                      {lookup.user.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{lookup.user.fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">@{lookup.user.username} · already has an account</p>
                  </div>
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                </div>
              )}
              {lookup.state === 'not-found' && (
                <div className="mt-2 flex items-start gap-2 rounded-md border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 p-2">
                  <UserCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    No account yet. They will be asked to create one before they can collaborate.
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="collab-message">Personal message (optional)</Label>
              <Textarea
                id="collab-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, would you help me edit this?"
                maxLength={500}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={inviting}>Cancel</Button>
            <Button type="submit" disabled={inviting || !email}>
              {inviting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>) : 'Send invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  const listBlock = loading ? (
    <div className="flex items-center justify-center py-6 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  ) : collaborators.length === 0 ? (
    <p className="text-sm text-muted-foreground py-2">
      No collaborators yet. Invite someone to help edit this content.
    </p>
  ) : (
    <ul className="divide-y">
      {collaborators.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-sm">
                {c.collaborator?.fullName || c.collaborator?.username || c.collaboratorEmail}
              </p>
              {c.status === 'PENDING' && (
                <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
              )}
              {c.status === 'ACCEPTED' && (
                <Badge variant="default" className="gap-1 bg-green-600"><Check className="h-3 w-3" /> Active</Badge>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {c.collaboratorEmail}
              {c.status === 'ACCEPTED' && c.acceptedAt && (
                <> &middot; joined {new Date(c.acceptedAt).toLocaleDateString()}</>
              )}
              {c.status === 'PENDING' && (
                <> &middot; invited {new Date(c.createdAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleRevoke(c.id)} aria-label="Revoke">
            <X className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  )

  if (bare) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Collaborators</h3>
            <p className="text-sm text-muted-foreground">
              People you have invited to help edit this content.
            </p>
          </div>
          {inviteDialog}
        </div>
        {listBlock}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">Collaborators</CardTitle>
          <CardDescription>People you have invited to help edit this content.</CardDescription>
        </div>
        {inviteDialog}
      </CardHeader>
      <CardContent>{listBlock}</CardContent>
    </Card>
  )
}
