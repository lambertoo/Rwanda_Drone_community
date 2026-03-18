"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle, Info, MapPin, Phone,
  CheckCircle, XCircle, Plane, Plus, Pencil, Trash2,
  CalendarClock, ShieldAlert,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const AirspaceMap = dynamic(() => import("@/components/airspace/airspace-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[480px] w-full rounded-lg" />,
})

// ── static reference data ──────────────────────────────────────
const noFlyZones = [
  { name: "Kigali Intl Airport (HRYR)", type: "Airport", restriction: "5km full ban / 10km advisory", province: "Kigali", severity: "red" },
  { name: "Kamembe Airport (HRZA)", type: "Airport", restriction: "3km full ban / 5km advisory", province: "Western (Rusizi)", severity: "red" },
  { name: "Huye Airport", type: "Airport", restriction: "3km full ban", province: "Southern", severity: "red" },
  { name: "Presidential Palace", type: "VIP/Government", restriction: "Full restriction – no exceptions", province: "Kigali", severity: "red" },
  { name: "Rwanda Defence Force Installations", type: "Military", restriction: "Strictly prohibited", province: "All", severity: "red" },
  { name: "Volcanoes National Park", type: "Protected Area", restriction: "No-fly – wildlife protection", province: "Northern", severity: "orange" },
  { name: "Nyungwe Forest National Park", type: "Protected Area", restriction: "No-fly – wildlife protection", province: "Western/Southern", severity: "orange" },
  { name: "Akagera National Park", type: "Protected Area", restriction: "No-fly without RDB permit", province: "Eastern", severity: "orange" },
  { name: "Gishari Forest Reserve", type: "Protected Area", restriction: "Restricted – permit required", province: "Eastern", severity: "orange" },
  { name: "Kigali City Centre (CBD)", type: "Urban/Security", restriction: "Category A only below 120m AMSL", province: "Kigali", severity: "yellow" },
  { name: "Parliament / Gov't Complex", type: "Government", restriction: "Prior authorization required", province: "Kigali", severity: "yellow" },
]

const permittedZones = [
  { name: "Musanze Drone Corridor", description: "Rwanda's official drone testing and innovation corridor. Category B & C operations permitted with prior notification.", province: "Northern (Musanze)", contact: "Rwanda CAA" },
  { name: "Rural Open Areas", description: "Uncontrolled airspace below 400ft AGL, away from restricted zones. Category A operations generally permitted.", province: "Nationwide", contact: "No prior auth needed (Category A)" },
  { name: "Designated Photography Areas", description: "Open areas away from airports, military, and national parks. Visual line-of-sight only.", province: "Nationwide", contact: "Check local bylaws" },
]

const rules = [
  { rule: "Maximum altitude 400ft (120m) AGL for Category A operations", ok: true },
  { rule: "Stay within visual line-of-sight (VLOS) unless BVLOS permit obtained", ok: true },
  { rule: "Register all drones weighing 250g or more with Rwanda CAA", ok: true },
  { rule: "Obtain pilot certification for commercial operations", ok: true },
  { rule: "Do not fly over crowds, emergency operations, or moving vehicles", ok: true },
  { rule: "No night operations without a special permit", ok: true },
  { rule: "Mandatory third-party insurance for commercial flights", ok: true },
  { rule: "Do not interfere with manned aircraft or emergency services", ok: false },
  { rule: "Never fly in restricted zones without written authorization", ok: false },
  { rule: "Do not fly under the influence of alcohol or drugs", ok: false },
]

// ── types ──────────────────────────────────────────────────────
interface AirspaceZone {
  id: string
  name: string
  description: string
  type: string
  lat: number
  lon: number
  radius: number
  severity: string
  province?: string | null
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
  createdAt: string
  createdBy: { fullName: string; username: string }
}

const ZONE_TYPES = ["restricted", "advisory", "protected", "permitted", "temporary", "military"]
const SEVERITIES = [
  { value: "red", label: "Red — Full ban" },
  { value: "orange", label: "Orange — Advisory / Protected" },
  { value: "yellow", label: "Yellow — Conditional / Permit" },
  { value: "green", label: "Green — Permitted zone" },
]
const PROVINCES = ["Kigali", "Northern", "Southern", "Eastern", "Western", "All Rwanda"]

const SEVERITY_COLORS: Record<string, string> = {
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

const EMPTY_FORM = {
  name: "", description: "", type: "restricted", lat: "", lon: "",
  radius: "", severity: "red", province: "", startDate: "", endDate: "",
}

// ── component ─────────────────────────────────────────────────
export default function AirspacePage() {
  const { user } = useAuth()
  const isAuthority = user?.role === 'admin' || user?.role === 'regulator'

  const [selectedProvince, setSelectedProvince] = useState("All")
  const [zones, setZones] = useState<AirspaceZone[]>([])
  const [zonesLoading, setZonesLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const provinces = ["All", "Kigali", "Northern", "Southern", "Eastern", "Western"]
  const filtered = selectedProvince === "All" ? noFlyZones : noFlyZones.filter(z => z.province.includes(selectedProvince))

  // Fetch custom zones (for management tab)
  const fetchZones = () => {
    setZonesLoading(true)
    fetch('/api/airspace/zones')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setZones(data) })
      .catch(() => toast.error('Failed to load zones'))
      .finally(() => setZonesLoading(false))
  }

  useEffect(() => {
    if (isAuthority) fetchZones()
  }, [isAuthority])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `/api/airspace/zones/${editingId}` : '/api/airspace/zones'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          lat: parseFloat(form.lat),
          lon: parseFloat(form.lon),
          radius: parseFloat(form.radius),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          province: form.province || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      toast.success(editingId ? 'Zone updated' : 'Zone created and now visible on map')
      setForm(EMPTY_FORM)
      setEditingId(null)
      fetchZones()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (zone: AirspaceZone) => {
    setEditingId(zone.id)
    setForm({
      name: zone.name,
      description: zone.description,
      type: zone.type,
      lat: String(zone.lat),
      lon: String(zone.lon),
      radius: String(zone.radius),
      severity: zone.severity,
      province: zone.province || "",
      startDate: zone.startDate ? zone.startDate.substring(0, 10) : "",
      endDate: zone.endDate ? zone.endDate.substring(0, 10) : "",
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this zone? It will be removed from the map immediately.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/airspace/zones/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Zone deleted')
      setZones(z => z.filter(z => z.id !== id))
    } catch {
      toast.error('Failed to delete zone')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (zone: AirspaceZone) => {
    try {
      const res = await fetch(`/api/airspace/zones/${zone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !zone.isActive }),
      })
      if (!res.ok) throw new Error('Failed')
      setZones(prev => prev.map(z => z.id === zone.id ? { ...z, isActive: !z.isActive } : z))
      toast.success(zone.isActive ? 'Zone deactivated' : 'Zone activated')
    } catch {
      toast.error('Failed to update zone')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" /> Rwanda Airspace Reference
        </h1>
        <p className="text-muted-foreground mt-1">Know before you fly — Rwanda no-fly zones and airspace rules</p>
      </div>

      <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          <strong>Always verify current restrictions with Rwanda CAA before flying.</strong> Airspace designations change. NOTAMs may impose temporary restrictions not shown here.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="map">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="zones">No-Fly Zones</TabsTrigger>
          <TabsTrigger value="permitted">Permitted Zones</TabsTrigger>
          <TabsTrigger value="rules">Key Rules</TabsTrigger>
          <TabsTrigger value="contacts">CAA Contacts</TabsTrigger>
          {isAuthority && (
            <TabsTrigger value="manage" className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Manage Zones
            </TabsTrigger>
          )}
        </TabsList>

        {/* Map tab */}
        <TabsContent value="map" className="mt-0">
          <AirspaceMap />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click on any zone for details. Blue dashed zones are authority-defined restrictions. Zones are approximate.
          </p>
        </TabsContent>

        {/* No-fly zones */}
        <TabsContent value="zones">
          <div className="flex gap-2 flex-wrap mb-4">
            {provinces.map(p => (
              <Button key={p} size="sm" variant={selectedProvince === p ? "default" : "outline"} onClick={() => setSelectedProvince(p)}>{p}</Button>
            ))}
          </div>
          <div className="mb-3 flex gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Full restriction</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Protected area</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Advisory / conditional</span>
          </div>
          <div className="space-y-3">
            {filtered.map((z, i) => (
              <Card key={i} className={`border-l-4 ${z.severity === "red" ? "border-l-red-500" : z.severity === "orange" ? "border-l-orange-500" : "border-l-yellow-500"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{z.name}</p>
                        <Badge variant="outline" className="text-xs">{z.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{z.restriction}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{z.province}</p>
                    </div>
                    <XCircle className={`h-5 w-5 shrink-0 mt-0.5 ${z.severity === "red" ? "text-red-500" : "text-orange-500"}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permitted zones */}
        <TabsContent value="permitted">
          <div className="space-y-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Musanze Drone Corridor
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Official Test Zone</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Rwanda's dedicated drone testing corridor in Musanze district. Category B & C operations are permitted with prior CAA notification.</p>
                <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> Northern Province (Musanze)</p>
              </CardContent>
            </Card>
            {permittedZones.slice(1).map((z, i) => (
              <Card key={i} className="border-l-4 border-l-blue-400">
                <CardContent className="p-4">
                  <p className="font-semibold mb-1">{z.name}</p>
                  <p className="text-sm text-muted-foreground">{z.description}</p>
                  <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{z.province}</p>
                </CardContent>
              </Card>
            ))}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                For now, always check <strong>Rwanda CAA NOTAM system</strong> before any flight.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        {/* Rules */}
        <TabsContent value="rules">
          <div className="space-y-2">
            {rules.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                {r.ok ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                <p className="text-sm">{r.rule}</p>
              </div>
            ))}
          </div>
          <Card className="mt-6">
            <CardHeader><CardTitle className="text-base">Categories of Operations</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <p className="font-semibold text-green-800 dark:text-green-300">Category A — Open (Low Risk)</p>
                <p className="text-muted-foreground mt-1">Hobby/recreational, below 400ft AGL, within VLOS, away from restricted areas. Registration required for drones ≥250g.</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <p className="font-semibold text-yellow-800 dark:text-yellow-300">Category B — Specific (Medium Risk)</p>
                <p className="text-muted-foreground mt-1">Commercial operations, surveys, photography for hire. RPAS pilot certificate required. Prior flight authorization from Rwanda CAA needed.</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <p className="font-semibold text-red-800 dark:text-red-300">Category C — Certified (High Risk)</p>
                <p className="text-muted-foreground mt-1">BVLOS operations, flights over people, critical infrastructure. Full certification, special authorization, and insurance mandatory.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts */}
        <TabsContent value="contacts">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" />Rwanda CAA</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Civil Aviation Authority of Rwanda — drone registration, licensing, permits</p>
                <p><strong>Website:</strong> caa.gov.rw</p>
                <p><strong>Email:</strong> info@caa.gov.rw</p>
                <p><strong>Phone:</strong> +250 788 177 000</p>
                <p><strong>Location:</strong> Kigali International Airport</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Emergency Contacts</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Emergency Services:</strong> 112</p>
                <p><strong>Rwanda National Police:</strong> 113</p>
                <p><strong>RwandAir Operations:</strong> +250 788 177 000</p>
                <p className="text-muted-foreground mt-2">If you witness a drone flying unsafely or in a restricted zone, report to Rwanda CAA immediately.</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link href="/logbook/new"><Button size="sm">Log a Flight</Button></Link>
                <Link href="/compliance"><Button size="sm" variant="outline">Check My Compliance</Button></Link>
                <Link href="/safety/report"><Button size="sm" variant="outline">Report Incident</Button></Link>
                <Link href="/equipment"><Button size="sm" variant="outline">My Drone Fleet</Button></Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Manage Zones (admin / regulator only) ── */}
        {isAuthority && (
          <TabsContent value="manage" className="space-y-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingId ? <><Pencil className="h-4 w-4" /> Edit Zone</> : <><Plus className="h-4 w-4" /> Add Restricted Zone</>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="z-name">Zone Name *</Label>
                      <Input id="z-name" placeholder="e.g. Kigali Stadium Event TFR" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="z-type">Zone Type *</Label>
                      <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                        <SelectTrigger id="z-type"><SelectValue /></SelectTrigger>
                        <SelectContent>{ZONE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="z-desc">Description / Reason *</Label>
                    <Textarea id="z-desc" placeholder="Describe the restriction, reason, and any conditions for entry" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="z-lat">Latitude *</Label>
                      <Input id="z-lat" type="number" step="0.0001" placeholder="-1.9441" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="z-lon">Longitude *</Label>
                      <Input id="z-lon" type="number" step="0.0001" placeholder="30.0619" value={form.lon} onChange={e => setForm(f => ({ ...f, lon: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="z-radius">Radius (km) *</Label>
                      <Input id="z-radius" type="number" step="0.1" min="0.1" max="200" placeholder="2" value={form.radius} onChange={e => setForm(f => ({ ...f, radius: e.target.value }))} required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="z-severity">Severity / Color *</Label>
                      <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                        <SelectTrigger id="z-severity"><SelectValue /></SelectTrigger>
                        <SelectContent>{SEVERITIES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="z-province">Province (optional)</Label>
                      <Select value={form.province} onValueChange={v => setForm(f => ({ ...f, province: v }))}>
                        <SelectTrigger id="z-province"><SelectValue placeholder="Select province" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">— Not specified —</SelectItem>
                          {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="z-start" className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Start Date (leave blank = immediate)</Label>
                      <Input id="z-start" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="z-end" className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> End Date (leave blank = permanent)</Label>
                      <Input id="z-end" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Tip: Use <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="underline">latlong.net</a> or Google Maps (right-click a point) to get precise coordinates.
                  </p>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving…' : editingId ? 'Update Zone' : 'Add Zone to Map'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Zone list */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Authority-Defined Zones ({zones.length})
              </h3>

              {zonesLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
              ) : zones.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No custom zones added yet. Use the form above to add the first restriction.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {zones.map(zone => (
                    <Card key={zone.id} className={`border-l-4 ${!zone.isActive ? 'opacity-50 border-l-muted' : zone.severity === 'red' ? 'border-l-red-500' : zone.severity === 'orange' ? 'border-l-orange-500' : zone.severity === 'yellow' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-semibold truncate">{zone.name}</p>
                              <Badge variant="outline" className="text-xs capitalize">{zone.type}</Badge>
                              <Badge className={`text-xs capitalize ${SEVERITY_COLORS[zone.severity] || ''}`}>{zone.severity}</Badge>
                              {!zone.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                              {zone.endDate && <Badge variant="outline" className="text-xs flex items-center gap-1"><CalendarClock className="h-3 w-3" /> Until {new Date(zone.endDate).toLocaleDateString()}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{zone.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {zone.lat.toFixed(4)}, {zone.lon.toFixed(4)} · {zone.radius} km radius
                              {zone.province && ` · ${zone.province}`}
                              {' · Added by '}{zone.createdBy?.fullName}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Toggle active" onClick={() => toggleActive(zone)}>
                              {zone.isActive ? <XCircle className="h-4 w-4 text-muted-foreground" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit zone" onClick={() => startEdit(zone)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete zone" disabled={deletingId === zone.id} onClick={() => handleDelete(zone.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
