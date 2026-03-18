'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users, Star, CheckCircle, XCircle, Clock, Send,
  Search, Loader2, UserCheck, BookOpen, Award, Globe
} from 'lucide-react'

interface MentorProfile {
  id: string
  specialties: string[]
  bio?: string
  maxMentees: number
  isAccepting: boolean
  isFree: boolean
  languages: string[]
  user: {
    id: string
    username: string
    fullName: string
    avatar?: string
    role: string
  }
  _count?: { sentRequests: number }
}

interface MentorshipRequest {
  id: string
  message: string
  goals?: string[]
  status: string
  createdAt: string
  mentorProfile: {
    id: string
    specialties: string[]
    user: { id: string; username: string; fullName: string; avatar?: string; role: string }
  }
  menteeProfile: {
    id: string
    user: { id: string; username: string; fullName: string; avatar?: string; role: string }
  }
}

const SPECIALTIES = [
  'Photography',
  'Survey Mapping',
  'FPV Racing',
  'Regulations',
  'Commercial Ops',
  'Maintenance',
  'Flight Training',
  'Safety',
]

const LANGUAGES = ['English', 'French', 'Kinyarwanda', 'Swahili']

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pilot: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  hobbyist: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  service_provider: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  student: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  regulator: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-muted text-muted-foreground', icon: XCircle },
}

export default function MentorshipPage() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState<MentorProfile[]>([])
  const [requests, setRequests] = useState<{ sent: MentorshipRequest[]; received: MentorshipRequest[] }>({ sent: [], received: [] })
  const [myProfile, setMyProfile] = useState<MentorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  // Dialog state
  const [requestDialog, setRequestDialog] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestGoals, setRequestGoals] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    bio: '',
    maxMentees: 3,
    isFree: true,
    isAccepting: true,
    selectedSpecialties: [] as string[],
    selectedLanguages: ['English'] as string[],
  })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([fetchMentors(), fetchRequests(), fetchMyProfile()]).finally(() =>
      setLoading(false)
    )
  }, [user])

  const fetchMentors = async () => {
    try {
      const res = await fetch('/api/mentorship/mentors', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setMentors(data.mentors || [])
      }
    } catch {}
  }

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/mentorship/requests', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setRequests({ sent: data.sent || [], received: data.received || [] })
      }
    } catch {}
  }

  const fetchMyProfile = async () => {
    try {
      const res = await fetch('/api/mentorship/profile', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setMyProfile(data.profile)
          setProfileForm({
            bio: data.profile.bio || '',
            maxMentees: data.profile.maxMentees || 3,
            isFree: data.profile.isFree !== false,
            isAccepting: data.profile.isAccepting !== false,
            selectedSpecialties: (data.profile.specialties as string[]) || [],
            selectedLanguages: (data.profile.languages as string[]) || ['English'],
          })
        }
      }
    } catch {}
  }

  const openRequestDialog = (mentor: MentorProfile) => {
    setSelectedMentor(mentor)
    setRequestMessage('')
    setRequestGoals('')
    setRequestDialog(true)
  }

  const sendRequest = async () => {
    if (!selectedMentor || !requestMessage.trim()) {
      toast.error('Please write a message')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/mentorship/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mentorProfileId: selectedMentor.id,
          message: requestMessage,
          goals: requestGoals
            ? requestGoals.split('\n').filter(g => g.trim())
            : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success('Mentorship request sent!')
      setRequestDialog(false)
      fetchRequests()
    } catch (e: any) {
      toast.error(e.message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`/api/mentorship/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success(`Request ${status}`)
      fetchRequests()
    } catch (e: any) {
      toast.error(e.message || 'Failed to update request')
    }
  }

  const saveProfile = async () => {
    try {
      setSavingProfile(true)
      const res = await fetch('/api/mentorship/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bio: profileForm.bio,
          maxMentees: profileForm.maxMentees,
          isFree: profileForm.isFree,
          isAccepting: profileForm.isAccepting,
          specialties: profileForm.selectedSpecialties,
          languages: profileForm.selectedLanguages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success(myProfile ? 'Profile updated!' : 'Mentor profile created!')
      setMyProfile(data.profile)
      fetchMentors()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const toggleSpecialty = (s: string) => {
    setProfileForm(prev => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.includes(s)
        ? prev.selectedSpecialties.filter(x => x !== s)
        : [...prev.selectedSpecialties, s],
    }))
  }

  const toggleLanguage = (l: string) => {
    setProfileForm(prev => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(l)
        ? prev.selectedLanguages.filter(x => x !== l)
        : [...prev.selectedLanguages, l],
    }))
  }

  const filteredMentors = mentors.filter(m => {
    const q = search.toLowerCase()
    const matchSearch =
      m.user.fullName.toLowerCase().includes(q) ||
      m.user.username.toLowerCase().includes(q) ||
      (m.bio || '').toLowerCase().includes(q) ||
      (m.specialties as string[]).some(s => s.toLowerCase().includes(q))

    const matchSpecialty =
      specialtyFilter === 'all' ||
      (m.specialties as string[]).some(
        s => s.toLowerCase() === specialtyFilter.toLowerCase()
      )

    const matchRole = roleFilter === 'all' || m.user.role === roleFilter

    return matchSearch && matchSpecialty && matchRole
  })

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mentorship Program</h1>
              <p className="text-muted-foreground mt-1">
                Connect with experienced pilots and drone professionals
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="find">
          <TabsList className="mb-6">
            <TabsTrigger value="find">Find a Mentor</TabsTrigger>
            <TabsTrigger value="requests">
              My Requests
              {(requests.sent.length + requests.received.length) > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                  {requests.sent.length + requests.received.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="become">Become a Mentor</TabsTrigger>
          </TabsList>

          {/* FIND A MENTOR */}
          <TabsContent value="find">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors by name, specialty..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {SPECIALTIES.map(s => (
                    <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="pilot">Pilot</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="hobbyist">Hobbyist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5">
                      <div className="h-10 w-10 bg-muted rounded-full mb-3" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMentors.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No mentors found</h3>
                  <p className="text-sm text-muted-foreground">
                    {search || specialtyFilter !== 'all' || roleFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'Be the first to become a mentor!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMentors.map(mentor => (
                  <Card key={mentor.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardContent className="p-5 flex flex-col flex-1">
                      {/* Avatar & name */}
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={mentor.user.avatar || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(mentor.user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {mentor.user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">@{mentor.user.username}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {mentor.user.role && (
                              <Badge
                                className={`text-xs ${ROLE_COLORS[mentor.user.role] || 'bg-muted text-muted-foreground'}`}
                              >
                                {mentor.user.role.replace('_', ' ')}
                              </Badge>
                            )}
                            {mentor.isFree && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                Free
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {mentor.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {mentor.bio}
                        </p>
                      )}

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(mentor.specialties as string[]).slice(0, 3).map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                        {(mentor.specialties as string[]).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(mentor.specialties as string[]).length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Languages */}
                      <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {(mentor.languages as string[]).join(', ')}
                      </div>

                      {/* Action */}
                      <div className="mt-auto">
                        {user?.id === mentor.user.id ? (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            Your Profile
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => openRequestDialog(mentor)}
                          >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Request Mentorship
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MY REQUESTS */}
          <TabsContent value="requests">
            <div className="space-y-6">
              {/* Sent requests */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Sent Requests</h2>
                {requests.sent.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                      You haven't sent any mentorship requests yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {requests.sent.map(req => {
                      const s = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
                      const StatusIcon = s.icon
                      return (
                        <Card key={req.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={req.mentorProfile.user.avatar || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {getInitials(req.mentorProfile.user.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <p className="font-medium text-foreground">
                                    {req.mentorProfile.user.fullName}
                                  </p>
                                  <Badge className={`text-xs ${s.color}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {s.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {req.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {req.status === 'pending' && (
                              <div className="mt-3 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-muted-foreground"
                                  onClick={() => updateRequestStatus(req.id, 'withdrawn')}
                                >
                                  Withdraw
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Received requests */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Received Requests</h2>
                {requests.received.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                      No incoming mentorship requests yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {requests.received.map(req => {
                      const s = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
                      const StatusIcon = s.icon
                      return (
                        <Card key={req.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={req.menteeProfile.user.avatar || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {getInitials(req.menteeProfile.user.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <p className="font-medium text-foreground">
                                    {req.menteeProfile.user.fullName}
                                  </p>
                                  <Badge className={`text-xs ${s.color}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {s.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {req.message}
                                </p>
                                {Array.isArray(req.goals) && req.goals.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Goals:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                                      {(req.goals as string[]).map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {req.status === 'pending' && (
                              <div className="mt-3 flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  onClick={() => updateRequestStatus(req.id, 'declined')}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => updateRequestStatus(req.id, 'accepted')}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Accept
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* BECOME A MENTOR */}
          <TabsContent value="become">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Benefits card */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Why Become a Mentor?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: UserCheck, title: 'Give Back', desc: 'Share your drone expertise with the next generation.' },
                      { icon: Award, title: 'Build Reputation', desc: 'Earn recognition as a community expert.' },
                      { icon: BookOpen, title: 'Learn Too', desc: 'Teaching reinforces and deepens your own knowledge.' },
                    ].map(b => (
                      <div key={b.title} className="flex items-start gap-2">
                        <b.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{b.title}</p>
                          <p className="text-xs text-muted-foreground">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Profile form */}
                <Card>
                  <CardHeader>
                    <CardTitle>{myProfile ? 'Update Your Mentor Profile' : 'Create Mentor Profile'}</CardTitle>
                    <CardDescription>
                      This will make you visible to students and pilots looking for guidance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Bio */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bio">Bio / Introduction</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell potential mentees about your background, experience, and what you can help with..."
                        value={profileForm.bio}
                        onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    {/* Specialties */}
                    <div className="space-y-2">
                      <Label>Specialties</Label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALTIES.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpecialty(s)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              profileForm.selectedSpecialties.includes(s)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                      <Label>Languages</Label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(l => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => toggleLanguage(l)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              profileForm.selectedLanguages.includes(l)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Max Mentees */}
                    <div className="space-y-1.5">
                      <Label htmlFor="maxMentees">Max Mentees at a Time</Label>
                      <Select
                        value={String(profileForm.maxMentees)}
                        onValueChange={v => setProfileForm(p => ({ ...p, maxMentees: Number(v) }))}
                      >
                        <SelectTrigger id="maxMentees" className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 5, 10].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileForm.isFree}
                          onChange={e => setProfileForm(p => ({ ...p, isFree: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-foreground">Offer mentorship for free</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileForm.isAccepting}
                          onChange={e => setProfileForm(p => ({ ...p, isAccepting: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-foreground">Currently accepting mentees</span>
                      </label>
                    </div>

                    <Button onClick={saveProfile} disabled={savingProfile} className="w-full sm:w-auto">
                      {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {myProfile ? 'Update Profile' : 'Create Mentor Profile'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Preview sidebar */}
              <div>
                {myProfile && (
                  <Card className="sticky top-20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Your Current Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user?.avatar || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user ? getInitials(user.fullName) : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user?.fullName}</p>
                          <div className="flex gap-1.5 mt-1">
                            {myProfile.isAccepting ? (
                              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Accepting
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Not Accepting
                              </Badge>
                            )}
                            {myProfile.isFree && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                Free
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {myProfile.bio && (
                        <p className="text-sm text-muted-foreground">{myProfile.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {(myProfile.specialties as string[]).map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Max mentees: {myProfile.maxMentees}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Dialog */}
      <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a request to {selectedMentor?.user.fullName}. Explain who you are and what you hope to learn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="req-message"
                placeholder="Introduce yourself and explain why you'd like this person as a mentor..."
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-goals">Goals (optional)</Label>
              <Textarea
                id="req-goals"
                placeholder="List your goals, one per line..."
                value={requestGoals}
                onChange={e => setRequestGoals(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Enter each goal on a new line.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={sendRequest} disabled={submitting || !requestMessage.trim()}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
