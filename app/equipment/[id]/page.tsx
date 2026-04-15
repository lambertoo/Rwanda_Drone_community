'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  ArrowLeft,
  Wrench,
  Battery,
  Plus,
  Trash2,
  Save,
  Plane,
  AlertTriangle,
  Zap,
  Pencil,
  MoreVertical,
  BatteryWarning,
  Activity,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface MaintenanceLog {
  id: string
  type: string
  description: string
  cost: number | null
  date: string
  performedBy: string | null
  nextDueDate: string | null
  createdAt: string
}

interface BatteryItem {
  id: string
  serialNumber: string | null
  capacity: number | null
  cycleCount: number
  purchaseDate: string | null
  lastChargeDate: string | null
  health: number | null
  notes: string | null
}

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
  flightLogs: { id: string; date: string; duration: number | null; location: string }[]
  maintenanceLogs: MaintenanceLog[]
  batteries: BatteryItem[]
}

const statusConfig = {
  active: {
    label: 'Active',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  maintenance: {
    label: 'Maintenance',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  retired: {
    label: 'Retired',
    color: 'bg-muted text-foreground dark:bg-gray-800 dark:text-muted-foreground/70',
  },
}

const maintenanceTypes = [
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'firmware_update', label: 'Firmware Update' },
  { value: 'parts_replacement', label: 'Parts Replacement' },
  { value: 'cleaning', label: 'Cleaning' },
]

export default function DroneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const [drone, setDrone] = useState<Drone | null>(null)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [editForm, setEditForm] = useState<Partial<Drone>>({})

  // Maintenance dialog
  const [maintOpen, setMaintOpen] = useState(false)
  const [maintSubmitting, setMaintSubmitting] = useState(false)
  const [maintForm, setMaintForm] = useState({
    type: 'inspection',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    performedBy: '',
    nextDueDate: '',
  })

  // Battery dialog
  const [battOpen, setBattOpen] = useState(false)
  const [battSubmitting, setBattSubmitting] = useState(false)
  const [battForm, setBattForm] = useState({
    serialNumber: '',
    capacity: '',
    cycleCount: '0',
    purchaseDate: '',
    health: '',
    notes: '',
  })

  const fetchDrone = async () => {
    try {
      const res = await fetch(`/api/drones/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDrone(data.drone)
        setEditForm({
          name: data.drone.name,
          brand: data.drone.brand,
          model: data.drone.model,
          serialNumber: data.drone.serialNumber || '',
          caaRegistrationNumber: data.drone.caaRegistrationNumber || '',
          weight: data.drone.weight,
          maxFlightTime: data.drone.maxFlightTime,
          maxRange: data.drone.maxRange,
          notes: data.drone.notes || '',
          status: data.drone.status,
          purchaseDate: data.drone.purchaseDate
            ? data.drone.purchaseDate.split('T')[0]
            : '',
        })
      } else {
        toast.error('Drone not found')
        router.push('/equipment')
      }
    } catch {
      toast.error('Failed to load drone')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchDrone()
    else if (!loading) setFetching(false)
  }, [isAuthenticated, loading, id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/drones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        setDrone(data.drone)
        toast.success('Drone updated successfully')
      } else {
        toast.error(data.error || 'Failed to update drone')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/drones/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Drone deleted')
        router.push('/equipment')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete drone')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(false)
    }
  }

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    setMaintSubmitting(true)
    try {
      const res = await fetch(`/api/drones/${id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Maintenance log added')
        setDrone((prev) =>
          prev
            ? { ...prev, maintenanceLogs: [data.log, ...prev.maintenanceLogs] }
            : prev
        )
        setMaintOpen(false)
        setMaintForm({
          type: 'inspection',
          description: '',
          cost: '',
          date: new Date().toISOString().split('T')[0],
          performedBy: '',
          nextDueDate: '',
        })
      } else {
        toast.error(data.error || 'Failed to add maintenance log')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setMaintSubmitting(false)
    }
  }

  const handleAddBattery = async (e: React.FormEvent) => {
    e.preventDefault()
    setBattSubmitting(true)
    try {
      const res = await fetch(`/api/drones/${id}/batteries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(battForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Battery added')
        setDrone((prev) =>
          prev ? { ...prev, batteries: [data.battery, ...prev.batteries] } : prev
        )
        setBattOpen(false)
        setBattForm({
          serialNumber: '',
          capacity: '',
          cycleCount: '0',
          purchaseDate: '',
          health: '',
          notes: '',
        })
      } else {
        toast.error(data.error || 'Failed to add battery')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setBattSubmitting(false)
    }
  }

  const [editBattId, setEditBattId] = useState<string | null>(null)
  const [editBattForm, setEditBattForm] = useState({ serialNumber: '', capacity: '', health: '', notes: '' })

  const handleChargeBattery = async (batteryId: string) => {
    try {
      const res = await fetch(`/api/drones/${id}/batteries/${batteryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'charge' }),
      })
      if (res.ok) {
        toast.success('Battery charged — cycle count updated')
        fetchDrone()
      } else {
        toast.error('Failed to record charge')
      }
    } catch { toast.error('Failed to record charge') }
  }

  const handleEditBattery = async (batteryId: string) => {
    try {
      const res = await fetch(`/api/drones/${id}/batteries/${batteryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serialNumber: editBattForm.serialNumber,
          capacity: editBattForm.capacity,
          health: editBattForm.health,
          notes: editBattForm.notes,
        }),
      })
      if (res.ok) {
        toast.success('Battery updated')
        setEditBattId(null)
        fetchDrone()
      } else {
        toast.error('Failed to update battery')
      }
    } catch { toast.error('Failed to update battery') }
  }

  const handleDeleteBattery = async (batteryId: string) => {
    if (!confirm('Delete this battery? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/drones/${id}/batteries/${batteryId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        toast.success('Battery deleted')
        fetchDrone()
      } else {
        toast.error('Failed to delete battery')
      }
    } catch { toast.error('Failed to delete battery') }
  }

  const [editMaintId, setEditMaintId] = useState<string | null>(null)
  const [editMaintForm, setEditMaintForm] = useState({ type: '', description: '', cost: '', performedBy: '', nextDueDate: '' })

  const handleEditMaintenance = async (logId: string) => {
    try {
      const res = await fetch(`/api/drones/${id}/maintenance/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: editMaintForm.type,
          description: editMaintForm.description,
          cost: editMaintForm.cost,
          performedBy: editMaintForm.performedBy,
          nextDueDate: editMaintForm.nextDueDate || null,
        }),
      })
      if (res.ok) {
        toast.success('Maintenance log updated')
        setEditMaintId(null)
        fetchDrone()
      } else {
        toast.error('Failed to update')
      }
    } catch { toast.error('Failed to update') }
  }

  const handleDeleteMaintenance = async (logId: string) => {
    if (!confirm('Delete this maintenance log?')) return
    try {
      const res = await fetch(`/api/drones/${id}/maintenance/${logId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        toast.success('Maintenance log deleted')
        fetchDrone()
      } else {
        toast.error('Failed to delete')
      }
    } catch { toast.error('Failed to delete') }
  }

  const getHealthColor = (health: number | null) => {
    if (!health) return 'text-muted-foreground'
    if (health >= 80) return 'text-green-600 dark:text-green-400'
    if (health >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Please sign in to view this page.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  if (!drone) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/equipment">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{drone.name}</h1>
              <Badge className={statusConfig[drone.status].color}>
                {statusConfig[drone.status].label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {drone.brand} {drone.model}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!deleteConfirm ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Drone
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive font-medium">Are you sure?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance Log ({drone.maintenanceLogs.length})
          </TabsTrigger>
          <TabsTrigger value="batteries">
            Batteries ({drone.batteries.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Drone Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { label: 'Brand', value: drone.brand },
                  { label: 'Model', value: drone.model },
                  { label: 'Serial Number', value: drone.serialNumber || '—' },
                  { label: 'CAA Registration', value: drone.caaRegistrationNumber || '—' },
                  {
                    label: 'Weight',
                    value: drone.weight ? `${drone.weight}g` : '—',
                  },
                  {
                    label: 'Max Flight Time',
                    value: drone.maxFlightTime ? `${drone.maxFlightTime} min` : '—',
                  },
                  {
                    label: 'Max Range',
                    value: drone.maxRange ? `${drone.maxRange} km` : '—',
                  },
                  {
                    label: 'Purchase Date',
                    value: drone.purchaseDate
                      ? new Date(drone.purchaseDate).toLocaleDateString()
                      : '—',
                  },
                  {
                    label: 'Added',
                    value: new Date(drone.createdAt).toLocaleDateString(),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                {drone.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-1">Notes</p>
                    <p>{drone.notes}</p>
                  </div>
                )}
                {!drone.caaRegistrationNumber &&
                  drone.weight &&
                  drone.weight >= 250 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">
                        This drone requires CAA registration.{' '}
                        <a
                          href="https://caa.gov.rw/unmanned-aircraft"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Register with Rwanda CAA
                        </a>
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit Drone Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Brand</Label>
                    <Input
                      value={editForm.brand || ''}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, brand: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Model</Label>
                    <Input
                      value={editForm.model || ''}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, model: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CAA Reg. No.</Label>
                    <Input
                      value={(editForm.caaRegistrationNumber as string) || ''}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, caaRegistrationNumber: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Weight (g)</Label>
                    <Input
                      type="number"
                      value={editForm.weight || ''}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, weight: parseFloat(e.target.value) || undefined }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={editForm.status || drone.status}
                      onValueChange={(v) =>
                        setEditForm((f) => ({ ...f, status: v as Drone['status'] }))
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    value={(editForm.notes as string) || ''}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <Button size="sm" onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-3.5 w-3.5 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Flight Stats */}
          {drone.flightLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Recent Flights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {drone.flightLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between items-center text-sm py-2 border-b last:border-0"
                    >
                      <span className="text-muted-foreground">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{log.location}</span>
                      <span className="text-muted-foreground">
                        {log.duration ? `${log.duration} min` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Maintenance Log Tab */}
        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Maintenance History</h2>
            <Dialog open={maintOpen} onOpenChange={setMaintOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log Maintenance</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMaintenance} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={maintForm.type}
                      onValueChange={(v) =>
                        setMaintForm((f) => ({ ...f, type: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      value={maintForm.description}
                      onChange={(e) =>
                        setMaintForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Describe what was done..."
                      required
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>
                        Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={maintForm.date}
                        onChange={(e) =>
                          setMaintForm((f) => ({ ...f, date: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cost (RWF)</Label>
                      <Input
                        type="number"
                        value={maintForm.cost}
                        onChange={(e) =>
                          setMaintForm((f) => ({ ...f, cost: e.target.value }))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Performed By</Label>
                      <Input
                        value={maintForm.performedBy}
                        onChange={(e) =>
                          setMaintForm((f) => ({ ...f, performedBy: e.target.value }))
                        }
                        placeholder="Technician name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Next Due Date</Label>
                      <Input
                        type="date"
                        value={maintForm.nextDueDate}
                        onChange={(e) =>
                          setMaintForm((f) => ({ ...f, nextDueDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMaintOpen(false)}
                      disabled={maintSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={maintSubmitting}>
                      {maintSubmitting ? 'Saving...' : 'Save Log'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {drone.maintenanceLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                <Wrench className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No maintenance logs yet.</p>
                <Button size="sm" onClick={() => setMaintOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log First Maintenance
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {drone.maintenanceLogs.map((log) => {
                const overdue =
                  log.nextDueDate && new Date(log.nextDueDate) <= new Date()
                return (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {log.type.replace('_', ' ')}
                            </Badge>
                            {overdue && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Next service overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{log.description}</p>
                          {log.performedBy && (
                            <p className="text-xs text-muted-foreground">
                              By: {log.performedBy}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm space-y-1 shrink-0">
                          <p className="font-medium">
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                          {log.cost !== null && (
                            <p className="text-muted-foreground">
                              RWF {log.cost.toLocaleString()}
                            </p>
                          )}
                          {log.nextDueDate && (
                            <p
                              className={`text-xs ${overdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
                            >
                              Next: {new Date(log.nextDueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2 pt-2 border-t">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditMaintId(log.id); setEditMaintForm({ type: log.type, description: log.description, cost: log.cost?.toString() || '', performedBy: log.performedBy || '', nextDueDate: log.nextDueDate ? new Date(log.nextDueDate).toISOString().split('T')[0] : '' }) }}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => handleDeleteMaintenance(log.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                      {editMaintId === log.id && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={editMaintForm.type} onValueChange={v => setEditMaintForm(f => ({...f, type: v}))}>
                              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {maintenanceTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input placeholder="Cost" type="number" value={editMaintForm.cost} onChange={e => setEditMaintForm(f => ({...f, cost: e.target.value}))} className="h-8 text-sm" />
                          </div>
                          <Input placeholder="Description" value={editMaintForm.description} onChange={e => setEditMaintForm(f => ({...f, description: e.target.value}))} className="h-8 text-sm" />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Performed by" value={editMaintForm.performedBy} onChange={e => setEditMaintForm(f => ({...f, performedBy: e.target.value}))} className="h-8 text-sm" />
                            <Input type="date" value={editMaintForm.nextDueDate} onChange={e => setEditMaintForm(f => ({...f, nextDueDate: e.target.value}))} className="h-8 text-sm" />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setEditMaintId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleEditMaintenance(log.id)}>Save</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Batteries Tab */}
        <TabsContent value="batteries" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Battery Pack</h2>
            <Dialog open={battOpen} onOpenChange={setBattOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Battery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Battery</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBattery} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Serial Number</Label>
                      <Input
                        value={battForm.serialNumber}
                        onChange={(e) =>
                          setBattForm((f) => ({ ...f, serialNumber: e.target.value }))
                        }
                        placeholder="e.g., BAT-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity (mAh)</Label>
                      <Input
                        type="number"
                        value={battForm.capacity}
                        onChange={(e) =>
                          setBattForm((f) => ({ ...f, capacity: e.target.value }))
                        }
                        placeholder="e.g., 5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cycle Count</Label>
                      <Input
                        type="number"
                        value={battForm.cycleCount}
                        onChange={(e) =>
                          setBattForm((f) => ({ ...f, cycleCount: e.target.value }))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Health (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={battForm.health}
                        onChange={(e) =>
                          setBattForm((f) => ({ ...f, health: e.target.value }))
                        }
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Purchase Date</Label>
                      <Input
                        type="date"
                        value={battForm.purchaseDate}
                        onChange={(e) =>
                          setBattForm((f) => ({ ...f, purchaseDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={battForm.notes}
                      onChange={(e) =>
                        setBattForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      rows={2}
                      placeholder="Any notes about this battery..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBattOpen(false)}
                      disabled={battSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={battSubmitting}>
                      {battSubmitting ? 'Adding...' : 'Add Battery'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {drone.batteries.length > 0 && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{drone.batteries.length}</p>
                    <p className="text-xs text-muted-foreground">Total Batteries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(drone.batteries.reduce((s,b) => s + (b.health || 0), 0) / drone.batteries.length)}%</p>
                    <p className="text-xs text-muted-foreground">Avg Health</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{drone.batteries.filter(b => (b.health || 100) < 30).length}</p>
                    <p className="text-xs text-muted-foreground">Need Replacement</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{drone.batteries.reduce((s,b) => s + b.cycleCount, 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Cycles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {drone.batteries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                <Battery className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No batteries tracked yet.</p>
                <Button size="sm" onClick={() => setBattOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Battery
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {drone.batteries.map((bat) => (
                <Card key={bat.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {bat.serialNumber || 'Battery'}
                        </p>
                        {bat.capacity && (
                          <p className="text-sm text-muted-foreground">
                            {bat.capacity} mAh
                          </p>
                        )}
                      </div>
                      {bat.health !== null && (
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getHealthColor(bat.health)}`}>
                            {bat.health}%
                          </p>
                          <p className="text-xs text-muted-foreground">Health</p>
                          {bat.health !== null && (
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                              <div className={`h-2 rounded-full ${bat.health >= 80 ? 'bg-green-500' : bat.health >= 50 ? 'bg-yellow-500' : bat.health >= 20 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${bat.health}%` }} />
                            </div>
                          )}
                          {bat.health !== null && bat.health < 50 && (
                            <Badge variant="destructive" className="text-[10px] mt-1">
                              {bat.health < 20 ? 'Critical — Replace' : 'Replace Soon'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Cycle Count</span>
                        <span className="font-medium text-foreground">
                          {bat.cycleCount}
                        </span>
                      </div>
                      {bat.purchaseDate && (
                        <div className="flex justify-between">
                          <span>Purchased</span>
                          <span className="font-medium text-foreground">
                            {new Date(bat.purchaseDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {bat.lastChargeDate && (
                        <div className="flex justify-between">
                          <span>Last Charged</span>
                          <span className="font-medium text-foreground">
                            {Math.floor((Date.now() - new Date(bat.lastChargeDate).getTime()) / 86400000)} days ago
                          </span>
                        </div>
                      )}
                    </div>
                    {bat.notes && (
                      <p className="text-xs text-muted-foreground border-t pt-2">
                        {bat.notes}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2 border-t mt-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleChargeBattery(bat.id)}>
                        <Zap className="h-3 w-3 mr-1" /> Charge
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditBattId(bat.id); setEditBattForm({ serialNumber: bat.serialNumber || '', capacity: bat.capacity?.toString() || '', health: bat.health?.toString() || '', notes: bat.notes || '' }) }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteBattery(bat.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {editBattId === bat.id && (
                      <div className="pt-3 border-t mt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Serial Number" value={editBattForm.serialNumber} onChange={e => setEditBattForm(f => ({...f, serialNumber: e.target.value}))} className="h-8 text-sm" />
                          <Input placeholder="Capacity (mAh)" type="number" value={editBattForm.capacity} onChange={e => setEditBattForm(f => ({...f, capacity: e.target.value}))} className="h-8 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Health %" type="number" min="0" max="100" value={editBattForm.health} onChange={e => setEditBattForm(f => ({...f, health: e.target.value}))} className="h-8 text-sm" />
                          <Input placeholder="Notes" value={editBattForm.notes} onChange={e => setEditBattForm(f => ({...f, notes: e.target.value}))} className="h-8 text-sm" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditBattId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleEditBattery(bat.id)}>Save</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
