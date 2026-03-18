"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  BookOpen,
  Users,
  Loader2,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Instructor {
  id: string
  fullName: string
  avatar?: string
  organization?: string
}

interface Enrollment {
  id: string
  userId: string
  completedLessons: number
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
  price: number
  currency?: string
  enrollmentCount: number
  instructor: Instructor
  enrollments?: Enrollment[]
  lessonsCount?: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_TABS = [
  { label: "All", value: "all" },
  { label: "Regulations", value: "regulations" },
  { label: "Flying Skills", value: "flying" },
  { label: "Photography", value: "photography" },
  { label: "Survey & Mapping", value: "survey" },
  { label: "FPV Racing", value: "fpv" },
  { label: "Safety", value: "safety" },
  { label: "CAA Exam Prep", value: "exam_prep" },
]

const LEVEL_COLORS: Record<string, string> = {
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
  all: "from-slate-500 to-gray-600",
}

const CREATOR_ROLES = ["admin", "pilot", "service_provider"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Sub-components ──────────────────────────────────────────────────────────

function CourseCard({
  course,
  isEnrolled,
  nextLessonId,
}: {
  course: Course
  isEnrolled: boolean
  nextLessonId?: string
}) {
  const levelLabel =
    course.level.charAt(0).toUpperCase() + course.level.slice(1)

  return (
    <Link href={`/learn/${course.id}`} className="block group">
      <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg border-border bg-background">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(course.category)} flex items-center justify-center`}
            >
              <GraduationCap className="h-12 w-12 text-white/80" />
            </div>
          )}
          {/* Free / Paid badge */}
          <div className="absolute top-2 left-2">
            {course.price === 0 ? (
              <Badge className="bg-emerald-600 text-white border-0 text-xs">
                Free
              </Badge>
            ) : (
              <Badge className="bg-background/90 text-foreground border-border text-xs">
                {course.price.toLocaleString()} {course.currency ?? "RWF"}
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge
              variant="outline"
              className={`text-xs capitalize ${LEVEL_COLORS[course.level] ?? ""}`}
            >
              {levelLabel}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize">
              {course.category.replace("_", " ")}
            </Badge>
          </div>
          <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Instructor row */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={course.instructor.avatar} />
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {getInitials(course.instructor.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {course.instructor.fullName}
            </span>
          </div>

          <Separator />

          {/* Stats + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{course.enrollmentCount.toLocaleString()} enrolled</span>
            </div>

            {isEnrolled ? (
              <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                <span>
                  {nextLessonId ? "Continue" : "Review"}
                </span>
              </Button>
            ) : (
              <Button size="sm" className="h-7 text-xs" asChild>
                <span>Enroll</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyState({ category }: { category: string }) {
  const label =
    CATEGORY_TABS.find((t) => t.value === category)?.label ?? "this category"
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-5 mb-4">
        <BookOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No courses found</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        {category === "all"
          ? "There are no courses available yet. Check back soon."
          : `There are no courses in "${label}" yet. Check back soon or explore another category.`}
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const { user } = useAuth()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")

  const canCreate =
    !!user && CREATOR_ROLES.includes(user.role ?? "")

  // Fetch whenever filters change
  useEffect(() => {
    const controller = new AbortController()

    const fetchCourses = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeCategory !== "all") params.set("category", activeCategory)
        if (selectedLevel !== "all") params.set("level", selectedLevel)

        const res = await fetch(`/api/courses?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setCourses(data.courses ?? [])
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch courses:", err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
    return () => controller.abort()
  }, [activeCategory, selectedLevel])

  // Determine enrollment & next lesson per course
  function getEnrollmentInfo(course: Course): {
    isEnrolled: boolean
    nextLessonId?: string
  } {
    if (!user || !course.enrollments?.length) return { isEnrolled: false }
    const enrollment = course.enrollments.find((e) => e.userId === user.id)
    if (!enrollment) return { isEnrolled: false }
    return { isEnrolled: true }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Learn &amp; Get Certified
          </h1>
          <p className="text-muted-foreground mt-1">
            Advance your drone skills with expert-led courses and earn
            recognized certifications.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <Button variant="outline" asChild>
              <Link href="/learn/my-courses">My Courses</Link>
            </Button>
          )}
          {canCreate && (
            <Button asChild>
              <Link href="/learn/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Category Tabs (scrollable) ───────────────────────── */}
      <div className="mb-5 overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                activeCategory === tab.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Level Filter ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </span>
          ) : (
            `${courses.length} course${courses.length !== 1 ? "s" : ""} found`
          )}
        </p>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-44 bg-background">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Course Grid ──────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardHeader className="space-y-2 pb-2">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-4/5" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <EmptyState category={activeCategory} />
          ) : (
            courses.map((course) => {
              const { isEnrolled, nextLessonId } = getEnrollmentInfo(course)
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={isEnrolled}
                  nextLessonId={nextLessonId}
                />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
