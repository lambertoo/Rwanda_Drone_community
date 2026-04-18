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

type SearchedUser = {
  id: string
  username: string
  fullName: string
  email: string
  avatar?: string | null
  isVerified: boolean
  relationship: 'mutual' | 'iFollow' | 'followsMe' | 'none'
}

export default function CollaborationPanel({ contentType, contentId, canManage, bare }: CollaborationPanelProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [email, setEmail] = useState('')
  const [pickedUser, setPickedUser] = useState<SearchedUser | null>(null)
  const [results, setResults] = useState<SearchedUser[]>([])
  const [searching, setSearching] = useState(false)
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

  // Combined search: the same box lets the owner search by name / username /
  // email and also accepts a raw external email to invite someone without an
  // account. Debounced 300ms. Mutual follows are surfaced first by the API.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/collaborators/search?q=${encodeURIComponent(q)}&limit=8`)
        if (r.ok) {
          const data = await r.json()
          setResults(data.users || [])
        } else {
          setResults([])
        }
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const queryLooksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query.trim())
  const externalEmail = queryLooksLikeEmail && !results.some(u => u.email.toLowerCase() === query.trim().toLowerCase())

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    // Resolve the email to invite: picked user wins, otherwise the typed
    // external email if it looks like one.
    const inviteEmail = pickedUser?.email || (queryLooksLikeEmail ? query.trim().toLowerCase() : email.trim().toLowerCase())
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setError('Pick a person or enter a valid email address')
      return
    }
    setInviting(true)
    setError(null)
    setSuccess(null)
    try {
      const r = await fetch('/api/collaborators/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentId, email: inviteEmail, message: message || undefined }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Invite failed')
      setSuccess(
        data.alreadyAccepted
          ? `${inviteEmail} is already a collaborator`
          : `Invitation sent to ${inviteEmail}`,
      )
      setQuery('')
      setEmail('')
      setPickedUser(null)
      setResults([])
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
              <Label htmlFor="collab-search">Find someone by name, username or email</Label>
              {pickedUser ? (
                // Chosen user: show their profile card with a change button
                <div className="mt-1 flex items-center gap-2 rounded-md border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 p-2">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={pickedUser.avatar || undefined} alt={pickedUser.fullName} />
                    <AvatarFallback className="text-[11px]">
                      {pickedUser.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{pickedUser.fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      @{pickedUser.username} · {pickedUser.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPickedUser(null); setQuery('') }}
                    className="text-[11px] text-muted-foreground hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    id="collab-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Start typing a name, username or email…"
                    autoComplete="off"
                  />
                  {/* Results dropdown */}
                  {query.trim().length >= 2 && (
                    <div className="mt-2 rounded-md border bg-background max-h-60 overflow-auto">
                      {searching && (
                        <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" /> Searching…
                        </div>
                      )}
                      {!searching && results.length === 0 && !externalEmail && (
                        <p className="p-3 text-xs italic text-muted-foreground">
                          No matches. Type a full email to invite someone who does not have an account yet.
                        </p>
                      )}
                      {results.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setPickedUser(u)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 border-b last:border-b-0 text-left"
                        >
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={u.avatar || undefined} alt={u.fullName} />
                            <AvatarFallback className="text-[10px]">
                              {u.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{u.fullName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">@{u.username} · {u.email}</p>
                          </div>
                          {u.relationship === 'mutual' && (
                            <Badge className="text-[9px] bg-green-600 hover:bg-green-600">Mutual</Badge>
                          )}
                          {u.relationship === 'iFollow' && (
                            <Badge variant="secondary" className="text-[9px]">Following</Badge>
                          )}
                          {u.relationship === 'followsMe' && (
                            <Badge variant="secondary" className="text-[9px]">Follower</Badge>
                          )}
                        </button>
                      ))}
                      {/* External-email fallback when the query is an email that
                          doesn't match any existing account. */}
                      {!searching && externalEmail && (
                        <button
                          type="button"
                          onClick={() => setPickedUser({
                            id: '',
                            username: '',
                            fullName: query.trim(),
                            email: query.trim().toLowerCase(),
                            avatar: null,
                            isVerified: false,
                            relationship: 'none',
                          } as SearchedUser)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 text-left border-t"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <UserCircle2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">Invite {query.trim()}</p>
                            <p className="text-[11px] text-muted-foreground">
                              No account yet — they'll be asked to sign up
                            </p>
                          </div>
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  )}
                </>
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
            <Button type="submit" disabled={inviting || (!pickedUser && !queryLooksLikeEmail)}>
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
