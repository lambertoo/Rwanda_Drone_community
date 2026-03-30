"use client"

import { useState, useEffect, use } from "react"
export const dynamic = 'force-dynamic'
import Link from "next/link"
import {
  MapPin, Users, Globe, Mail, Phone, ChevronLeft, Settings, UserCheck,
  ExternalLink, Facebook, Twitter, Instagram, Youtube, Shield, UserMinus,
  ArrowRightLeft, CheckCircle, XCircle, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"

interface ClubMember {
  id: string
  role: string
  status: string
  joinedAt: string
  user: { id: string; fullName: string; avatar?: string; username: string; role?: string }
}

interface TransferRequest {
  id: string
  status: string
  message?: string
  createdAt: string
  fromUser: { id: string; fullName: string; avatar?: string; username: string }
  toUser: { id: string; fullName: string; avatar?: string; username: string }
}

interface Club {
  id: string
  name: string
  description: string
  shortDescription?: string
  coverImage?: string
  logo?: string
  location?: string
  province?: string
  type: string
  website?: string
  email?: string
  phone?: string
  socialLinks?: { facebook?: string; twitter?: string; instagram?: string; youtube?: string }
  isFeatured: boolean
  isApproved: boolean
  memberCount: number
  registrationFormId?: string
  createdBy: { id: string; fullName: string; avatar?: string; username: string; organization?: string }
  memberships: ClubMember[]
  _count?: { memberships: number }
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  racing: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  aerial_photography: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  agriculture: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  technology: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function formatType(t: string) { return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-RW', { month: 'long', year: 'numeric' }) }

export default function ClubDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const { user } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [memberRole, setMemberRole] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState(false)

  // Role management state
  const [roleChanging, setRoleChanging] = useState<string | null>(null)

  // Transfer ownership state
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([])
  const [selectedTransferTarget, setSelectedTransferTarget] = useState('')
  const [transferMessage, setTransferMessage] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [pendingIncoming, setPendingIncoming] = useState<TransferRequest | null>(null)

  const fetchClub = () => {
    fetch(`/api/clubs/${params.id}`)
      .then(r => r.json())
      .then(d => setClub(d.club))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const checkMembership = () => {
    if (!user) return
    fetch(`/api/clubs/${params.id}/join`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setIsMember(d.isMember); setMemberRole(d.membership?.role || null) })
      .catch(() => {})
  }

  const fetchTransferRequests = () => {
    if (!user) return
    fetch(`/api/clubs/${params.id}/transfer`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setTransferRequests(d.requests || [])
        const incoming = (d.requests || []).find(
          (r: TransferRequest) => r.toUser.id === user.id && r.status === 'pending'
        )
        setPendingIncoming(incoming || null)
      })
      .catch(() => {})
  }

  useEffect(() => { fetchClub() }, [params.id])
  useEffect(() => { checkMembership(); fetchTransferRequests() }, [user, params.id])

  const handleJoin = async () => {
    if (!user) { window.location.href = '/login'; return }
    setJoinLoading(true)
    try {
      const res = await fetch(`/api/clubs/${params.id}/join`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({})
      })
      if (res.ok) { setIsMember(true); fetchClub() }
    } finally { setJoinLoading(false) }
  }

  const handleLeave = async () => {
    setJoinLoading(true)
    try {
      const res = await fetch(`/api/clubs/${params.id}/join`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) { setIsMember(false); setMemberRole(null); fetchClub() }
    } finally { setJoinLoading(false) }
  }

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setRoleChanging(targetUserId)
    try {
      const res = await fetch(`/api/clubs/${params.id}/members/${targetUserId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ role: newRole })
      })
      if (res.ok) fetchClub()
    } finally { setRoleChanging(null) }
  }

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Remove this member from the club?')) return
    try {
      await fetch(`/api/clubs/${params.id}/members/${targetUserId}`, {
        method: 'DELETE', credentials: 'include'
      })
      fetchClub()
    } catch {}
  }

  const handleTransferSend = async () => {
    if (!selectedTransferTarget) return
    setTransferLoading(true)
    try {
      const res = await fetch(`/api/clubs/${params.id}/transfer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ toUserId: selectedTransferTarget, message: transferMessage || undefined })
      })
      if (res.ok) { fetchTransferRequests(); setSelectedTransferTarget(''); setTransferMessage('') }
    } finally { setTransferLoading(false) }
  }

  const handleTransferRespond = async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
    setTransferLoading(true)
    try {
      const res = await fetch(`/api/clubs/${params.id}/transfer`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ requestId, action })
      })
      if (res.ok) { fetchTransferRequests(); fetchClub(); checkMembership() }
    } finally { setTransferLoading(false) }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-2">Club not found</h2>
        <Link href="/clubs"><Button variant="outline">Back to Clubs</Button></Link>
      </div>
    )
  }

  const socialIcons = [
    { key: 'facebook', icon: Facebook, label: 'Facebook' },
    { key: 'twitter', icon: Twitter, label: 'Twitter' },
    { key: 'instagram', icon: Instagram, label: 'Instagram' },
    { key: 'youtube', icon: Youtube, label: 'YouTube' },
  ]

  const isClubAdmin = memberRole === 'admin' || club.createdBy.id === user?.id || user?.role === 'admin'
  const isOwner = club.createdBy.id === user?.id || user?.role === 'admin'
  const memberCount = club._count?.memberships || club.memberCount

  // Other active members eligible to receive ownership (not the current owner)
  const eligibleForTransfer = club.memberships.filter(
    m => m.user.id !== user?.id && m.status === 'active'
  )

  return (
    <div className="min-h-screen">
      {/* Incoming transfer request banner */}
      {pendingIncoming && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">
              {pendingIncoming.fromUser.fullName} wants to transfer club ownership to you
            </p>
            {pendingIncoming.message && <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">"{pendingIncoming.message}"</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" onClick={() => handleTransferRespond(pendingIncoming.id, 'accept')} disabled={transferLoading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleTransferRespond(pendingIncoming.id, 'reject')} disabled={transferLoading}
              className="rounded-full border-amber-400 text-amber-700">
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Decline
            </Button>
          </div>
        </div>
      )}

      {/* Back nav */}
      <Link href="/clubs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Clubs
      </Link>

      {/* Cover + Logo */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div className="h-48 sm:h-64">
          {club.coverImage ? (
            <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-gradient" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        <div className="absolute bottom-4 left-6">
          <div className="w-20 h-20 rounded-2xl border-4 border-background bg-background shadow-xl overflow-hidden">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-gradient flex items-center justify-center">
                <span className="text-white font-extrabold text-2xl">{club.name[0]}</span>
              </div>
            )}
          </div>
        </div>
        {isClubAdmin && (
          <div className="absolute top-4 right-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30 hover:bg-white/30 transition-colors">
              <Settings className="h-3.5 w-3.5" /> Manage
            </button>
          </div>
        )}
      </div>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold">{club.name}</h1>
            {club.isFeatured && <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#009FDA] text-white">Featured</span>}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${TYPE_COLORS[club.type] || TYPE_COLORS.general}`}>
              {formatType(club.type)}
            </span>
            {club.location && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-[#009FDA]" /> {club.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-[#009FDA]" /> {memberCount} members
            </span>
            <span className="text-sm text-muted-foreground">Since {formatDate(club.createdAt)}</span>
          </div>
        </div>
        <div className="shrink-0">
          {isMember ? (
            <Button variant="outline" onClick={handleLeave} disabled={joinLoading} className="rounded-full border-2">
              <UserCheck className="h-4 w-4 mr-2 text-green-500" />
              {joinLoading ? 'Leaving...' : 'Member'}
            </Button>
          ) : (
            <Button onClick={handleJoin} disabled={joinLoading} size="lg" className="rounded-full">
              <Users className="h-4 w-4 mr-2" />
              {joinLoading ? 'Joining...' : 'Join Club'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="about" className="mt-2">
        <TabsList className="mb-6 bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="about" className="rounded-lg">About</TabsTrigger>
          <TabsTrigger value="members" className="rounded-lg">
            Members ({memberCount})
          </TabsTrigger>
          {isClubAdmin && <TabsTrigger value="manage" className="rounded-lg">Manage</TabsTrigger>}
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border/40 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-3">About This Club</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{club.description}</p>
              </div>
              <div className="bg-card border border-border/40 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Organized By</h2>
                <Link href={`/profile/${club.createdBy.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={club.createdBy.avatar || '/placeholder-user.jpg'} />
                    <AvatarFallback className="bg-brand-gradient text-white font-bold">
                      {club.createdBy.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{club.createdBy.fullName}</p>
                    {club.createdBy.organization && <p className="text-sm text-muted-foreground">{club.createdBy.organization}</p>}
                  </div>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-card border border-border/40 rounded-2xl p-5">
                <h3 className="font-bold mb-4">Club Info</h3>
                <div className="space-y-3 text-sm">
                  {club.email && (
                    <a href={`mailto:${club.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#009FDA] transition-colors">
                      <Mail className="h-4 w-4 shrink-0" /> {club.email}
                    </a>
                  )}
                  {club.phone && (
                    <a href={`tel:${club.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-[#009FDA] transition-colors">
                      <Phone className="h-4 w-4 shrink-0" /> {club.phone}
                    </a>
                  )}
                  {club.website && (
                    <a href={club.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-[#009FDA] transition-colors">
                      <Globe className="h-4 w-4 shrink-0" /> Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {club.socialLinks && Object.values(club.socialLinks).some(Boolean) && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                    {socialIcons.map(({ key, icon: Icon, label }) => {
                      const href = (club.socialLinks as any)?.[key]
                      if (!href) return null
                      return (
                        <a key={key} href={href} target="_blank" rel="noopener noreferrer" title={label}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-[#009FDA] hover:text-white transition-colors">
                          <Icon className="h-3.5 w-3.5" />
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
              {!isMember && (
                <div className="bg-brand-gradient rounded-2xl p-5 text-center">
                  <Users className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="font-bold text-white mb-1">Join This Club</h3>
                  <p className="text-white/75 text-xs mb-3">Connect with {memberCount} members</p>
                  <Button onClick={handleJoin} disabled={joinLoading} size="sm" className="bg-white text-[#003366] hover:bg-white/90 rounded-full w-full">
                    {joinLoading ? 'Joining...' : 'Join Now'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {club.memberships.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-card border border-border/40 rounded-xl p-4 hover:border-[#009FDA]/30 hover:shadow-md transition-all">
                <Link href={`/profile/${m.user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={m.user.avatar || '/placeholder-user.jpg'} />
                    <AvatarFallback className="bg-brand-gradient text-white text-xs font-bold">
                      {m.user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{m.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{m.user.username}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  {m.role !== 'member' && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${m.role === 'admin' ? 'bg-[#003366] text-white dark:bg-[#009FDA]' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      {m.role}
                    </span>
                  )}
                  {/* Role management dropdown — admin only, not for self */}
                  {isClubAdmin && m.user.id !== user?.id && (
                    <Select
                      value={m.role}
                      onValueChange={val => handleRoleChange(m.user.id, val)}
                      disabled={roleChanging === m.user.id}
                    >
                      <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent hover:bg-muted rounded-full">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Set Role</div>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <div className="border-t my-1" />
                        <button
                          className="w-full text-left px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded flex items-center gap-2"
                          onClick={() => handleRemoveMember(m.user.id)}
                        >
                          <UserMinus className="h-3.5 w-3.5" /> Remove from club
                        </button>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
          {club.memberships.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No members yet. Be the first to join!</div>
          )}
        </TabsContent>

        {/* Manage Tab (admin only) */}
        {isClubAdmin && (
          <TabsContent value="manage">
            <div className="space-y-6">
              {/* Quick settings */}
              <div className="bg-card border border-border/40 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Club Settings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href={`/clubs/${club.id}/edit`}>
                    <div className="p-4 border border-border/40 rounded-xl hover:border-[#009FDA]/30 hover:bg-muted/30 transition-all cursor-pointer">
                      <Settings className="h-6 w-6 text-[#009FDA] mb-2" />
                      <h3 className="font-semibold">Edit Club Info</h3>
                      <p className="text-sm text-muted-foreground">Update name, description, images, contact</p>
                    </div>
                  </Link>
                  <Link href={`/clubs/${club.id}/registration-form`}>
                    <div className="p-4 border border-border/40 rounded-xl hover:border-[#009FDA]/30 hover:bg-muted/30 transition-all cursor-pointer">
                      <UserCheck className="h-6 w-6 text-[#009FDA] mb-2" />
                      <h3 className="font-semibold">Registration Form</h3>
                      <p className="text-sm text-muted-foreground">
                        {club.registrationFormId ? 'Edit your custom join form' : 'Create a custom join form for new members'}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Transfer Ownership — only the actual owner (createdBy) can initiate */}
              {isOwner && (
                <div className="bg-card border border-border/40 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRightLeft className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-bold">Transfer Ownership</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Transfer full ownership of this club to another member. The recipient must <strong>confirm</strong> the request before the transfer takes effect. You will remain as an admin member.
                  </p>

                  {/* Pending outgoing transfer */}
                  {transferRequests.filter(r => r.fromUser.id === user?.id && r.status === 'pending').map(r => (
                    <div key={r.id} className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          Awaiting confirmation from <span className="underline">{r.toUser.fullName}</span>
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Sent {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleTransferRespond(r.id, 'cancel')} disabled={transferLoading}
                        className="rounded-full border-amber-400 text-amber-700 shrink-0">
                        Cancel Request
                      </Button>
                    </div>
                  ))}

                  {/* Send new transfer */}
                  {!transferRequests.some(r => r.fromUser.id === user?.id && r.status === 'pending') && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Select member to transfer to</label>
                        <Select value={selectedTransferTarget} onValueChange={setSelectedTransferTarget}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a member..." />
                          </SelectTrigger>
                          <SelectContent>
                            {eligibleForTransfer.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">No other active members</div>
                            ) : (
                              eligibleForTransfer.map(m => (
                                <SelectItem key={m.user.id} value={m.user.id}>
                                  {m.user.fullName} (@{m.user.username}) — {m.role}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Message (optional)</label>
                        <Textarea
                          value={transferMessage}
                          onChange={e => setTransferMessage(e.target.value)}
                          placeholder="Explain why you're transferring ownership..."
                          rows={2}
                        />
                      </div>
                      <Button
                        onClick={handleTransferSend}
                        disabled={!selectedTransferTarget || transferLoading}
                        variant="outline"
                        className="rounded-full border-amber-400 text-amber-700 hover:bg-amber-50"
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        {transferLoading ? 'Sending...' : 'Send Transfer Request'}
                      </Button>
                    </div>
                  )}

                  {/* Transfer history */}
                  {transferRequests.filter(r => r.status !== 'pending').length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border/40">
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Transfer History</h3>
                      <div className="space-y-2">
                        {transferRequests.filter(r => r.status !== 'pending').map(r => (
                          <div key={r.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              To {r.toUser.fullName} · {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              r.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
