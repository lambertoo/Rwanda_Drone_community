"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { AlertTriangle, Search, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SafetyReport { id: string; type: string; date: string; location: string; description: string; injuries: boolean; propertyDamage: boolean; reportedToCAA: boolean; status: string; isAnonymous: boolean; adminNotes?: string; createdAt: string; reporter?: { fullName: string; username: string } }

const typeLabels: Record<string, string> = { near_miss: "Near Miss", accident: "Accident", violation: "Violation", bird_strike: "Bird Strike", signal_loss: "Signal Loss", other: "Other" }

export default function RegulatorIncidentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<SafetyReport[]>([])
  const [selected, setSelected] = useState<SafetyReport | null>(null)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && user && user.role !== "regulator" && user.role !== "admin") router.push("/")
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/safety-reports?admin=true", { credentials: "include" })
      .then(r => r.json()).then(d => setReports(d.reports || []))
  }, [user])

  const updateReport = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/safety-reports/${selected.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status, adminNotes: notes }) })
      if (!res.ok) throw new Error()
      setReports(prev => prev.map(r => r.id === selected.id ? { ...r, status, adminNotes: notes } : r))
      toast.success("Report updated")
      setSelected(null)
    } catch { toast.error("Failed") } finally { setSaving(false) }
  }

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.location.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || r.type === typeFilter
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const statusColor: Record<string, string> = { received: "bg-blue-100 text-blue-800", under_review: "bg-yellow-100 text-yellow-800", closed: "bg-green-100 text-green-800" }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-primary" /> Incident Reports</h1>
        <p className="text-muted-foreground mt-1">{reports.length} total reports · {reports.filter(r => r.status === "received").length} open</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem>{Object.entries(typeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="received">Received</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <Card key={r.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{typeLabels[r.type] || r.type}</Badge>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[r.status] || "bg-muted text-muted-foreground"}`}>{r.status.replace("_", " ")}</span>
                    {r.injuries && <Badge variant="destructive" className="text-xs">Injuries</Badge>}
                    {r.propertyDamage && <Badge variant="destructive" className="text-xs">Property Damage</Badge>}
                    {r.reportedToCAA && <Badge className="bg-blue-100 text-blue-800 text-xs">Reported to CAA</Badge>}
                  </div>
                  <p className="font-medium">{r.location}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.date).toLocaleDateString()} · Submitted {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })} · {r.isAnonymous ? "Anonymous" : r.reporter?.fullName || "Unknown"}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => { setSelected(r); setNotes(r.adminNotes || ""); setStatus(r.status) }}>
                  <Eye className="h-4 w-4" /> Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No reports found</p></div>}
      </div>

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Incident Report Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type</span><p className="font-medium">{typeLabels[selected.type]}</p></div>
                <div><span className="text-muted-foreground">Date</span><p className="font-medium">{new Date(selected.date).toLocaleDateString()}</p></div>
                <div><span className="text-muted-foreground">Location</span><p className="font-medium">{selected.location}</p></div>
                <div><span className="text-muted-foreground">Reporter</span><p className="font-medium">{selected.isAnonymous ? "Anonymous" : selected.reporter?.fullName || "—"}</p></div>
              </div>
              <div><p className="text-sm text-muted-foreground mb-1">Description</p><p className="text-sm bg-muted p-3 rounded-lg">{selected.description}</p></div>
              <div className="flex gap-4 text-sm">
                <span>Injuries: <strong>{selected.injuries ? "Yes" : "No"}</strong></span>
                <span>Property Damage: <strong>{selected.propertyDamage ? "Yes" : "No"}</strong></span>
                <span>CAA Reported: <strong>{selected.reportedToCAA ? "Yes" : "No"}</strong></span>
              </div>
              <div>
                <Label>Update Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="received">Received</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Admin Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add internal notes..." rows={3} /></div>
              <Button className="w-full" onClick={updateReport} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
