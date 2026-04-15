"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ArrowLeft, BookOpen, Plane } from "lucide-react"

interface Drone { id: string; name: string; model: string }

const purposes = [
  { value: "hobby", label: "Hobby / Recreation" },
  { value: "photography", label: "Photography / Videography" },
  { value: "survey", label: "Survey / Mapping" },
  { value: "delivery", label: "Delivery" },
  { value: "racing", label: "Racing" },
  { value: "training", label: "Training" },
  { value: "commercial", label: "Commercial" },
  { value: "inspection", label: "Inspection" },
]

const weatherOptions = ["Clear", "Partly Cloudy", "Overcast", "Light Wind", "Strong Wind", "Light Rain", "Fog"]

export default function NewFlightLogPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [drones, setDrones] = useState<Drone[]>([])
  const [dronesLoaded, setDronesLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    droneId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    duration: "",
    location: "",
    maxAltitude: "",
    distance: "",
    purpose: "hobby",
    weather: "Clear",
    notes: "",
    hasIncident: false,
    incidentDescription: "",
  })

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/drones", { credentials: "include" })
      .then(r => r.json())
      .then(d => setDrones(d.drones || []))
      .finally(() => setDronesLoaded(true))
  }, [user])

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const calcDuration = (start: string, end: string) => {
    if (!start || !end) return ""
    const [sh, sm] = start.split(":").map(Number)
    const [eh, em] = end.split(":").map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins <= 0) return ""
    return String(Math.round(mins))
  }

  const handleSubmit = async () => {
    if (!form.droneId) { toast.error("Please select a drone"); return }
    if (!form.date) { toast.error("Please enter the flight date"); return }
    if (!form.location.trim()) { toast.error("Please enter the location"); return }
    if (!form.duration && !form.startTime) { toast.error("Please enter flight duration or start/end times"); return }
    setSaving(true)
    try {
      const duration = form.duration || calcDuration(form.startTime, form.endTime)
      const res = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          droneId: form.droneId,
          date: form.date,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          duration: duration ? Number(duration) : undefined,
          location: form.location,
          maxAltitude: form.maxAltitude ? Number(form.maxAltitude) : undefined,
          distanceTraveled: form.distance ? Number(form.distance) : undefined,
          purpose: form.purpose,
          weather: form.weather,
          notes: form.notes || undefined,
          incidentOccurred: form.hasIncident,
          incidentDescription: form.hasIncident ? form.incidentDescription : undefined,
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }
      toast.success("Flight logged successfully")
      router.push("/logbook")
    } catch (e: any) {
      toast.error(e.message || "Failed to log flight")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/logbook">
          <Button variant="outline" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Log a Flight</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Record details of your flight</p>
        </div>
      </div>

      {dronesLoaded && drones.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <Plane className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Add a drone first</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Flight logs are tied to a drone. Register at least one drone in your fleet, then come back to log a flight.
            </p>
            <Link href="/equipment">
              <Button>Go to Fleet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader><CardTitle className="text-lg">Flight Details</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* Drone */}
          <div>
            <Label>Drone <span className="text-red-500">*</span></Label>
            <Select value={form.droneId} onValueChange={v => set("droneId", v)}>
              <SelectTrigger><SelectValue placeholder="Select your drone" /></SelectTrigger>
              <SelectContent>
                {drones.length === 0
                  ? <SelectItem value="none" disabled>No drones registered — add one first</SelectItem>
                  : drones.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.model})</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={form.startTime} onChange={e => { set("startTime", e.target.value); set("duration", calcDuration(e.target.value, form.endTime)) }} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={form.endTime} onChange={e => { set("endTime", e.target.value); set("duration", calcDuration(form.startTime, e.target.value)) }} />
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration (minutes) <span className="text-red-500">*</span></Label>
              <Input type="number" min="1" placeholder="e.g. 25" value={form.duration} onChange={e => set("duration", e.target.value)} />
            </div>
            <div>
              <Label>Location <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Kigali, Gasabo" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
          </div>

          {/* Purpose + Weather */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Purpose</Label>
              <Select value={form.purpose} onValueChange={v => set("purpose", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{purposes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Weather</Label>
              <Select value={form.weather} onValueChange={v => set("weather", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{weatherOptions.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Max Altitude (m)</Label>
              <Input type="number" min="0" placeholder="e.g. 120" value={form.maxAltitude} onChange={e => set("maxAltitude", e.target.value)} />
            </div>
            <div>
              <Label>Distance Flown (km)</Label>
              <Input type="number" min="0" step="0.1" placeholder="e.g. 3.5" value={form.distance} onChange={e => set("distance", e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea placeholder="Any observations, battery performance, site conditions..." rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>

          {/* Incident */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={form.hasIncident} onCheckedChange={v => set("hasIncident", v)} />
              <Label className="cursor-pointer">Incident occurred during this flight</Label>
            </div>
            {form.hasIncident && (
              <div>
                <Label>Incident Description <span className="text-red-500">*</span></Label>
                <Textarea placeholder="Describe what happened..." rows={3} value={form.incidentDescription} onChange={e => set("incidentDescription", e.target.value)} />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Log Flight"}
            </Button>
            <Link href="/logbook">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
