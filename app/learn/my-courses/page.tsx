'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  BookOpen,
  Trophy,
  Play,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CourseEnrollment {
  id: string
  progress: Record<string, string> | null
  completedAt: string | null
  createdAt: string
  course: {
    id: string
    title: string
    slug: string
    description: string
    thumbnail?: string | null
    category: string
    level: string
    instructor: {
      username: string
      fullName: string
      avatar?: string | null
    }
    _count: {
      lessons: number
    }
  }
}

// ─── Course Card ─────────────────────────────────────────────────────────────

function CourseCard({
  enrollment,
  isCompleted,
}: {
  enrollment: CourseEnrollment
  isCompleted: boolean
}) {
  const { course, progress, completedAt } = enrollment
  const completedLessons = progress ? Object.keys(progress).length : 0
  const totalLessons = course._count.lessons
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  }

  // Find the first incomplete lesson to continue from
  const nextLessonHref = `/learn/${course.id}`

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-border bg-background">
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Thumbnail */}
        <div className="sm:w-48 shrink-0 bg-muted">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-36 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-36 sm:h-full flex items-center justify-center bg-muted">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-5">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge
              variant="outline"
              className={[
                'text-xs border capitalize',
                levelColors[course.level] ?? '',
              ].join(' ')}
            >
              {course.level}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {course.category.replace(/_/g, ' ')}
            </Badge>
          </div>

          <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-2">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-5 h-5">
              <AvatarImage
                src={course.instructor.avatar ?? undefined}
                alt={course.instructor.fullName}
              />
              <AvatarFallback className="text-[10px]">
                {course.instructor.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {course.instructor.fullName}
            </span>
          </div>

          {/* Progress */}
          {!isCompleted && (
            <div className="mb-4 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {completedLessons} / {totalLessons} lessons
                </span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          )}

          {isCompleted && completedAt && (
            <p className="text-xs text-muted-foreground mb-4">
              Completed{' '}
              {new Date(completedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}

          {/* CTA */}
          <Button
            asChild
            size="sm"
            variant={isCompleted ? 'outline' : 'default'}
            className="gap-2"
          >
            <Link href={nextLessonHref}>
              {isCompleted ? (
                <>
                  <Trophy className="w-4 h-4" />
                  View Course
                </>
              ) : pct === 0 ? (
                <>
                  <Play className="w-4 h-4" />
                  Start Learning
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Continue
                </>
              )}
            </Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="mt-4" variant="outline">
        <Link href="/learn">Browse Courses</Link>
      </Button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/login')
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/enrollments', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setEnrollments(data.enrollments ?? [])
      } catch {
        setError('Failed to load your courses.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const inProgress = enrollments.filter((e) => !e.completedAt)
  const completed = enrollments.filter((e) => !!e.completedAt)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            My Courses
          </h1>
          <p className="text-muted-foreground mt-1">
            {enrollments.length === 0
              ? "You haven't enrolled in any courses yet."
              : `${enrollments.length} enrolled course${enrollments.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <Tabs defaultValue="in-progress">
          <TabsList className="mb-6">
            <TabsTrigger value="in-progress" className="gap-1.5">
              In Progress
              {inProgress.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  {inProgress.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5">
              Completed
              {completed.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  {completed.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress">
            {inProgress.length === 0 ? (
              <EmptyState message="No courses in progress. Start learning today!" />
            ) : (
              <div className="space-y-4">
                {inProgress.map((e) => (
                  <CourseCard key={e.id} enrollment={e} isCompleted={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completed.length === 0 ? (
              <EmptyState message="You haven't completed any courses yet. Keep going!" />
            ) : (
              <div className="space-y-4">
                {completed.map((e) => (
                  <CourseCard key={e.id} enrollment={e} isCompleted={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
