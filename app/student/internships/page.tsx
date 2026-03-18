'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  GraduationCap, Briefcase, MapPin, Clock, Building2,
  Search, ArrowRight, Lightbulb, CheckCircle, ExternalLink, Star
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  company: string
  description: string
  location: string
  opportunityType: string
  subType?: string
  salary?: string
  isRemote: boolean
  isUrgent: boolean
  applicationDeadline?: string
  createdAt: string
  category?: { id: string; name: string }
  poster: { username: string; fullName: string }
}

const APPLICATION_TIPS = [
  'Tailor your application letter to each opportunity.',
  'Highlight any drone-related coursework or personal projects.',
  'Include any certifications, even if informal.',
  'Follow up politely after submitting your application.',
  'Research the company before your interview.',
  'Show enthusiasm for the drone/aviation industry.',
]

const SUCCESS_STORIES = [
  {
    name: 'Amina K.',
    role: 'Drone Mapping Intern',
    company: 'GeoTech Rwanda',
    quote: 'The internship gave me hands-on experience with professional surveying drones.',
    year: '2024',
  },
  {
    name: 'Jean-Claude M.',
    role: 'Aviation Training Participant',
    company: 'Rwanda Flying Labs',
    quote: 'I went from hobbyist to certified pilot within 3 months of the program.',
    year: '2024',
  },
  {
    name: 'Claudine U.',
    role: 'Drone Photography Apprentice',
    company: 'Kigali Media House',
    quote: 'Built my professional portfolio while earning and learning.',
    year: '2025',
  },
]

const INTERNSHIP_TYPES = ['internship', 'training', 'apprenticeship', 'INTERNSHIP', 'TRAINING']

export default function StudentInternshipsPage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/opportunities', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const all: Opportunity[] = data.opportunities || data || []
        // Filter to internship/training types
        const filtered = all.filter(o =>
          INTERNSHIP_TYPES.some(t =>
            o.opportunityType?.toLowerCase().includes(t.toLowerCase()) ||
            o.subType?.toLowerCase().includes(t.toLowerCase())
          )
        )
        setOpportunities(filtered)
      }
    } catch {
      toast.error('Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const filtered = opportunities.filter(o => {
    const q = search.toLowerCase()
    const matchSearch =
      o.title.toLowerCase().includes(q) ||
      o.company.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.location.toLowerCase().includes(q)

    const matchType =
      typeFilter === 'all' ||
      o.opportunityType?.toLowerCase() === typeFilter.toLowerCase() ||
      o.subType?.toLowerCase() === typeFilter.toLowerCase()

    return matchSearch && matchType
  })

  const formatDate = (date?: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isDeadlineSoon = (deadline?: string) => {
    if (!deadline) return false
    const d = new Date(deadline)
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diff > 0 && diff <= 7
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Internships & Training Opportunities
              </h1>
              <p className="text-muted-foreground mt-1">
                Find internships, training programs, and entry-level opportunities in the drone industry
              </p>
            </div>
          </div>
        </div>

        {/* Quick-action banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">
                  Looking for all types of opportunities?
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Browse the full jobs board including full-time positions, gigs, and freelance work.
                </p>
              </div>
              <Link href="/opportunities">
                <Button variant="outline" className="shrink-0">
                  View All Opportunities
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search internships and training programs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="training">Training Program</SelectItem>
              <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No internships found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {search
                      ? 'Try adjusting your search terms.'
                      : 'Check back soon — new opportunities are added regularly.'}
                  </p>
                  <Link href="/opportunities">
                    <Button variant="outline" size="sm">
                      View All Opportunities
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filtered.map(opp => (
                <Card key={opp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{opp.title}</h3>
                          {opp.isUrgent && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                          {opp.isRemote && (
                            <Badge variant="secondary" className="text-xs">Remote</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {opp.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {opp.location}
                          </span>
                          {opp.salary && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              {opp.salary}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge variant="outline" className="capitalize">
                          {opp.subType || opp.opportunityType}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {opp.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {opp.applicationDeadline && (
                          <span
                            className={`flex items-center gap-1 ${
                              isDeadlineSoon(opp.applicationDeadline)
                                ? 'text-orange-600 dark:text-orange-400 font-medium'
                                : ''
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            Deadline: {formatDate(opp.applicationDeadline)}
                            {isDeadlineSoon(opp.applicationDeadline) && ' (soon!)'}
                          </span>
                        )}
                      </div>
                      <Link href={`/opportunities/${opp.id}`}>
                        <Button size="sm">
                          View & Apply
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Application Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Application Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {APPLICATION_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
                    <p className="text-xs text-muted-foreground">Open Positions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {filtered.filter(o => o.isRemote).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Remote</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Success Stories
                </CardTitle>
                <CardDescription className="text-xs">
                  Students who found opportunities here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SUCCESS_STORIES.map((story, i) => (
                  <div key={i} className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs text-muted-foreground italic mb-1">
                      "{story.quote}"
                    </p>
                    <p className="text-xs font-medium text-foreground">{story.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {story.role} @ {story.company} · {story.year}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <Link href="/student/resources">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Learning Resources
                  </Button>
                </Link>
                <Link href="/mentorship">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Find a Mentor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
