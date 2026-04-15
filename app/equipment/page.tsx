'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Plane,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Battery,
  Calendar,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Drone {
  id: string
  name: string
  brand: string
  model: string
  serialNumber: string | null
  caaRegistrationNumber: string | null
  purchaseDate: string | null
  weight: number | null
  maxFlightTime: number | null
  maxRange: number | null
  status: 'active' | 'maintenance' | 'retired'
  notes: string | null
  createdAt: string
  flightLogs: { id: string; date: string; duration: number | null }[]
  maintenanceLogs: { id: string; date: string; type: string; nextDueDate: string | null }[]
  batteries: { id: string; health: number | null }[]
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  retired: { label: 'Retired', color: 'bg-muted text-foreground dark:bg-gray-800 dark:text-muted-foreground/70' },
}

export default function EquipmentPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [drones, setDrones] = useState<Drone[]>([])
  const [fetching, setFetching] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    caaRegistrationNumber: '',
    weight: '',
    maxFlightTime: '',
    maxRange: '',
    purchaseDate: '',
    notes: '',
  })

  const fetchDrones = async () => {
    try {
      const res = await fetch('/api/drones')
      if (res.ok) {
        const data = await res.json()
        setDrones(data.drones)
      }
    } catch {
      // ignore
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchDrones()
    else if (!loading) setFetching(false)
  }, [isAuthenticated, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/drones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Drone added to your fleet!')
        setDrones((prev) => [data.drone, ...prev])
        setDialogOpen(false)
        setForm({
          name: '',
          brand: '',
          model: '',
          serialNumber: '',
          caaRegistrationNumber: '',
          weight: '',
          maxFlightTime: '',
          maxRange: '',
          purchaseDate: '',
          notes: '',
        })
      } else {
        toast.error(data.error || 'Failed to add drone')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalFlightMinutes = drones.reduce((acc, d) => {
    return acc + d.flightLogs.reduce((s, l) => s + (l.duration || 0), 0)
  }, 0)
  const totalFlightHours = Math.round(totalFlightMinutes / 60)
  const activeDrones = drones.filter((d) => d.status === 'active').length
  const maintenanceDue = drones.filter((d) => {
    const last = d.maintenanceLogs[0]
    if (!last?.nextDueDate) return false
    return new Date(last.nextDueDate) <= new Date()
  }).length

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fleet...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Plane className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Sign in to manage your fleet</h2>
        <p className="text-muted-foreground">Track your drones, maintenance, and batteries.</p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Drone Fleet</h1>
          <p className="text-muted-foreground mt-1">
            Manage your drones, track maintenance, and monitor batteries.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Drone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Drone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Drone Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Primary Survey Drone"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">
                    Brand <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="brand"
                    placeholder="e.g., DJI, Parrot"
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">
                    Model <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="model"
                    placeholder="e.g., Mavic 3 Pro"
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    placeholder="Manufacturer serial number"
                    value={form.serialNumber}
                    onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caaRegistrationNumber">CAA Registration Number</Label>
                  <Input
                    id="caaRegistrationNumber"
                    placeholder="Rwanda CAA reg. number"
                    value={form.caaRegistrationNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, caaRegistrationNumber: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 900"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFlightTime">Max Flight Time (minutes)</Label>
                  <Input
                    id="maxFlightTime"
                    type="number"
                    placeholder="e.g., 46"
                    value={form.maxFlightTime}
                    onChange={(e) => setForm((f) => ({ ...f, maxFlightTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRange">Max Range (km)</Label>
                  <Input
                    id="maxRange"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 15"
                    value={form.maxRange}
                    onChange={(e) => setForm((f) => ({ ...f, maxRange: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details about this drone..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Drone'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drones.length}</p>
              <p className="text-xs text-muted-foreground">Total Drones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFlightHours}</p>
              <p className="text-xs text-muted-foreground">Total Flight Hours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeDrones}</p>
              <p className="text-xs text-muted-foreground">Active Drones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{maintenanceDue}</p>
              <p className="text-xs text-muted-foreground">Maintenance Due</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drone List */}
      {drones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Plane className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No drones yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first drone to start tracking your fleet.
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Drone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drones.map((drone) => {
            const noCaa = !drone.caaRegistrationNumber && drone.weight && drone.weight >= 250
            const lastFlight = drone.flightLogs[0]
            const lastMaintenance = drone.maintenanceLogs[0]
            const maintenanceOverdue =
              lastMaintenance?.nextDueDate &&
              new Date(lastMaintenance.nextDueDate) <= new Date()

            return (
              <Card
                key={drone.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusConfig[drone.status].color}>
                          {statusConfig[drone.status].label}
                        </Badge>
                        {maintenanceOverdue && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Maintenance Overdue
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">{drone.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {drone.brand} {drone.model}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        {drone.caaRegistrationNumber && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            <span className="truncate">CAA: {drone.caaRegistrationNumber}</span>
                          </div>
                        )}
                        {lastFlight && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              Last flight:{' '}
                              {new Date(lastFlight.date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {drone.batteries.length > 0 && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Battery className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{drone.batteries.length} batter{drone.batteries.length === 1 ? 'y' : 'ies'}</span>
                          </div>
                        )}
                      </div>

                      {noCaa && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">
                            This drone weighs {drone.weight}g and requires CAA registration.{' '}
                            <a
                              href="https://caa.gov.rw/unmanned-aircraft"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-medium"
                            >
                              Register with Rwanda CAA
                            </a>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/equipment/${drone.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
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
