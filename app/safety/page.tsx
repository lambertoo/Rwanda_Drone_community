"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { AlertTriangle, CheckCircle, Shield, BookOpen, Phone, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SafetyReport {
  id: string
  type: string
  date: string
  location: string
  description: string
  injuries: boolean
  propertyDamage: boolean
  status: string
  isAnonymous: boolean
  createdAt: string
}

const typeLabels: Record<string, string> = {
  near_miss: "Near Miss",
  accident: "Accident",
  violation: "Regulation Violation",
  bird_strike: "Bird Strike",
  signal_loss: "Signal/GPS Loss",
  other: "Other",
}

const statusColors: Record<string, string> = {
  received: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

const preflightChecklist = [
  "Check weather forecast — wind <20 knots, visibility >500m, no precipitation",
  "Confirm airspace is clear — check NOTAMs and no-fly zones",
  "Inspect drone: propellers, motors, landing gear, body for cracks",
  "Check battery charge (>80% recommended for full mission)",
  "Verify remote controller battery and connection",
  "Test GPS lock — wait for 10+ satellites",
  "Check memory card is inserted and has sufficient space",
  "Set return-to-home altitude above local obstacles",
  "Brief any observers on safety distances",
  "Log your flight in the platform logbook",
]

export default function SafetyPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<SafetyReport[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: "", date: "", location: "", description: "",
    injuries: false, propertyDamage: false,
    reportedToCAA: false, caaReferenceNumber: "",
    isAnonymous: false, isPublic: true,
  })

  useEffect(() => {
    fetch("/api/safety-reports?public=true", { credentials: "include" })
      .then(r => r.json())
      .then(d => setReports(d.reports || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.type || !form.date || !form.location || !form.description) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/safety-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Report submitted. Thank you for helping keep Rwanda's skies safe.")
      setForm({ type: "", date: "", location: "", description: "", injuries: false, propertyDamage: false, reportedToCAA: false, caaReferenceNumber: "", isAnonymous: false, isPublic: true })
    } catch {
      toast.error("Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  const typeCounts = reports.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Drone Safety Center</h1>
        <p className="text-muted-foreground mt-1">Report incidents, access safety resources, and help build Rwanda's drone safety culture</p>
      </div>

      <Tabs defaultValue="report">
        <TabsList className="mb-6">
          <TabsTrigger value="report">Report Incident</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="checklist">Pre-Flight Checklist</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Safety Report</CardTitle>
                  <CardDescription>Reports help improve safety across the drone community. Anonymous reports are accepted.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Incident Type <span className="text-red-500">*</span></Label>
                      <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date <span className="text-red-500">*</span></Label>
                        <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} max={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div>
                        <Label>Location <span className="text-red-500">*</span></Label>
                        <Input placeholder="e.g. Kigali, Gasabo District" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Description <span className="text-red-500">*</span></Label>
                      <Textarea placeholder="Describe what happened in detail. Include weather conditions, drone type, altitude, and sequence of events." rows={5} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox id="injuries" checked={form.injuries} onCheckedChange={v => setForm(p => ({ ...p, injuries: !!v }))} />
                        <Label htmlFor="injuries">Injuries occurred</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="damage" checked={form.propertyDamage} onCheckedChange={v => setForm(p => ({ ...p, propertyDamage: !!v }))} />
                        <Label htmlFor="damage">Property damage occurred</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="caa" checked={form.reportedToCAA} onCheckedChange={v => setForm(p => ({ ...p, reportedToCAA: !!v }))} />
                        <Label htmlFor="caa">Already reported to Rwanda CAA</Label>
                      </div>
                      {form.reportedToCAA && (
                        <Input placeholder="CAA Reference Number (optional)" value={form.caaReferenceNumber} onChange={e => setForm(p => ({ ...p, caaReferenceNumber: e.target.value }))} />
                      )}
                      <div className="flex items-center gap-2">
                        <Checkbox id="anon" checked={form.isAnonymous} onCheckedChange={v => setForm(p => ({ ...p, isAnonymous: !!v }))} />
                        <Label htmlFor="anon">Submit anonymously</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="public" checked={form.isPublic} onCheckedChange={v => setForm(p => ({ ...p, isPublic: !!v }))} />
                        <Label htmlFor="public">Make report publicly visible (helps community awareness)</Label>
                      </div>
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full gap-2">
                      <Send className="h-4 w-4" />{submitting ? "Submitting..." : "Submit Report"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Why Report?</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>✅ Helps identify safety patterns</p>
                  <p>✅ Informs regulatory improvements</p>
                  <p>✅ Protects other pilots</p>
                  <p>✅ Anonymous submissions accepted</p>
                  <p>✅ Shared with Rwanda CAA (if public)</p>
                </CardContent>
              </Card>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Serious incidents</strong> (injuries, property damage, airspace violations) must also be reported directly to Rwanda CAA within 24 hours.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Reports by Type</CardTitle></CardHeader>
              <CardContent>
                {Object.keys(typeLabels).length === 0 || Object.keys(typeCounts).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No public reports yet. Be the first to contribute to community safety.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(typeLabels).map(([type, label]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(((typeCounts[type] || 0) / Math.max(...Object.values(typeCounts))) * 100, 100)}%` }} />
                          </div>
                          <span className="text-sm font-mono w-4 text-right">{typeCounts[type] || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent Public Reports</CardTitle></CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No public reports available.</p>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 5).map(r => (
                      <div key={r.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{typeLabels[r.type] || r.type}</Badge>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[r.status] || ""}`}>{r.status}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{r.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.location} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Flight Safety Checklist</CardTitle>
              <CardDescription>Complete this checklist before every flight</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preflightChecklist.map((item, i) => (
                  <PreflightItem key={i} item={item} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">Save this checklist to your device for offline use. A completed checklist protects you legally in case of incident.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Rwanda CAA Drone Regulations", desc: "Official regulations for RPAS operations in Rwanda. Required reading for all pilots.", icon: BookOpen },
              { title: "Emergency Procedures", desc: "What to do when your drone loses signal, battery fails, or a collision occurs.", icon: AlertTriangle },
              { title: "Weather Assessment Guide", desc: "How to assess weather conditions for safe flight. Wind limits, visibility, and storm avoidance.", icon: CheckCircle },
              { title: "Incident Reporting Guide", desc: "Step-by-step guide to reporting incidents to Rwanda CAA and documenting properly.", icon: Shield },
            ].map((r, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex gap-3">
                  <r.icon className="h-8 w-8 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{r.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                    <Button size="sm" variant="link" className="p-0 h-auto mt-2">View Resource →</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Alert className="mt-4">
            <Phone className="h-4 w-4" />
            <AlertDescription><strong>Emergency:</strong> 112 · <strong>Rwanda CAA:</strong> +250 788 177 000 · <strong>Rwanda National Police:</strong> 113</AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PreflightItem({ item }: { item: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${checked ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : "bg-card"}`}>
      <Checkbox checked={checked} onCheckedChange={v => setChecked(!!v)} className="mt-0.5" />
      <p className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{item}</p>
    </div>
  )
}
