"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Battery, BatteryWarning, AlertTriangle, ChevronRight, Zap } from "lucide-react"

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

export default function BatteryFleet() {
  const [batteries, setBatteries] = useState<BatteryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/batteries", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBatteries(d.batteries || []))
      .catch(() => setBatteries([]))
      .finally(() => setLoading(false))
  }, [])

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

  if (batteries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center text-center gap-3">
          <Battery className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No batteries tracked yet</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Add batteries to your drones from the fleet page. Tracking cycles and health helps you retire LiPos before they swell or fail in flight.
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
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
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
                      <Link href={`/equipment/${b.drone.id}`}>
                        <Button variant="ghost" size="sm" className="h-7">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Cycle thresholds: ≥200 marked Aging, ≥300 marked End-of-life. Health: ≥80% Good, 60–79% Fair, 40–59% Degraded, &lt;40% Critical. Manage individual batteries from the drone detail page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
