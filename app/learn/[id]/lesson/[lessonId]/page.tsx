'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Video,
  BookOpen,
  HelpCircle,
  Loader2,
  ArrowLeft,
  Trophy,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string
  options: string[]
  answer: string
}

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string | null
  duration?: number | null
  order: number
  type: string
  quiz?: QuizQuestion[] | null
}

interface Enrollment {
  id: string
  progress: Record<string, string> | null
  completedAt: string | null
}

interface Course {
  id: string
  title: string
  lessons: Lesson[]
  enrollments?: Enrollment[]
  instructor: {
    username: string
    fullName: string
    avatar?: string | null
  }
  _count: {
    lessons: number
  }
}

// ─── Lesson type helpers ─────────────────────────────────────────────────────

function getLessonTypeBadge(type: string) {
  switch (type) {
    case 'video':
      return (
        <Badge variant="secondary" className="gap-1">
          <Video className="w-3 h-3" /> Video
        </Badge>
      )
    case 'quiz':
      return (
        <Badge variant="secondary" className="gap-1">
          <HelpCircle className="w-3 h-3" /> Quiz
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <BookOpen className="w-3 h-3" /> Reading
        </Badge>
      )
  }
}

// ─── Quiz Component ──────────────────────────────────────────────────────────

function QuizSection({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return
    setSubmitted(true)
  }

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.answer).length
    : 0

  return (
    <div className="mt-8 border border-border rounded-xl p-6 bg-muted/40">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        Quiz
      </h3>

      {submitted && (
        <div className="mb-6 p-4 rounded-lg bg-background border border-border flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">
            Score: {score} / {questions.length}
            {score === questions.length && ' — Perfect!'}
          </span>
        </div>
      )}

      <div className="space-y-8">
        {questions.map((q, qi) => {
          const userAnswer = answers[qi]
          const isCorrect = submitted && userAnswer === q.answer
          const isWrong = submitted && userAnswer !== q.answer

          return (
            <div key={qi} className="space-y-3">
              <p className="font-medium">
                {qi + 1}. {q.question}
              </p>
              <RadioGroup
                value={userAnswer ?? ''}
                onValueChange={(val) => {
                  if (!submitted) setAnswers((prev) => ({ ...prev, [qi]: val }))
                }}
                disabled={submitted}
              >
                {q.options.map((opt, oi) => {
                  const isThisCorrect = submitted && opt === q.answer
                  const isThisWrong = submitted && opt === userAnswer && opt !== q.answer

                  return (
                    <div
                      key={oi}
                      className={[
                        'flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors',
                        isThisCorrect
                          ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                          : isThisWrong
                          ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                          : 'border-border bg-background',
                      ].join(' ')}
                    >
                      <RadioGroupItem value={opt} id={`q${qi}-o${oi}`} />
                      <Label
                        htmlFor={`q${qi}-o${oi}`}
                        className="cursor-pointer flex-1"
                      >
                        {opt}
                      </Label>
                      {isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                      {isThisWrong && (
                        <X className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          )
        })}
      </div>

      {!submitted && (
        <Button
          className="mt-6"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
        >
          Submit Answers
        </Button>
      )}
      {submitted && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setAnswers({})
            setSubmitted(false)
          }}
        >
          Retake Quiz
        </Button>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LessonViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch course
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/learn/${courseId}`)
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/courses/${courseId}`, { credentials: 'include' })
        if (!res.ok) {
          setError('Course not found.')
          return
        }
        const data = await res.json()
        const c: Course = data.course

        // Redirect if not enrolled
        if (!c.enrollments || c.enrollments.length === 0) {
          router.replace(`/learn/${courseId}`)
          return
        }

        setCourse(c)
        const enrollment = c.enrollments[0]
        setProgress((enrollment.progress as Record<string, string>) ?? {})
      } catch {
        setError('Failed to load course.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, authLoading, user, router])

  const lesson = course?.lessons.find((l) => l.id === lessonId)

  const currentIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1
  const prevLesson =
    currentIndex > 0 ? course?.lessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && course && currentIndex < course.lessons.length - 1
      ? course.lessons[currentIndex + 1]
      : null

  const markComplete = useCallback(async () => {
    if (!course || !lesson || progress[lessonId]) return
    setMarking(true)
    try {
      const res = await fetch(
        `/api/courses/${courseId}/lessons/${lessonId}/progress`,
        { method: 'POST', credentials: 'include' }
      )
      if (res.ok) {
        setProgress((prev) => ({ ...prev, [lessonId]: new Date().toISOString() }))
      }
    } finally {
      setMarking(false)
    }
  }, [course, lesson, lessonId, courseId, progress])

  // ── Loading / error states ──
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !course || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground">
        <p className="text-muted-foreground">{error ?? 'Lesson not found.'}</p>
        <Button asChild variant="outline">
          <Link href={`/learn/${courseId}`}>Back to Course</Link>
        </Button>
      </div>
    )
  }

  const completedCount = Object.keys(progress).length
  const totalLessons = course._count.lessons
  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0
  const isCompleted = !!progress[lessonId]

  // ── Sidebar content ──
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Course header */}
      <div className="p-4 border-b border-border">
        <Link
          href={`/learn/${courseId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to course
        </Link>
        <p className="font-semibold text-sm leading-tight line-clamp-2">
          {course.title}
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedCount} / {totalLessons} lessons
            </span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </div>

      {/* Lesson list */}
      <ScrollArea className="flex-1">
        <ul className="p-2 space-y-0.5">
          {course.lessons.map((l, idx) => {
            const done = !!progress[l.id]
            const active = l.id === lessonId
            return (
              <li key={l.id}>
                <Link
                  href={`/learn/${courseId}/lesson/${l.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={[
                    'flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-foreground',
                  ].join(' ')}
                >
                  <span className="shrink-0 mt-0.5">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="flex-1 leading-snug">
                    <span className="text-xs text-muted-foreground mr-1.5">
                      {idx + 1}.
                    </span>
                    {l.title}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r border-border bg-background">
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-72 bg-background border-r border-border h-full">
            <button
              className="absolute top-3 right-3 p-1 rounded hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border bg-background shrink-0">
          <button
            className="lg:hidden p-1.5 rounded hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getLessonTypeBadge(lesson.type)}
            <h1 className="font-semibold text-base truncate">{lesson.title}</h1>
          </div>
          {lesson.duration && (
            <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
              {lesson.duration} min
            </span>
          )}
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">

            {/* ── Video ── */}
            {lesson.videoUrl && (
              <div className="mb-8 rounded-xl overflow-hidden border border-border bg-black aspect-video">
                {lesson.videoUrl.includes('youtube.com') ||
                lesson.videoUrl.includes('youtu.be') ||
                lesson.videoUrl.includes('vimeo.com') ? (
                  <iframe
                    src={
                      lesson.videoUrl.includes('youtu.be')
                        ? lesson.videoUrl.replace(
                            'youtu.be/',
                            'www.youtube.com/embed/'
                          )
                        : lesson.videoUrl.includes('watch?v=')
                        ? lesson.videoUrl.replace('watch?v=', 'embed/')
                        : lesson.videoUrl
                    }
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                ) : (
                  <video
                    src={lesson.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            )}

            {/* ── Content ── */}
            {lesson.content && (
              <div className="prose prose-sm max-w-none dark:prose-invert mb-8">
                <pre
                  style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                  className="bg-transparent p-0 m-0 text-foreground text-sm leading-relaxed"
                >
                  {lesson.content}
                </pre>
              </div>
            )}

            {/* ── Quiz ── */}
            {lesson.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length > 0 && (
              <QuizSection questions={lesson.quiz as QuizQuestion[]} />
            )}

            {/* ── Mark complete + navigation ── */}
            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
              {/* Prev */}
              <Button
                variant="outline"
                asChild={!!prevLesson}
                disabled={!prevLesson}
                className="gap-2"
                onClick={() => {
                  if (prevLesson)
                    router.push(`/learn/${courseId}/lesson/${prevLesson.id}`)
                }}
              >
                <span>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </span>
              </Button>

              {/* Mark complete */}
              {isCompleted ? (
                <Badge className="gap-1.5 py-1.5 px-3 bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 border">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </Badge>
              ) : (
                <Button
                  onClick={markComplete}
                  disabled={marking}
                  className="gap-2"
                >
                  {marking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Mark as Complete
                </Button>
              )}

              {/* Next */}
              <Button
                variant="outline"
                asChild={!!nextLesson}
                disabled={!nextLesson}
                className="gap-2"
                onClick={() => {
                  if (nextLesson)
                    router.push(`/learn/${courseId}/lesson/${nextLesson.id}`)
                }}
              >
                <span>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
