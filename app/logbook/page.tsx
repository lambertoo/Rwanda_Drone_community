'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Plus,
  Clock,
  MapPin,
  Plane,
  AlertTriangle,
  Download,
  Filter,
  Navigation,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface FlightLog {
  id: string
  date: string
  startTime: string | null
  endTime: string | null
  duration: number | null
  location: string
  latitude: number | null
  longitude: number | null
  maxAltitude: number | null
  maxDistance: number | null
  distanceTraveled: number | null
  purpose: string
  notes: string | null
  incidentOccurred: boolean
  incidentDescription: string | null
  weather: { conditions?: string; windSpeed?: number } | null
  isPublic: boolean
  createdAt: string
  drone: { id: string; name: string; brand: string; model: string } | null
}

interface Drone {
  id: string
  name: string
  brand: string
  model: string
}

const purposeConfig: Record<string, { label: string; color: string }> = {
  hobby: { label: 'Hobby', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  photography: { label: 'Photography', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  survey: { label: 'Survey', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  delivery: { label: 'Delivery', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  racing: { label: 'Racing', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  training: { label: 'Training', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  commercial: { label: 'Commercial', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
  inspection: { label: 'Inspection', color: 'bg-muted text-foreground dark:bg-gray-800 dark:text-muted-foreground/70' },
}

export default function LogbookPage() {
  const { isAuthenticated, loading } = useAuth()
  const [logs, setLogs] = useState<FlightLog[]>([])
  const [drones, setDrones] = useState<Drone[]>([])
  const [fetching, setFetching] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [filterDrone, setFilterDrone] = useState('all')
  const [filterPurpose, setFilterPurpose] = useState('all')
  const [filterIncident, setFilterIncident] = useState(false)
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const [form, setForm] = useState({
    droneId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    duration: '',
    location: '',
    latitude: '',
    longitude: '',
    maxAltitude: '',
    maxDistance: '',
    distanceTraveled: '',
    purpose: 'hobby',
    notes: '',
    incidentOccurred: false,
    incidentDescription: '',
    weatherConditions: 'Good',
    weatherWindSpeed: '',
    isPublic: false,
  })

  const fetchData = async () => {
    try {
      const [logsRes, dronesRes] = await Promise.all([
        fetch('/api/logbook'),
        fetch('/api/drones'),
      ])
      if (logsRes.ok) {
        const data = await logsRes.json()
        setLogs(data.logs)
      }
      if (dronesRes.ok) {
        const data = await dronesRes.json()
        setDrones(data.drones)
      }
    } catch {
      // ignore
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchData()
    else if (!loading) setFetching(false)
  }, [isAuthenticated, loading])

  // Auto-calc duration from start/end times
  useEffect(() => {
    if (form.startTime && form.endTime) {
      const start = form.startTime.split(':').map(Number)
      const end = form.endTime.split(':').map(Number)
      const startMin = start[0] * 60 + start[1]
      const endMin = end[0] * 60 + end[1]
      if (endMin > startMin) {
        setForm((f) => ({ ...f, duration: String(endMin - startMin) }))
      }
    }
  }, [form.startTime, form.endTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        droneId: form.droneId || undefined,
        date: form.date,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        duration: form.duration || undefined,
        location: form.location,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        maxAltitude: form.maxAltitude || undefined,
        maxDistance: form.maxDistance || undefined,
        distanceTraveled: form.distanceTraveled || undefined,
        purpose: form.purpose,
        notes: form.notes || undefined,
        incidentOccurred: form.incidentOccurred,
        incidentDescription: form.incidentOccurred
          ? form.incidentDescription
          : undefined,
        weather: {
          conditions: form.weatherConditions,
          windSpeed: form.weatherWindSpeed ? parseFloat(form.weatherWindSpeed) : undefined,
        },
        isPublic: form.isPublic,
      }

      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Flight logged successfully!')
        setLogs((prev) => [data.log, ...prev])
        setDialogOpen(false)
        setForm({
          droneId: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          duration: '',
          location: '',
          latitude: '',
          longitude: '',
          maxAltitude: '',
          maxDistance: '',
          distanceTraveled: '',
          purpose: 'hobby',
          notes: '',
          incidentOccurred: false,
          incidentDescription: '',
          weatherConditions: 'Good',
          weatherWindSpeed: '',
          isPublic: false,
        })
      } else {
        toast.error(data.error || 'Failed to log flight')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Location',
      'Duration (min)',
      'Drone',
      'Purpose',
      'Max Altitude (m)',
      'Distance (km)',
      'Incident',
      'Notes',
    ]
    const rows = filteredLogs.map((l) => [
      new Date(l.date).toLocaleDateString(),
      l.location,
      l.duration ?? '',
      l.drone ? `${l.drone.name} (${l.drone.brand} ${l.drone.model})` : '',
      l.purpose,
      l.maxAltitude ?? '',
      l.distanceTraveled ?? '',
      l.incidentOccurred ? 'Yes' : 'No',
      l.notes ?? '',
    ])

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flight-logbook-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Logbook exported as CSV')
  }

  const filteredLogs = logs.filter((l) => {
    if (filterDrone !== 'all' && l.drone?.id !== filterDrone) return false
    if (filterPurpose !== 'all' && l.purpose !== filterPurpose) return false
    if (filterIncident && !l.incidentOccurred) return false
    if (filterDateFrom && new Date(l.date) < new Date(filterDateFrom)) return false
    if (filterDateTo && new Date(l.date) > new Date(filterDateTo)) return false
    return true
  })

  const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0)
  const totalHours = (totalMinutes / 60).toFixed(1)
  const totalDist = logs.reduce((s, l) => s + (l.distanceTraveled || 0), 0).toFixed(1)
  const incidentFreeStreak = (() => {
    let streak = 0
    for (const l of logs) {
      if (l.incidentOccurred) break
      streak++
    }
    return streak
  })()

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Plane className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Sign in to view your logbook</h2>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flight Logbook</h1>
          <p className="text-muted-foreground mt-1">
            Track every flight — build your flight history automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log Flight
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log a Flight</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="e.g., Kigali, Gasabo District"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      placeholder="Auto-calculated or enter manually"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Drone</Label>
                    <Select
                      value={form.droneId}
                      onValueChange={(v) => setForm((f) => ({ ...f, droneId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select drone (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No drone selected</SelectItem>
                        {drones.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} ({d.brand} {d.model})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Select
                    value={form.purpose}
                    onValueChange={(v) => setForm((f) => ({ ...f, purpose: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(purposeConfig).map(([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                      placeholder="-1.9403"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                      placeholder="29.8739"
                    />
                  </div>
                </div>

                {/* Flight metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Max Altitude (m)</Label>
                    <Input
                      type="number"
                      value={form.maxAltitude}
                      onChange={(e) => setForm((f) => ({ ...f, maxAltitude: e.target.value }))}
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.maxDistance}
                      onChange={(e) => setForm((f) => ({ ...f, maxDistance: e.target.value }))}
                      placeholder="2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Distance Traveled (km)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.distanceTraveled}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, distanceTraveled: e.target.value }))
                      }
                      placeholder="5.0"
                    />
                  </div>
                </div>

                {/* Weather */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weather Conditions</Label>
                    <Select
                      value={form.weatherConditions}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, weatherConditions: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                        <SelectItem value="Dangerous">Dangerous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wind Speed (km/h)</Label>
                    <Input
                      type="number"
                      value={form.weatherWindSpeed}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, weatherWindSpeed: e.target.value }))
                      }
                      placeholder="10"
                    />
                  </div>
                </div>

                {/* Incident */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="incidentOccurred"
                      checked={form.incidentOccurred}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, incidentOccurred: e.target.checked }))
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="incidentOccurred" className="cursor-pointer">
                      Incident occurred during this flight
                    </Label>
                  </div>
                  {form.incidentOccurred && (
                    <div className="space-y-2">
                      <Label>Incident Description</Label>
                      <Textarea
                        value={form.incidentDescription}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, incidentDescription: e.target.value }))
                        }
                        placeholder="Describe what happened..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Notes & Public */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional observations or notes..."
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={form.isPublic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isPublic: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    Make this flight log public
                  </Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Logging...' : 'Log Flight'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.length}</p>
              <p className="text-xs text-muted-foreground">Total Flights</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-xs text-muted-foreground">Total Hours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Navigation className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDist}</p>
              <p className="text-xs text-muted-foreground">Total km</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{incidentFreeStreak}</p>
              <p className="text-xs text-muted-foreground">Incident-Free Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Filter by Drone</Label>
              <Select value={filterDrone} onValueChange={setFilterDrone}>
                <SelectTrigger className="w-[160px] h-8 text-sm">
                  <SelectValue placeholder="All Drones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drones</SelectItem>
                  {drones.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Filter by Purpose</Label>
              <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue placeholder="All Purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  {Object.entries(purposeConfig).map(([v, { label }]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="h-8 text-sm w-[140px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="h-8 text-sm w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <input
                type="checkbox"
                id="filterIncident"
                checked={filterIncident}
                onChange={(e) => setFilterIncident(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="filterIncident" className="text-xs cursor-pointer">
                Incidents only
              </Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterDrone('all')
                setFilterPurpose('all')
                setFilterIncident(false)
                setFilterDateFrom('')
                setFilterDateTo('')
              }}
              className="h-8 text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log List */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Plane className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No flights logged</h3>
              <p className="text-muted-foreground mt-1">
                {logs.length === 0
                  ? 'Start logging your flights to build your flight history.'
                  : 'No flights match your current filters.'}
              </p>
            </div>
            {logs.length === 0 && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Flight
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} flights
          </p>
          {filteredLogs.map((log) => {
            const weather = log.weather as { conditions?: string; windSpeed?: number } | null
            return (
              <Card key={log.id} className={log.incidentOccurred ? 'border-red-200 dark:border-red-800' : ''}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/logbook/${log.id}`} className="font-semibold hover:underline text-primary">
                          {new Date(log.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Link>
                        <Badge className={purposeConfig[log.purpose]?.color || 'bg-muted text-foreground'}>
                          {purposeConfig[log.purpose]?.label || log.purpose}
                        </Badge>
                        {log.incidentOccurred && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Incident
                          </Badge>
                        )}
                        {log.isPublic && (
                          <Badge variant="outline" className="text-xs">Public</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {log.location}
                        </span>
                        {log.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {log.duration} min
                          </span>
                        )}
                        {log.drone && (
                          <span className="flex items-center gap-1">
                            <Plane className="h-3.5 w-3.5" />
                            {log.drone.name}
                          </span>
                        )}
                        {weather?.conditions && (
                          <span>
                            Weather: {weather.conditions}
                            {weather.windSpeed ? ` | ${weather.windSpeed} km/h` : ''}
                          </span>
                        )}
                      </div>
                      {log.incidentOccurred && log.incidentDescription && (
                        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          {log.incidentDescription}
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-sm text-muted-foreground">{log.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm text-right shrink-0">
                      {log.maxAltitude && (
                        <span className="text-muted-foreground">
                          Alt: {log.maxAltitude}m
                        </span>
                      )}
                      {log.distanceTraveled && (
                        <span className="text-muted-foreground">
                          Dist: {log.distanceTraveled}km
                        </span>
                      )}
                      {log.startTime && log.endTime && (
                        <span className="text-muted-foreground text-xs">
                          {log.startTime} – {log.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
