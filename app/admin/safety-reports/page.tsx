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

interface SafetyReport { id: string; type: string; date: string; location: string; description: string; injuries: boolean; propertyDamage: boolean; reportedToCAA: boolean; status: string; isAnonymous: boolean; adminNotes?: string; createdAt: string; reporter?: { fullName: string } }

const typeLabels: Record<string, string> = { near_miss: "Near Miss", accident: "Accident", violation: "Violation", bird_strike: "Bird Strike", signal_loss: "Signal Loss", other: "Other" }
const statusColor: Record<string, string> = { received: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }

export default function AdminSafetyReportsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<SafetyReport[]>([])
  const [selected, setSelected] = useState<SafetyReport | null>(null)
  const [notes, setNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!loading && user?.role !== "admin") router.push("/") }, [user, loading, router])

  useEffect(() => {
    if (user?.role !== "admin") return
    fetch("/api/safety-reports?admin=true", { credentials: "include" })
      .then(r => r.json()).then(d => setReports(d.reports || []))
  }, [user])

  const updateReport = async () => {
    if (!selected) return; setSaving(true)
    try {
      await fetch(`/api/safety-reports/${selected.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: newStatus, adminNotes: notes }) })
      setReports(prev => prev.map(r => r.id === selected.id ? { ...r, status: newStatus, adminNotes: notes } : r))
      toast.success("Updated"); setSelected(null)
    } catch { toast.error("Failed") } finally { setSaving(false) }
  }

  const filtered = reports.filter(r => {
    const ms = !search || r.location.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    const mst = statusFilter === "all" || r.status === statusFilter
    return ms && mst
  })

  const counts = { total: reports.length, received: reports.filter(r => r.status === "received").length, review: reports.filter(r => r.status === "under_review").length, injuries: reports.filter(r => r.injuries).length }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-primary" /> Safety Reports</h1>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[["Total", counts.total, ""], ["Open", counts.received, "text-blue-600"], ["Under Review", counts.review, "text-yellow-600"], ["With Injuries", counts.injuries, "text-red-600"]].map(([l, v, c]) => (
          <Card key={l as string}><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-xs text-muted-foreground">{l}</p></CardContent></Card>
        ))}
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="received">Received</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {filtered.map(r => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="text-xs">{typeLabels[r.type] || r.type}</Badge>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[r.status] || ""}`}>{r.status.replace("_"," ")}</span>
                    {r.injuries && <Badge variant="destructive" className="text-xs">Injuries</Badge>}
                    {r.propertyDamage && <Badge variant="destructive" className="text-xs">Property Damage</Badge>}
                  </div>
                  <p className="font-medium">{r.location}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.date).toLocaleDateString()} · {r.isAnonymous ? "Anonymous" : r.reporter?.fullName || "—"} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => { setSelected(r); setNotes(r.adminNotes || ""); setNewStatus(r.status) }}><Eye className="h-4 w-4" /> Review</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>No reports found</p></div>}
      </div>
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Safety Report</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type</span><p>{typeLabels[selected.type]}</p></div>
                <div><span className="text-muted-foreground">Date</span><p>{new Date(selected.date).toLocaleDateString()}</p></div>
                <div><span className="text-muted-foreground">Location</span><p>{selected.location}</p></div>
                <div><span className="text-muted-foreground">Reporter</span><p>{selected.isAnonymous ? "Anonymous" : selected.reporter?.fullName || "—"}</p></div>
              </div>
              <p className="text-sm bg-muted p-3 rounded-lg">{selected.description}</p>
              <div><Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="received">Received</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Admin Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>
              <Button className="w-full" onClick={updateReport} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
