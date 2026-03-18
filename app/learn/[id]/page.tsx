"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  BookOpen,
  Play,
  HelpCircle,
  Lock,
  CheckCircle2,
  Loader2,
  GraduationCap,
  FileText,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonType = "video" | "reading" | "quiz"
type CourseLevel = "beginner" | "intermediate" | "advanced"

interface Lesson {
  id: string
  title: string
  description?: string
  type: LessonType
  duration?: number        // minutes
  order: number
  isCompleted?: boolean    // injected from enrollment progress
}

interface Instructor {
  id: string
  fullName: string
  avatar?: string
  organization?: string
  bio?: string
}

interface EnrollmentRecord {
  id: string
  userId: string
  completedLessonIds: string[]
  nextLessonId?: string
}

interface Course {
  id: string
  title: string
  description: string
  longDescription?: string
  thumbnail?: string
  category: string
  level: CourseLevel
  price: number
  currency?: string
  enrollmentCount: number
  instructor: Instructor
  lessons: Lesson[]
  enrollments?: EnrollmentRecord[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<CourseLevel, string> = {
  beginner: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  intermediate: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  advanced: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  regulations: "from-blue-500 to-indigo-600",
  flying: "from-sky-500 to-cyan-600",
  photography: "from-rose-500 to-pink-600",
  survey: "from-amber-500 to-orange-600",
  fpv: "from-violet-500 to-purple-600",
  safety: "from-red-500 to-rose-600",
  exam_prep: "from-teal-500 to-green-600",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? "from-slate-500 to-gray-600"
}

function LessonIcon({ type, completed }: { type: LessonType; completed: boolean }) {
  if (completed) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
  }
  const props = { className: "h-4 w-4 shrink-0 text-muted-foreground" }
  switch (type) {
    case "video":
      return <Play {...props} />
    case "reading":
      return <BookOpen {...props} />
    case "quiz":
      return <HelpCircle {...props} />
    default:
      return <FileText {...props} />
  }
}

function formatDuration(minutes?: number): string | null {
  if (!minutes) return null
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { user } = useAuth()

  const [courseId, setCourseId] = useState<string>("")
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [justEnrolled, setJustEnrolled] = useState(false)

  // ── Resolve params ──────────────────────────────────────
  useEffect(() => {
    let mounted = true
    params.then(({ id }) => {
      if (mounted) setCourseId(id)
    })
    return () => {
      mounted = false
    }
  }, [params])

  // ── Fetch course ────────────────────────────────────────
  const fetchCourse = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/courses/${id}`, { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.course) throw new Error("No course data")
      setCourse(data.course)
    } catch (err: any) {
      setError(err.message ?? "Failed to load course")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (courseId) fetchCourse(courseId)
  }, [courseId, fetchCourse])

  // ── Enrollment helpers ──────────────────────────────────
  const myEnrollment: EnrollmentRecord | null =
    user && course?.enrollments
      ? (course.enrollments.find((e) => e.userId === user.id) ?? null)
      : null

  const isEnrolled = !!myEnrollment
  const completedIds = new Set(myEnrollment?.completedLessonIds ?? [])
  const totalLessons = course?.lessons.length ?? 0
  const completedCount = completedIds.size
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // First lesson id for "go to first lesson" button
  const sortedLessons = [...(course?.lessons ?? [])].sort((a, b) => a.order - b.order)
  const firstLessonId = sortedLessons[0]?.id

  // Next incomplete lesson
  const nextLesson =
    sortedLessons.find((l) => !completedIds.has(l.id)) ?? sortedLessons[0]

  const handleEnroll = async () => {
    if (!user) {
      window.location.href = "/login"
      return
    }
    setEnrolling(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setJustEnrolled(true)
        await fetchCourse(courseId)
      }
    } catch (err) {
      console.error("Enroll error:", err)
    } finally {
      setEnrolling(false)
    }
  }

  // ── Loading skeleton ────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading course…</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error / not found ───────────────────────────────────
  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <GraduationCap className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error ?? "This course does not exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/learn">Back to Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const levelLabel = course.level.charAt(0).toUpperCase() + course.level.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* ── Back button ─────────────────────────────────── */}
        <Link
          href="/learn"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Link>

        {/* ── Hero section ────────────────────────────────── */}
        <div className="mb-8">
          {/* Thumbnail */}
          <div className="relative w-full rounded-xl overflow-hidden mb-6" style={{ aspectRatio: "16/6" }}>
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(course.category)} flex items-center justify-center`}
              >
                <GraduationCap className="h-16 w-16 text-white/70" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              variant="outline"
              className={`capitalize ${LEVEL_COLORS[course.level]}`}
            >
              {levelLabel}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {course.category.replace("_", " ")}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {course.title}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* ── Main 2-column layout ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT: Description + Lesson list ──────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Long description */}
            {course.longDescription && (
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="text-lg">About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {course.longDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Progress bar (enrolled users) */}
            {isEnrolled && totalLessons > 0 && (
              <Card className="bg-background border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-semibold text-primary">
                      {progressPct}%
                    </span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {completedCount} of {totalLessons} lesson
                    {totalLessons !== 1 ? "s" : ""} completed
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Lesson list */}
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
                <CardDescription>
                  {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                  {course.lessons.reduce((acc, l) => acc + (l.duration ?? 0), 0) > 0 &&
                    ` · ${formatDuration(
                      course.lessons.reduce((acc, l) => acc + (l.duration ?? 0), 0)
                    )} total`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ol className="divide-y divide-border">
                  {sortedLessons.map((lesson, idx) => {
                    const completed = completedIds.has(lesson.id)
                    const isAccessible = isEnrolled

                    const inner = (
                      <div
                        className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                          isAccessible
                            ? "hover:bg-muted/50 cursor-pointer"
                            : "opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {/* Lesson number */}
                        <span className="text-xs text-muted-foreground w-5 pt-0.5 shrink-0 select-none">
                          {idx + 1}
                        </span>

                        {/* Icon */}
                        <LessonIcon type={lesson.type} completed={completed} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium leading-snug ${
                              completed ? "text-muted-foreground line-through" : "text-foreground"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        {/* Right side: duration or lock */}
                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.duration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                          {!isAccessible && (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          )}
                        </div>
                      </div>
                    )

                    return (
                      <li key={lesson.id}>
                        {isAccessible ? (
                          <Link
                            href={`/learn/${course.id}/lesson/${lesson.id}`}
                            className="block"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div>{inner}</div>
                        )}
                      </li>
                    )
                  })}

                  {totalLessons === 0 && (
                    <li className="px-5 py-8 text-center text-muted-foreground text-sm">
                      No lessons available yet.
                    </li>
                  )}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: Sidebar ───────────────────────────── */}
          <div className="space-y-5">
            {/* Price + Enroll card */}
            <Card className="bg-background border-border sticky top-4">
              <CardContent className="pt-5 space-y-4">
                {/* Price */}
                <div>
                  <span className="text-2xl font-bold">
                    {course.price === 0
                      ? "Free"
                      : `${course.price.toLocaleString()} ${course.currency ?? "RWF"}`}
                  </span>
                </div>

                <Separator />

                {/* CTA */}
                {isEnrolled ? (
                  <div className="space-y-3">
                    {justEnrolled && (
                      <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        Enrolled! You&apos;re all set.
                      </p>
                    )}
                    {nextLesson && (
                      <Button className="w-full" asChild>
                        <Link
                          href={`/learn/${course.id}/lesson/${nextLesson.id}`}
                        >
                          {completedCount === 0 ? "Start Learning" : "Continue Learning"}
                        </Link>
                      </Button>
                    )}
                    {firstLessonId && completedCount > 0 && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/learn/${course.id}/lesson/${firstLessonId}`}>
                          Restart from Beginning
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : justEnrolled ? (
                  <div className="space-y-3">
                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Enrolled! You&apos;re all set.
                    </p>
                    {firstLessonId && (
                      <Button className="w-full" asChild>
                        <Link href={`/learn/${course.id}/lesson/${firstLessonId}`}>
                          Go to First Lesson
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    disabled={enrolling}
                    onClick={handleEnroll}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enrolling…
                      </>
                    ) : course.price === 0 ? (
                      "Enroll for Free"
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                )}

                {/* Enrollment count */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {course.enrollmentCount.toLocaleString()} student
                    {course.enrollmentCount !== 1 ? "s" : ""} enrolled
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Instructor card */}
            <Card className="bg-background border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
                      {getInitials(course.instructor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm leading-tight">
                      {course.instructor.fullName}
                    </p>
                    {course.instructor.organization && (
                      <p className="text-xs text-muted-foreground">
                        {course.instructor.organization}
                      </p>
                    )}
                  </div>
                </div>
                {course.instructor.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {course.instructor.bio}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Course at a glance */}
            <Card className="bg-background border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">
                    {course.category.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                {course.lessons.reduce((acc, l) => acc + (l.duration ?? 0), 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Duration</span>
                    <span className="font-medium">
                      {formatDuration(
                        course.lessons.reduce((acc, l) => acc + (l.duration ?? 0), 0)
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
