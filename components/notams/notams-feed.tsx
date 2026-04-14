"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertOctagon, Clock, MapPin, Calendar, Info } from "lucide-react"

interface Notam {
  id: string
  name: string
  description: string
  type: string
  lat: number
  lon: number
  radius: number
  severity: string
  province: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  createdBy?: { fullName?: string; username?: string }
}

const SEVERITY_STYLES: Record<string, string> = {
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300",
}

function timeRemaining(endIso: string | null): string {
  if (!endIso) return "Open-ended"
  const ms = new Date(endIso).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const days = Math.floor(ms / 86400000)
  const hrs = Math.floor((ms % 86400000) / 3600000)
  if (days >= 1) return `${days}d ${hrs}h remaining`
  const mins = Math.floor((ms % 3600000) / 60000)
  return `${hrs}h ${mins}m remaining`
}

function isStartingSoon(startIso: string | null): boolean {
  if (!startIso) return false
  const ms = new Date(startIso).getTime() - Date.now()
  return ms > 0 && ms < 24 * 3600000
}

export default function NotamsFeed() {
  const [notams, setNotams] = useState<Notam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/airspace/zones", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          const temp = d.filter((z: Notam) => !!z.endDate)
          temp.sort((a: Notam, b: Notam) => {
            const ea = a.endDate ? new Date(a.endDate).getTime() : Infinity
            const eb = b.endDate ? new Date(b.endDate).getTime() : Infinity
            return ea - eb
          })
          setNotams(temp)
        } else {
          setError("Failed to load notices")
        }
      })
      .catch(() => setError("Failed to load notices"))
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    const active: Notam[] = []
    const upcoming: Notam[] = []
    const now = Date.now()
    for (const n of notams) {
      if (n.startDate && new Date(n.startDate).getTime() > now) upcoming.push(n)
      else active.push(n)
    }
    return { active, upcoming }
  }, [notams])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertOctagon className="w-4 h-4" />
        <AlertTitle>Couldn't load notices</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>Temporary airspace notices (NOTAM-style)</AlertTitle>
        <AlertDescription>
          Time-bound restrictions posted by authorities. These supplement the permanent zones shown on the airspace map.
          Always cross-check with official Rwanda CAA NOTAMs before flight.
        </AlertDescription>
      </Alert>

      {grouped.active.length === 0 && grouped.upcoming.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No active temporary notices</h3>
            <p className="text-muted-foreground text-sm">
              No temporary airspace restrictions are in effect right now. Permanent restricted zones still apply — check the airspace map.
            </p>
          </CardContent>
        </Card>
      )}

      {grouped.active.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              Active now ({grouped.active.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grouped.active.map((n) => (
              <NotamCard key={n.id} n={n} />
            ))}
          </CardContent>
        </Card>
      )}

      {grouped.upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Upcoming ({grouped.upcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grouped.upcoming.map((n) => (
              <NotamCard key={n.id} n={n} upcoming />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function NotamCard({ n, upcoming }: { n: Notam; upcoming?: boolean }) {
  const sevClass = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.blue
  const soon = isStartingSoon(n.startDate)
  return (
    <div className={`rounded-lg border-l-4 p-4 ${sevClass}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="font-semibold text-base">{n.name}</h4>
          <p className="text-sm opacity-90 mt-0.5">{n.description}</p>
        </div>
        <Badge variant="outline" className="capitalize shrink-0">
          {n.type}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t border-current/20">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono">
            {n.lat.toFixed(4)}, {n.lon.toFixed(4)} · {n.radius} km
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            {n.startDate ? new Date(n.startDate).toLocaleDateString() : "Now"} →{" "}
            {n.endDate ? new Date(n.endDate).toLocaleDateString() : "Open"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className={soon ? "font-semibold" : ""}>
            {upcoming
              ? n.startDate
                ? `Starts ${new Date(n.startDate).toLocaleString()}`
                : "Pending"
              : timeRemaining(n.endDate)}
          </span>
        </div>
      </div>

      {n.province && (
        <p className="text-xs mt-2 opacity-75">
          Province: <strong>{n.province}</strong>
        </p>
      )}
      {n.createdBy?.fullName && (
        <p className="text-xs mt-1 opacity-60">Issued by {n.createdBy.fullName}</p>
      )}
    </div>
  )
}
