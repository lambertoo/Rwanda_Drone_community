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
import { UserPlus, Mail, X, Check, Clock, Loader2 } from 'lucide-react'

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
