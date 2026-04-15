"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Battery, BatteryWarning, AlertTriangle, Zap, Plus, Pencil, Trash2, Loader2 } from "lucide-react"

interface BatteryRow {
  id: string
  serialNumber: string | null
  capacity: number | null
  cycleCount: number
  purchaseDate: string | null
  lastChargeDate: string | null
  health: number | null
  notes: string | null
  drone: { id: string; name: string; brand: string; model: string }
}

interface DroneOption {
  id: string
  name: string
  brand: string
  model: string
  status: string
}

function healthBadge(h: number | null) {
  if (h === null) return <Badge variant="outline">Unknown</Badge>
  if (h >= 80)
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        Good ({h}%)
      </Badge>
    )
  if (h >= 60)
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        Fair ({h}%)
      </Badge>
    )
  if (h >= 40)
    return (
      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
        Degraded ({h}%)
      </Badge>
    )
  return <Badge variant="destructive">Critical ({h}%)</Badge>
}

function cycleBadge(c: number) {
  if (c >= 300) return <Badge variant="destructive">{c} cycles</Badge>
  if (c >= 200)
    return (
      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
        {c} cycles
      </Badge>
    )
  return (
    <Badge variant="outline">
      <Zap className="w-3 h-3 mr-1" />
      {c} cycles
    </Badge>
  )
}

const EMPTY_FORM = {
  droneId: "",
  serialNumber: "",
  capacity: "",
  cycleCount: "0",
  health: "100",
  purchaseDate: "",
  lastChargeDate: "",
  notes: "",
}

type EditFormState = {
  serialNumber: string
  capacity: string
  cycleCount: string
  health: string
  purchaseDate: string
  lastChargeDate: string
  notes: string
}

const EMPTY_EDIT_FORM: EditFormState = {
  serialNumber: "",
  capacity: "",
  cycleCount: "0",
  health: "100",
  purchaseDate: "",
  lastChargeDate: "",
  notes: "",
}

function toDateInput(v: string | null): string {
  if (!v) return ""
  return v.substring(0, 10)
}

export default function BatteryFleet() {
  const [batteries, setBatteries] = useState<BatteryRow[]>([])
  const [drones, setDrones] = useState<DroneOption[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  // Edit / detail dialog state
  const [editing, setEditing] = useState<BatteryRow | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>(EMPTY_EDIT_FORM)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingEdit, setDeletingEdit] = useState(false)
  // Per-row charge action (no dialog needed)
  const [chargingId, setChargingId] = useState<string | null>(null)

  function openEdit(b: BatteryRow) {
    setEditing(b)
    setEditForm({
      serialNumber: b.serialNumber || "",
      capacity: b.capacity?.toString() || "",
      cycleCount: b.cycleCount.toString(),
      health: b.health?.toString() || "",
      purchaseDate: toDateInput(b.purchaseDate),
      lastChargeDate: toDateInput(b.lastChargeDate),
      notes: b.notes || "",
    })
  }

  function closeEdit() {
    setEditing(null)
    setEditForm(EMPTY_EDIT_FORM)
  }

  function refresh() {
    return Promise.all([
      fetch("/api/batteries", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/drones", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([bData, dData]) => {
        setBatteries(bData.batteries || [])
        const list: DroneOption[] = (dData.drones || []).filter(
          (x: DroneOption) => x.status !== "retired",
        )
        setDrones(list)
      })
      .catch(() => {
        setBatteries([])
        setDrones([])
      })
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function saveEdit() {
    if (!editing) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/drones/${editing.drone.id}/batteries/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serialNumber: editForm.serialNumber,
          capacity: editForm.capacity,
          cycleCount: editForm.cycleCount,
          health: editForm.health === "" ? null : editForm.health,
          purchaseDate: editForm.purchaseDate || null,
          lastChargeDate: editForm.lastChargeDate || null,
          notes: editForm.notes,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to save")
      }
      toast.success("Battery updated")
      closeEdit()
      await refresh()
    } catch (e: any) {
      toast.error(e?.message || "Failed to save")
    } finally {
      setSavingEdit(false)
    }
  }

  async function recordCharge(b: BatteryRow) {
    setChargingId(b.id)
    try {
      const res = await fetch(`/api/drones/${b.drone.id}/batteries/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "charge" }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      toast.success(`Charge logged — cycle ${data.battery.cycleCount}`)
      setBatteries((prev) =>
        prev.map((row) =>
          row.id === b.id
            ? { ...row, cycleCount: data.battery.cycleCount, lastChargeDate: data.battery.lastChargeDate, health: data.battery.health }
            : row,
        ),
      )
      // If the dialog is open for this same battery, sync its form too
      if (editing?.id === b.id) {
        setEditForm((prev) => ({
          ...prev,
          cycleCount: data.battery.cycleCount.toString(),
          lastChargeDate: toDateInput(data.battery.lastChargeDate),
          health: data.battery.health?.toString() || prev.health,
        }))
      }
    } catch {
      toast.error("Failed to record charge")
    } finally {
      setChargingId(null)
    }
  }

  async function deleteBattery() {
    if (!editing) return
    if (!confirm(`Delete battery${editing.serialNumber ? ` "${editing.serialNumber}"` : ""}? This cannot be undone.`)) return
    setDeletingEdit(true)
    try {
      const res = await fetch(`/api/drones/${editing.drone.id}/batteries/${editing.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Battery deleted")
      closeEdit()
      await refresh()
    } catch {
      toast.error("Failed to delete battery")
    } finally {
      setDeletingEdit(false)
    }
  }

  async function addBattery() {
    if (!form.droneId) {
      toast.error("Pick a drone")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/drones/${form.droneId}/batteries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serialNumber: form.serialNumber || null,
          capacity: form.capacity || null,
          cycleCount: form.cycleCount || "0",
          health: form.health || null,
          purchaseDate: form.purchaseDate || null,
          lastChargeDate: form.lastChargeDate || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to add battery")
      }
      toast.success("Battery added")
      setDialogOpen(false)
      setForm(EMPTY_FORM)
      await refresh()
    } catch (e: any) {
      toast.error(e?.message || "Failed to add battery")
    } finally {
      setSubmitting(false)
    }
  }

  const stats = useMemo(() => {
    const known = batteries.filter((b) => b.health !== null)
    const avg = known.length === 0 ? 0 : known.reduce((s, b) => s + (b.health || 0), 0) / known.length
    return {
      total: batteries.length,
      critical: batteries.filter((b) => (b.health ?? 100) < 40).length,
      degraded: batteries.filter((b) => {
        const h = b.health ?? 100
        return h >= 40 && h < 60
      }).length,
      avgHealth: Math.round(avg),
      totalCycles: batteries.reduce((s, b) => s + b.cycleCount, 0),
    }
  }, [batteries])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const addDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={drones.length === 0}>
          <Plus className="w-4 h-4 mr-2" /> Add Battery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Battery</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Drone *</Label>
            <Select
              value={form.droneId}
              onValueChange={(v) => setForm((f) => ({ ...f, droneId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a drone…" />
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Serial number</Label>
              <Input
                value={form.serialNumber}
                onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                placeholder="optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Capacity (mAh)</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="e.g. 5000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cycle count</Label>
              <Input
                type="number"
                min={0}
                value={form.cycleCount}
                onChange={(e) => setForm((f) => ({ ...f, cycleCount: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Health (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.health}
                onChange={(e) => setForm((f) => ({ ...f, health: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Purchase date</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last charge date</Label>
              <Input
                type="date"
                value={form.lastChargeDate}
                onChange={(e) => setForm((f) => ({ ...f, lastChargeDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Brand, swelling, retirement plans…"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={addBattery} disabled={submitting}>
              {submitting ? "Saving…" : "Add Battery"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (batteries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center text-center gap-3">
          <Battery className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No batteries tracked yet</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            {drones.length === 0
              ? "Add at least one drone to your fleet, then track its batteries here. Tracking cycles and health helps you retire LiPos before they swell or fail in flight."
              : "Add a battery to one of your drones. Tracking cycles and health helps you retire LiPos before they swell or fail in flight."}
          </p>
          {drones.length === 0 ? (
            <Link href="/equipment">
              <Button>Go to Fleet</Button>
            </Link>
          ) : (
            addDialog
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Battery health</h2>
          <p className="text-sm text-muted-foreground">
            {batteries.length} battery{batteries.length === 1 ? "" : "ies"} across {drones.length}{" "}
            drone{drones.length === 1 ? "" : "s"}
          </p>
        </div>
        {addDialog}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Battery className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Batteries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalCycles}</p>
              <p className="text-xs text-muted-foreground">Total cycles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Battery className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.avgHealth}%</p>
              <p className="text-xs text-muted-foreground">Avg health</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BatteryWarning className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.critical > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>{stats.critical} battery{stats.critical === 1 ? "" : "ies"} below 40% health</AlertTitle>
          <AlertDescription>
            Retire these from active flight rotation. Aging LiPos are the leading cause of in-flight power loss and crashes.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Battery health across your fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="pb-2 pr-3">Drone</th>
                  <th className="pb-2 pr-3">Serial</th>
                  <th className="pb-2 pr-3">Capacity</th>
                  <th className="pb-2 pr-3">Cycles</th>
                  <th className="pb-2 pr-3">Health</th>
                  <th className="pb-2 pr-3">Last charged</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {batteries.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => openEdit(b)}
                  >
                    <td className="py-2 pr-3">
                      <p className="font-medium">{b.drone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.drone.brand} {b.drone.model}
                      </p>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{b.serialNumber || "—"}</td>
                    <td className="py-2 pr-3">{b.capacity ? `${b.capacity} mAh` : "—"}</td>
                    <td className="py-2 pr-3">{cycleBadge(b.cycleCount)}</td>
                    <td className="py-2 pr-3">{healthBadge(b.health)}</td>
                    <td className="py-2 pr-3 text-xs">
                      {b.lastChargeDate ? new Date(b.lastChargeDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={(e) => { e.stopPropagation(); recordCharge(b) }}
                          disabled={chargingId === b.id}
                          title="Record a charge cycle"
                        >
                          {chargingId === b.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1 hidden sm:inline">Charge</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7" onClick={(e) => { e.stopPropagation(); openEdit(b) }} title="Edit details">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Cycle thresholds: ≥200 marked Aging, ≥300 marked End-of-life. Health: ≥80% Good, 60–79% Fair, 40–59% Degraded, &lt;40% Critical. Click any row to edit, charge, or delete.
          </p>
        </CardContent>
      </Card>

      {/* Detail / Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) closeEdit() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Battery className="w-5 h-5" />
              {editing?.serialNumber || "Battery"} <span className="text-sm font-normal text-muted-foreground">on {editing?.drone.name}</span>
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap gap-2">
                {healthBadge(editing.health)}
                {cycleBadge(editing.cycleCount)}
                {editing.health !== null && editing.health < 40 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Retire from active rotation
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Serial number</Label>
                  <Input
                    value={editForm.serialNumber}
                    onChange={(e) => setEditForm((f) => ({ ...f, serialNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Capacity (mAh)</Label>
                  <Input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Cycle count</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.cycleCount}
                    onChange={(e) => setEditForm((f) => ({ ...f, cycleCount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Health (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={editForm.health}
                    onChange={(e) => setEditForm((f) => ({ ...f, health: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Purchase date</Label>
                  <Input
                    type="date"
                    value={editForm.purchaseDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last charge date</Label>
                  <Input
                    type="date"
                    value={editForm.lastChargeDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastChargeDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Swelling, retirement plans, anything notable…"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Use the <strong>Charge</strong> button on the battery row to log a charge cycle without opening this dialog.
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-wrap gap-2 sm:gap-2 mt-2">
            <Button
              variant="destructive"
              onClick={deleteBattery}
              disabled={deletingEdit || savingEdit}
              className="mr-auto"
            >
              {deletingEdit ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
              Delete
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit || deletingEdit}>
              {savingEdit ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
