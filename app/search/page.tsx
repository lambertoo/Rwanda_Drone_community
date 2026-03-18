'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  MessageSquare,
  FolderKanban,
  Calendar,
  Briefcase,
  FileText,
  GraduationCap,
  Users,
  Target,
  SlidersHorizontal,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ForumResult {
  id: string
  title: string
  content: string
  createdAt: string
  category: { name: string; slug?: string } | null
  author: { username: string; avatar?: string | null }
}

interface ProjectResult {
  id: string
  title: string
  description: string
  thumbnail?: string | null
  createdAt: string
  author: { username: string }
}

interface EventResult {
  id: string
  title: string
  description: string
  // The API field may be called 'date' or 'startDate' depending on version
  date?: string
  startDate?: string
  location: string
}

interface ServiceResult {
  id: string
  title: string
  description: string
  provider: { username: string; fullName: string }
}

interface ResourceResult {
  id: string
  title: string
  description?: string | null
  fileType: string
  createdAt: string
}

interface CourseResult {
  id: string
  title: string
  description: string
  category: string
  level: string
  instructor: { username: string }
}

interface UserResult {
  id: string
  username: string
  fullName: string
  avatar?: string | null
  role?: string | null
  location?: string | null
}

interface OpportunityResult {
  id: string
  title: string
  description: string
  // API may return either field
  type?: string
  opportunityType?: string
  createdAt: string
}

interface SearchResults {
  forum?: ForumResult[]
  projects?: ProjectResult[]
  events?: EventResult[]
  services?: ServiceResult[]
  resources?: ResourceResult[]
  courses?: CourseResult[]
  users?: UserResult[]
  opportunities?: OpportunityResult[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function snippet(text: string, max = 100): string {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}

// ─── Result Cards ─────────────────────────────────────────────────────────────

function ForumCard({ item }: { item: ForumResult }) {
  return (
    <Link
      href={`/forum/${item.category?.slug ?? 'general'}/${item.id}`}
      className="block p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
        {item.category && (
          <Badge variant="outline" className="text-xs shrink-0">
            {item.category.name}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {snippet(item.content)}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>@{item.author.username}</span>
        <span>·</span>
        <span>{formatDate(item.createdAt)}</span>
      </div>
    </Link>
  )
}

function ProjectCard({ item }: { item: ProjectResult }) {
  return (
    <Link
      href={`/projects/${item.id}`}
      className="block p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
    >
      <div className="flex gap-3">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-14 h-14 object-cover rounded-md shrink-0 bg-muted"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-snug mb-1">{item.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {snippet(item.description)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            by @{item.author.username}
          </p>
        </div>
      </div>
    </Link>
  )
}

function EventCard({ item }: { item: EventResult }) {
  const dateStr = item.startDate ?? item.date
  return (
    <Link
      href={`/events/${item.id}`}
      className="block p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
    >
      <h3 className="font-medium text-sm leading-snug mb-1">{item.title}</h3>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {dateStr && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(dateStr)}
          </span>
        )}
        {item.location && (
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {item.location}
          </span>
        )}
      </div>
    </Link>
  )
}

function ServiceCard({ item }: { item: ServiceResult }) {
  return (
    <Link
      href={`/services/${item.id}`}
      className="block p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
    >
      <h3 className="font-medium text-sm leading-snug mb-1">{item.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {snippet(item.description)}
      </p>
      <p className="text-xs text-muted-foreground">
        by {item.provider.fullName}
      </p>
    </Link>
  )
}

function ResourceCard({ item }: { item: ResourceResult }) {
  const ftColors: Record<string, string> = {
    PDF: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
    Video: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    Excel: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
    Word: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
  }
  return (
    <div className="p-4 rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
        <Badge
          variant="outline"
          className={['text-xs border', ftColors[item.fileType] ?? ''].join(' ')}
        >
          {item.fileType}
        </Badge>
      </div>
      {item.description && (
        <p className="text-xs text-muted-foreground line-clamp-1">
          {snippet(item.description)}
        </p>
      )}
    </div>
  )
}

function CourseCard({ item }: { item: CourseResult }) {
  const levelColors: Record<string, string> = {
    beginner: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  }
  return (
    <Link
      href={`/learn/${item.id}`}
      className="block p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
        <Badge
          variant="outline"
          className={['text-xs border capitalize', levelColors[item.level] ?? ''].join(' ')}
        >
          {item.level}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1 mb-1 capitalize">
        {item.category.replace(/_/g, ' ')}
      </p>
      <p className="text-xs text-muted-foreground">by @{item.instructor.username}</p>
    </Link>
  )
}

function UserCard({ item }: { item: UserResult }) {
  const roleLabel = item.role?.replace(/_/g, ' ') ?? ''
  return (
    <Link
      href={`/profile/${item.username}`}
      className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
    >
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src={item.avatar ?? undefined} alt={item.fullName} />
        <AvatarFallback>{item.fullName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{item.fullName}</p>
        <p className="text-xs text-muted-foreground">@{item.username}</p>
      </div>
      {roleLabel && (
        <Badge variant="outline" className="text-xs capitalize shrink-0">
          {roleLabel}
        </Badge>
      )}
    </Link>
  )
}

function OpportunityCard({ item }: { item: OpportunityResult }) {
  const type = item.opportunityType ?? item.type ?? ''
  return (
    <Link
      href={`/opportunities/${item.id}`}
      className="block p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
        {type && (
          <Badge variant="outline" className="text-xs capitalize shrink-0">
            {type}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {formatDate(item.createdAt)}
      </p>
    </Link>
  )
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  )
}

// ─── Count badge ─────────────────────────────────────────────────────────────

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <Badge
      variant="secondary"
      className="text-xs px-1.5 py-0 h-5 ml-1"
    >
      {count}
    </Badge>
  )
}

// ─── Section header (used in "All" tab) ──────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ElementType
  label: string
  count: number
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <h2 className="text-sm font-semibold text-foreground">{label}</h2>
      <CountBadge count={count} />
    </div>
  )
}

// ─── Core search UI (wrapped in Suspense) ────────────────────────────────────

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQ)
  const [inputVal, setInputVal] = useState(initialQ)
  const [results, setResults] = useState<SearchResults>({})
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Sync URL → input on navigation
  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setInputVal(q)
    setQuery(q)
  }, [searchParams])

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.trim().length < 2) {
      setResults({})
      setLoading(false)
      setSearched(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      doSearch(query.trim())
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const doSearch = async (q: string) => {
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&type=all`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResults(data.results ?? {})
    } catch {
      setResults({})
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = inputVal.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setQuery(q)
  }

  // Counts per category
  const counts = {
    forum: results.forum?.length ?? 0,
    projects: results.projects?.length ?? 0,
    events: results.events?.length ?? 0,
    services: results.services?.length ?? 0,
    resources: results.resources?.length ?? 0,
    courses: results.courses?.length ?? 0,
    users: results.users?.length ?? 0,
    opportunities: results.opportunities?.length ?? 0,
  }
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-6 h-6" />
            Search
          </h1>
          {/* Search input */}
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search courses, forum, events, people…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="pl-9 pr-4 h-11 text-sm bg-background border-border"
            />
          </form>
          {searched && !loading && (
            <p className="text-xs text-muted-foreground mt-2">
              {totalCount === 0
                ? `No results for "${query}"`
                : `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${query}"`}
            </p>
          )}
        </div>

        {/* Results */}
        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">Type to search across the platform</p>
          </div>
        )}

        {loading && <ResultSkeleton />}

        {searched && !loading && (
          <Tabs defaultValue="all">
            <TabsList className="flex-wrap h-auto gap-1 mb-6 bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-xs">
                All<CountBadge count={totalCount} />
              </TabsTrigger>
              <TabsTrigger value="forum" className="text-xs">
                Forum<CountBadge count={counts.forum} />
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs">
                Projects<CountBadge count={counts.projects} />
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs">
                Events<CountBadge count={counts.events} />
              </TabsTrigger>
              <TabsTrigger value="services" className="text-xs">
                Services<CountBadge count={counts.services} />
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">
                Resources<CountBadge count={counts.resources} />
              </TabsTrigger>
              <TabsTrigger value="courses" className="text-xs">
                Courses<CountBadge count={counts.courses} />
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs">
                Users<CountBadge count={counts.users} />
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="text-xs">
                Opportunities<CountBadge count={counts.opportunities} />
              </TabsTrigger>
            </TabsList>

            {/* ── All tab ── */}
            <TabsContent value="all">
              {totalCount === 0 ? (
                <EmptyState query={query} />
              ) : (
                <div className="space-y-10">
                  {counts.forum > 0 && (
                    <section>
                      <SectionHeader icon={MessageSquare} label="Forum Posts" count={counts.forum} />
                      <div className="space-y-2">
                        {results.forum!.map((item) => (
                          <ForumCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                  {counts.projects > 0 && (
                    <section>
                      <SectionHeader icon={FolderKanban} label="Projects" count={counts.projects} />
                      <div className="space-y-2">
                        {results.projects!.map((item) => (
                          <ProjectCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                  {counts.events > 0 && (
                    <section>
                      <SectionHeader icon={Calendar} label="Events" count={counts.events} />
                      <div className="space-y-2">
                        {results.events!.map((item) => (
                          <EventCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                  {counts.services > 0 && (
                    <section>
                      <SectionHeader icon={Briefcase} label="Services" count={counts.services} />
                      <div className="space-y-2">
                        {results.services!.map((item) => (
                          <ServiceCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                  {counts.resources > 0 && (
                    <section>
                      <SectionHeader icon={FileText} label="Resources" count={counts.resources} />
                      <div className="space-y-2">
                        {results.resources!.map((item) => (
                          <ResourceCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                  {counts.courses > 0 && (
                    <section>
                      <SectionHeader icon={GraduationCap} label="Courses" count={counts.courses} />
                      <div className="space-y-2">
                        {results.courses!.map((item) => (
                          <CourseCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                  {counts.users > 0 && (
                    <section>
                      <SectionHeader icon={Users} label="Users" count={counts.users} />
                      <div className="space-y-2">
                        {results.users!.map((item) => (
                          <UserCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                  {counts.opportunities > 0 && (
                    <section>
                      <SectionHeader icon={Target} label="Opportunities" count={counts.opportunities} />
                      <div className="space-y-2">
                        {results.opportunities!.map((item) => (
                          <OpportunityCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── Individual tabs ── */}
            <TabsContent value="forum">
              {counts.forum === 0 ? (
                <EmptyState query={query} category="forum posts" />
              ) : (
                <div className="space-y-2">
                  {results.forum!.map((item) => (
                    <ForumCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects">
              {counts.projects === 0 ? (
                <EmptyState query={query} category="projects" />
              ) : (
                <div className="space-y-2">
                  {results.projects!.map((item) => (
                    <ProjectCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events">
              {counts.events === 0 ? (
                <EmptyState query={query} category="events" />
              ) : (
                <div className="space-y-2">
                  {results.events!.map((item) => (
                    <EventCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="services">
              {counts.services === 0 ? (
                <EmptyState query={query} category="services" />
              ) : (
                <div className="space-y-2">
                  {results.services!.map((item) => (
                    <ServiceCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources">
              {counts.resources === 0 ? (
                <EmptyState query={query} category="resources" />
              ) : (
                <div className="space-y-2">
                  {results.resources!.map((item) => (
                    <ResourceCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses">
              {counts.courses === 0 ? (
                <EmptyState query={query} category="courses" />
              ) : (
                <div className="space-y-2">
                  {results.courses!.map((item) => (
                    <CourseCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users">
              {counts.users === 0 ? (
                <EmptyState query={query} category="users" />
              ) : (
                <div className="space-y-2">
                  {results.users!.map((item) => (
                    <UserCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="opportunities">
              {counts.opportunities === 0 ? (
                <EmptyState query={query} category="opportunities" />
              ) : (
                <div className="space-y-2">
                  {results.opportunities!.map((item) => (
                    <OpportunityCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  query,
  category,
}: {
  query: string
  category?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
      <p className="text-muted-foreground text-sm">
        No {category ?? 'results'} found for{' '}
        <span className="font-medium text-foreground">"{query}"</span>
      </p>
    </div>
  )
}

// ─── Exported Page (Suspense boundary required for useSearchParams) ──────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <ResultSkeleton />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
