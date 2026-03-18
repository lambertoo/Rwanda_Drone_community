'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users, MessageSquare, Calendar, FolderOpen, BookOpen,
  Briefcase, FileText, GraduationCap, Plane, BarChart3, TrendingUp,
} from 'lucide-react'

interface Stats {
  totals: {
    users: number
    projects: number
    events: number
    forumPosts: number
    services: number
    opportunities: number
    resources: number
    courses: number
    enrollments: number
    flightLogs: number
    drones: number
  }
  roles: { role: string; count: number }[]
  last30Days: { users: number; projects: number; forumPosts: number }
  topForumCategories: { name: string; slug: string; postCount: number }[]
  generatedAt: string
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: number
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  superadmin: 'Superadmin',
  pilot: 'Pilot',
  hobbyist: 'Hobbyist',
  student: 'Student',
  regulator: 'Regulator',
  service_provider: 'Service Provider',
  unknown: 'Unknown',
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Community Statistics</h1>
        </div>
        <p className="text-muted-foreground">
          Live snapshot of the Rwanda Drone Community platform
        </p>
        {stats && (
          <p className="text-xs text-muted-foreground/60">
            Last updated: {new Date(stats.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Main Stat Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Community Members" value={stats.totals.users} />
            <StatCard icon={FolderOpen} label="Projects" value={stats.totals.projects} />
            <StatCard icon={Calendar} label="Events" value={stats.totals.events} />
            <StatCard icon={MessageSquare} label="Forum Posts" value={stats.totals.forumPosts} />
            <StatCard icon={Briefcase} label="Services" value={stats.totals.services} sub="approved" />
            <StatCard icon={FileText} label="Opportunities" value={stats.totals.opportunities} sub="published" />
            <StatCard icon={BookOpen} label="Resources" value={stats.totals.resources} sub="approved" />
            <StatCard icon={GraduationCap} label="Courses" value={stats.totals.courses} sub="published" />
            <StatCard icon={GraduationCap} label="Enrollments" value={stats.totals.enrollments} />
            <StatCard icon={Plane} label="Flight Logs" value={stats.totals.flightLogs} />
            <StatCard icon={Plane} label="Registered Drones" value={stats.totals.drones} />
          </div>

          {/* 30-day growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-500">+{stats.last30Days.users}</p>
                  <p className="text-sm text-muted-foreground">New Members</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-500">+{stats.last30Days.projects}</p>
                  <p className="text-sm text-muted-foreground">New Projects</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-500">+{stats.last30Days.forumPosts}</p>
                  <p className="text-sm text-muted-foreground">Forum Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two column: roles + forum categories */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members by Role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.roles.map(r => (
                  <div key={r.role} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{ROLE_LABELS[r.role] ?? r.role}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 rounded-full bg-primary/20 w-32 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${Math.round((r.count / stats.totals.users) * 100)}%` }}
                        />
                      </div>
                      <Badge variant="secondary" className="min-w-[2.5rem] text-center">
                        {r.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Top Forum Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topForumCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No forum categories yet</p>
                ) : (
                  stats.topForumCategories.map((c, i) => (
                    <div key={c.slug} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs w-4">{i + 1}.</span>
                        <span className="text-sm">{c.name}</span>
                      </div>
                      <Badge variant="outline">{c.postCount} posts</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load statistics
          </CardContent>
        </Card>
      )}
    </div>
  )
}
