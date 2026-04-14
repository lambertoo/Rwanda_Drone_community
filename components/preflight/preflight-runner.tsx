"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClipboardCheck, CheckCircle2, XCircle, Plane, History, Info } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Drone {
  id: string
  name: string
  brand: string
  model: string
  status: "active" | "maintenance" | "retired"
}

interface ChecklistItem {
  label: string
  checked: boolean
}

interface PastCheck {
  id: string
  createdAt: string
  allPassed: boolean
  notes: string | null
  items: ChecklistItem[]
}

export default function PreflightRunner() {
  const [drones, setDrones] = useState<Drone[]>([])
  const [selectedDroneId, setSelectedDroneId] = useState<string>("")
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [notes, setNotes] = useState("")
  const [history, setHistory] = useState<PastCheck[]>([])
  const [batteryHint, setBatteryHint] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/drones", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list: Drone[] = (d.drones || []).filter((x: Drone) => x.status !== "retired")
        setDrones(list)
        if (list.length > 0) setSelectedDroneId(list[0].id)
      })
      .catch(() => toast.error("Failed to load drones"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedDroneId) return
    fetch(`/api/drones/${selectedDroneId}/preflight`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const itemsFromApi = (data.checklistItems || []).map((label: string) => ({
          label,
          checked: false,
        }))
        setItems(itemsFromApi)
        setHistory(data.checks || [])
        setBatteryHint(data.allBatteriesGood)
        setNotes("")
      })
      .catch(() => toast.error("Failed to load checklist"))
  }, [selectedDroneId])

  const allPassed = items.length > 0 && items.every((i) => i.checked)
  const completedCount = items.filter((i) => i.checked).length

  function toggle(idx: number, checked: boolean) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, checked } : it)))
  }

  function checkAll() {
    setItems((prev) => prev.map((it) => ({ ...it, checked: true })))
  }

  function clearAll() {
    setItems((prev) => prev.map((it) => ({ ...it, checked: false })))
  }

  async function submit() {
    if (!selectedDroneId) return
    if (items.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/drones/${selectedDroneId}/preflight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items, notes: notes || null }),
      })
      if (!res.ok) throw new Error("submit failed")
      const data = await res.json()
      toast.success(allPassed ? "All checks passed — clear for flight" : "Check submitted (some items unchecked)")
      setHistory((prev) => [data.check, ...prev].slice(0, 10))
      clearAll()
      setNotes("")
    } catch {
      toast.error("Failed to submit check")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (drones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center text-center gap-3">
          <Plane className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Add a drone first</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Pre-flight checks are tied to a specific drone. Add at least one drone to your fleet to run a check.
          </p>
          <Link href="/equipment">
            <Button>Go to Fleet</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Pre-flight Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Drone</Label>
              <Select value={selectedDroneId} onValueChange={setSelectedDroneId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drone…" />
                </SelectTrigger>
                <SelectContent>
                  {drones.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} — {d.brand} {d.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={checkAll}>
                Check all
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>

          {batteryHint === false && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertTitle>Battery health hint</AlertTitle>
              <AlertDescription>
                One or more batteries on this drone show health below 80%. Inspect carefully before flight.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {items.map((it, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/40 ${
                  it.checked ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : ""
                }`}
              >
                <Checkbox
                  checked={it.checked}
                  onCheckedChange={(v) => toggle(i, v === true)}
                  className="mt-0.5"
                />
                <span className={`text-sm ${it.checked ? "line-through text-muted-foreground" : ""}`}>
                  {it.label}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preflight-notes">Notes (optional)</Label>
            <Textarea
              id="preflight-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conditions, observers, anything notable for this flight…"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t">
            <div className="text-sm">
              <span className="font-medium">{completedCount}</span>{" "}
              <span className="text-muted-foreground">of {items.length} checked</span>
              {allPassed && (
                <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Ready for flight
                </Badge>
              )}
            </div>
            <Button onClick={submit} disabled={submitting || items.length === 0}>
              {submitting ? "Saving…" : "Submit check"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent checks ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous checks for this drone.</p>
          ) : (
            <div className="space-y-2">
              {history.map((c) => {
                const items = Array.isArray(c.items) ? c.items : []
                const passed = items.filter((x) => x.checked).length
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg border text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {c.allPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-orange-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                        {c.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{c.notes}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={c.allPassed ? "default" : "outline"}>
                      {passed}/{items.length}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
