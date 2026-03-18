"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Loader2, ArrowLeft, Plane, MapPin, Clock, Calendar, AlertTriangle,
  Thermometer, Wind, Eye, CloudRain, Trash2, ExternalLink, Globe,
  Navigation, Gauge, Ruler, Target
} from "lucide-react"

interface FlightLog {
  id: string
  date: string
  startTime?: string
  endTime?: string
  duration?: number
  location: string
  latitude?: number
  longitude?: number
  maxAltitude?: number
  maxDistance?: number
  distanceTraveled?: number
  purpose: string
  notes?: string
  incidentOccurred: boolean
  incidentDescription?: string
  weather?: {
    wind?: number
    temp?: number
    visibility?: string
    precipitation?: string
    conditions?: string
  }
  isPublic: boolean
  createdAt: string
  drone?: {
    id: string
    name: string
    brand: string
    model: string
  }
}

const PURPOSE_LABELS: Record<string, string> = {
  hobby: "Hobby / Recreation",
  photography: "Photography & Videography",
  survey: "Survey & Mapping",
  delivery: "Delivery",
  racing: "Racing / FPV",
  training: "Training",
  commercial: "Commercial Operations",
  inspection: "Inspection",
}

export default function FlightLogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [log, setLog] = useState<FlightLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    fetch(`/api/logbook/${id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setLog(d.log)
      })
      .catch(() => setError("Failed to load flight log"))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const r = await fetch(`/api/logbook/${id}`, { method: "DELETE", credentials: "include" })
      if (r.ok) router.push("/logbook")
      else setError("Failed to delete flight log")
    } catch {
      setError("Failed to delete flight log")
    } finally {
      setDeleting(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !log) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>{error || "Flight log not found"}</AlertDescription>
        </Alert>
        <Link href="/logbook" className="block mt-4">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Logbook</Button>
        </Link>
      </div>
    )
  }

  const weather = log.weather as any

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/logbook">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{log.location}</h1>
            <p className="text-muted-foreground text-sm">
              {new Date(log.date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {log.incidentOccurred && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />Incident
            </Badge>
          )}
          {log.isPublic && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />Public
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {log.duration && (
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{formatDuration(log.duration)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </CardContent>
          </Card>
        )}
        {log.maxAltitude && (
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Gauge className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold">{log.maxAltitude}m</p>
              <p className="text-xs text-muted-foreground">Max Altitude</p>
            </CardContent>
          </Card>
        )}
        {log.distanceTraveled && (
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Ruler className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold">{log.distanceTraveled}km</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </CardContent>
          </Card>
        )}
        {log.maxDistance && (
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p className="text-lg font-bold">{log.maxDistance}km</p>
              <p className="text-xs text-muted-foreground">Max Range</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main details */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Flight info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Flight Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Plane className="h-4 w-4" />Purpose</span>
              <span className="font-medium">{PURPOSE_LABELS[log.purpose] || log.purpose}</span>
            </div>
            {log.startTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-4 w-4" />Start</span>
                <span className="font-medium">{log.startTime}</span>
              </div>
            )}
            {log.endTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" />End</span>
                <span className="font-medium">{log.endTime}</span>
              </div>
            )}
            {log.drone && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Plane className="h-4 w-4" />Drone</span>
                  <Link href={`/equipment/${log.drone.id}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                    {log.drone.name} <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium">{log.drone.brand} {log.drone.model}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span className="font-medium">{log.location}</span>
            </div>
            {log.latitude && log.longitude && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Navigation className="h-4 w-4" />Coordinates</span>
                  <span className="font-mono text-xs">{log.latitude.toFixed(5)}, {log.longitude.toFixed(5)}</span>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${log.latitude}&mlon=${log.longitude}&zoom=14`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full mt-1">
                    <MapPin className="mr-2 h-3.5 w-3.5" />View on Map
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weather */}
      {weather && Object.keys(weather).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Weather Conditions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {weather.wind !== undefined && (
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-muted-foreground text-xs">Wind</p>
                    <p className="font-medium">{weather.wind} km/h</p>
                  </div>
                </div>
              )}
              {weather.temp !== undefined && (
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-muted-foreground text-xs">Temperature</p>
                    <p className="font-medium">{weather.temp}°C</p>
                  </div>
                </div>
              )}
              {weather.visibility && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-muted-foreground text-xs">Visibility</p>
                    <p className="font-medium">{weather.visibility}</p>
                  </div>
                </div>
              )}
              {weather.precipitation && (
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-indigo-400" />
                  <div>
                    <p className="text-muted-foreground text-xs">Precipitation</p>
                    <p className="font-medium">{weather.precipitation}</p>
                  </div>
                </div>
              )}
              {weather.conditions && (
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-muted-foreground text-xs mb-0.5">Conditions</p>
                  <p className="font-medium">{weather.conditions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incident */}
      {log.incidentOccurred && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-1">Incident reported</p>
            {log.incidentDescription && <p>{log.incidentDescription}</p>}
          </AlertDescription>
        </Alert>
      )}

      {/* Notes */}
      {log.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-right">
        Logged {new Date(log.createdAt).toLocaleString()}
      </p>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete flight log?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the flight log for {log.location}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
