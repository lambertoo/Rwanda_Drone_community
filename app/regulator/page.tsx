'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  Eye,
  CheckSquare,
  BarChart3,
  Plane,
  MapPin,
  Clock,
  Lock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface OverviewCounts {
  totalPilots: number
  totalDrones: number
  totalFlightLogs: number
  openSafetyReports: number
  pendingPermits: number
}

interface SafetyReport {
  id: string
  type: string
  date: string
  location: string
  injuries: boolean
  propertyDamage: boolean
  status: string
  isAnonymous: boolean
  createdAt: string
  reporter?: { username: string; fullName: string; avatar?: string }
}

export default function RegulatorDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [counts, setCounts] = useState<OverviewCounts | null>(null)
  const [recentReports, setRecentReports] = useState<SafetyReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && (user.role === 'regulator' || user.role === 'admin')) {
      fetchOverview()
    }
  }, [user])

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/regulator/overview', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCounts(data.counts)
        setRecentReports(data.recentSafetyReports)
      }
    } catch (error) {
      console.error('Error fetching overview:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || (user.role !== 'regulator' && user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="h-14 w-14 mx-auto mb-4 text-red-500 opacity-70" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              This section is restricted to users with the Regulator or Admin role.
            </p>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
      case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      default: return 'bg-muted text-foreground dark:bg-gray-700 dark:text-muted-foreground/50'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Regulator Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {user.fullName}. Monitor platform activity and compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: 'Total Pilots',
              value: counts?.totalPilots ?? '—',
              icon: Users,
              color: 'text-blue-500',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              label: 'Registered Drones',
              value: counts?.totalDrones ?? '—',
              icon: Plane,
              color: 'text-purple-500',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
            },
            {
              label: 'Flight Logs',
              value: counts?.totalFlightLogs ?? '—',
              icon: Activity,
              color: 'text-green-500',
              bg: 'bg-green-50 dark:bg-green-900/20',
            },
            {
              label: 'Open Incidents',
              value: counts?.openSafetyReports ?? '—',
              icon: AlertTriangle,
              color: 'text-red-500',
              bg: 'bg-red-50 dark:bg-red-900/20',
            },
            {
              label: 'Pending Permits',
              value: counts?.pendingPermits ?? '—',
              icon: FileText,
              color: 'text-orange-500',
              bg: 'bg-orange-50 dark:bg-orange-900/20',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-4">
                <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? <span className="animate-pulse text-muted-foreground/70">...</span> : value}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/regulator/incidents">
                <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="text-left">
                      <p className="font-medium text-sm">View Incidents</p>
                      <p className="text-xs text-muted-foreground">Review safety reports</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/regulator/review">
                <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Review Content</p>
                      <p className="text-xs text-muted-foreground">Approve or reject content</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/regulator/compliance">
                <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Compliance Overview</p>
                      <p className="text-xs text-muted-foreground">Pilot licenses &amp; insurance</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Safety Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Recent Safety Reports
              </CardTitle>
              <CardDescription>Latest incident submissions</CardDescription>
            </div>
            <Link href="/regulator/incidents">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No safety reports yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.slice(0, 6).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border dark:border-gray-700"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{report.type.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{report.location}</span>
                          <Clock className="h-3 w-3 ml-1" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        {(report.injuries || report.propertyDamage) && (
                          <div className="flex gap-1.5 mt-1">
                            {report.injuries && (
                              <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                Injuries
                              </Badge>
                            )}
                            {report.propertyDamage && (
                              <Badge className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                Property Damage
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${statusColor(report.status)}`}>
                      {report.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
