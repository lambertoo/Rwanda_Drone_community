"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Award, AlertTriangle, CheckCircle, Clock, Plus, ExternalLink, Shield, Edit2 } from "lucide-react"
import Link from "next/link"
import { differenceInDays } from "date-fns"

interface Permit {
  id: string
  type: string
  authority: string
  referenceNumber?: string
  issuedDate?: string
  expiryDate?: string
  status: string
  notes?: string
}

function StatusBadge({ expiry }: { expiry?: string }) {
  if (!expiry) return <Badge variant="outline" className="text-xs">Not Set</Badge>
  const days = differenceInDays(new Date(expiry), new Date())
  if (days < 0) return <Badge variant="destructive" className="text-xs">Expired</Badge>
  if (days <= 30) return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs">Expires in {days}d</Badge>
  return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">Valid</Badge>
}

export default function CompliancePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [permits, setPermits] = useState<Permit[]>([])
  const [drones, setDrones] = useState<any[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [licenseData, setLicenseData] = useState({ pilotLicenseType: "", pilotLicense: "", pilotLicenseExpiry: "", caaRegistrationNumber: "", insuranceProvider: "", insuranceExpiry: "" })
  const [permit, setPermit] = useState({ type: "", authority: "Rwanda CAA", referenceNumber: "", issuedDate: "", expiryDate: "", notes: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/login") }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/compliance/permits", { credentials: "include" }).then(r => r.json()).then(d => setPermits(d.permits || []))
    fetch("/api/drones", { credentials: "include" }).then(r => r.json()).then(d => setDrones(d.drones || []))
    setLicenseData({
      pilotLicenseType: (user as any).pilotLicenseType || "",
      pilotLicense: (user as any).pilotLicense || "",
      pilotLicenseExpiry: (user as any).pilotLicenseExpiry ? new Date((user as any).pilotLicenseExpiry).toISOString().split("T")[0] : "",
      caaRegistrationNumber: (user as any).caaRegistrationNumber || "",
      insuranceProvider: (user as any).insuranceProvider || "",
      insuranceExpiry: (user as any).insuranceExpiry ? new Date((user as any).insuranceExpiry).toISOString().split("T")[0] : "",
    })
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(licenseData) })
      if (!res.ok) throw new Error()
      toast.success("Compliance profile updated")
      setEditProfile(false)
    } catch { toast.error("Failed to save") } finally { setSaving(false) }
  }

  const addPermit = async () => {
    if (!permit.type) { toast.error("Permit type required"); return }
    try {
      const res = await fetch("/api/compliance/permits", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(permit) })
      const data = await res.json()
      setPermits(p => [data.permit, ...p])
      setAddOpen(false)
      setPermit({ type: "", authority: "Rwanda CAA", referenceNumber: "", issuedDate: "", expiryDate: "", notes: "" })
      toast.success("Permit added")
    } catch { toast.error("Failed to add permit") }
  }

  const unregisteredDrones = drones.filter(d => !d.caaRegistrationNumber)
  const licenseExpiry = licenseData.pilotLicenseExpiry ? differenceInDays(new Date(licenseData.pilotLicenseExpiry), new Date()) : null
  const insuranceExpiry = licenseData.insuranceExpiry ? differenceInDays(new Date(licenseData.insuranceExpiry), new Date()) : null

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-primary" /> Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your licenses, registrations, insurance, and permits</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditProfile(true)} className="gap-2"><Edit2 className="h-4 w-4" />Update Info</Button>
      </div>

      {/* Alerts */}
      {(licenseExpiry !== null && licenseExpiry <= 30) && (
        <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-300">
            {licenseExpiry < 0 ? "Your pilot license has expired." : `Your pilot license expires in ${licenseExpiry} days.`} Update your license records or renew with Rwanda CAA.
          </AlertDescription>
        </Alert>
      )}
      {unregisteredDrones.length > 0 && (
        <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-300">
            {unregisteredDrones.length} drone(s) don't have a CAA registration number. <Link href="/equipment" className="underline font-medium">Update in Fleet</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Pilot License */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Pilot License</CardTitle>
              <StatusBadge expiry={licenseData.pilotLicenseExpiry} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{licenseData.pilotLicenseType || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">License #</span><span>{licenseData.pilotLicense || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expiry</span><span>{licenseData.pilotLicenseExpiry ? new Date(licenseData.pilotLicenseExpiry).toLocaleDateString() : "—"}</span></div>
          </CardContent>
        </Card>

        {/* Insurance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Insurance</CardTitle>
              <StatusBadge expiry={licenseData.insuranceExpiry} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span>{licenseData.insuranceProvider || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expiry</span><span>{licenseData.insuranceExpiry ? new Date(licenseData.insuranceExpiry).toLocaleDateString() : "—"}</span></div>
            <p className="text-xs text-muted-foreground pt-1">Third-party insurance is mandatory for commercial operations in Rwanda</p>
          </CardContent>
        </Card>

        {/* Drone Registrations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Drone Registrations</CardTitle>
              <Badge variant={unregisteredDrones.length > 0 ? "destructive" : "outline"}>{drones.filter(d => d.caaRegistrationNumber).length}/{drones.length} registered</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {drones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No drones in fleet. <Link href="/equipment/new" className="underline">Add a drone</Link></p>
            ) : (
              <div className="space-y-2">
                {drones.slice(0, 3).map(d => (
                  <div key={d.id} className="flex justify-between text-sm items-center">
                    <span>{d.name}</span>
                    {d.caaRegistrationNumber ? <span className="text-xs text-green-600 font-mono">{d.caaRegistrationNumber}</span> : <Badge variant="destructive" className="text-xs">Unregistered</Badge>}
                  </div>
                ))}
                {drones.length > 3 && <Link href="/equipment" className="text-xs text-primary underline">View all {drones.length} drones →</Link>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CAA Resources */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Rwanda CAA Resources</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Drone & Unmanned Aircraft portal", href: "https://caa.gov.rw/unmanned-aircraft" },
              { label: "Register Your Drone", href: "https://caa.gov.rw/unmanned-aircraft" },
              { label: "Apply for Pilot License", href: "https://caa.gov.rw/unmanned-aircraft" },
              { label: "Flight Authorization Application", href: "https://caa.gov.rw/unmanned-aircraft" },
            ].map((r, i) => (
              <a key={i} href={r.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-3 w-3" />{r.label}
              </a>
            ))}
            <p className="text-xs text-muted-foreground pt-1">Official Rwanda CAA Unmanned Aircraft portal — registration, licensing, permits.</p>
          </CardContent>
        </Card>
      </div>

      {/* Permits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permits & Authorizations</CardTitle>
              <CardDescription>Track your flight authorizations, commercial licenses, and special permits</CardDescription>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Permit</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Permit / Authorization</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Permit Type</Label>
                    <Select value={permit.type} onValueChange={v => setPermit(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                      <SelectContent>
                        {["Flight Authorization","Commercial License","BVLOS Permit","Night Operations","Special Area Permit","Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Issuing Authority</Label><Input value={permit.authority} onChange={e => setPermit(p => ({ ...p, authority: e.target.value }))} /></div>
                  <div><Label>Reference Number</Label><Input value={permit.referenceNumber} onChange={e => setPermit(p => ({ ...p, referenceNumber: e.target.value }))} placeholder="CAA-2026-XXXX" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Issued Date</Label><Input type="date" value={permit.issuedDate} onChange={e => setPermit(p => ({ ...p, issuedDate: e.target.value }))} /></div>
                    <div><Label>Expiry Date</Label><Input type="date" value={permit.expiryDate} onChange={e => setPermit(p => ({ ...p, expiryDate: e.target.value }))} /></div>
                  </div>
                  <div><Label>Notes</Label><Input value={permit.notes} onChange={e => setPermit(p => ({ ...p, notes: e.target.value }))} /></div>
                  <Button className="w-full" onClick={addPermit}>Save Permit</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {permits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No permits added yet. Add your flight authorizations and licenses above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground"><th className="text-left pb-2">Type</th><th className="text-left pb-2">Authority</th><th className="text-left pb-2">Reference</th><th className="text-left pb-2">Expiry</th><th className="text-left pb-2">Status</th></tr></thead>
                <tbody>
                  {permits.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">{p.type}</td>
                      <td className="py-2 text-muted-foreground">{p.authority}</td>
                      <td className="py-2 font-mono text-xs">{p.referenceNumber || "—"}</td>
                      <td className="py-2">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "—"}</td>
                      <td className="py-2"><StatusBadge expiry={p.expiryDate} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit profile dialog */}
      <Dialog open={editProfile} onOpenChange={setEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Compliance Information</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Pilot License Type</Label><Select value={licenseData.pilotLicenseType} onValueChange={v => setLicenseData(p => ({ ...p, pilotLicenseType: v }))}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{["Category A (Recreational)","Category B (Commercial)","Category C (Advanced/BVLOS)","RPAS Instructor"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>License Number</Label><Input value={licenseData.pilotLicense} onChange={e => setLicenseData(p => ({ ...p, pilotLicense: e.target.value }))} placeholder="RWA-RPAS-XXXX" /></div>
            <div><Label>License Expiry Date</Label><Input type="date" value={licenseData.pilotLicenseExpiry} onChange={e => setLicenseData(p => ({ ...p, pilotLicenseExpiry: e.target.value }))} /></div>
            <div><Label>CAA Operator Registration #</Label><Input value={licenseData.caaRegistrationNumber} onChange={e => setLicenseData(p => ({ ...p, caaRegistrationNumber: e.target.value }))} placeholder="CAA-OP-XXXX" /></div>
            <div><Label>Insurance Provider</Label><Input value={licenseData.insuranceProvider} onChange={e => setLicenseData(p => ({ ...p, insuranceProvider: e.target.value }))} /></div>
            <div><Label>Insurance Expiry Date</Label><Input type="date" value={licenseData.insuranceExpiry} onChange={e => setLicenseData(p => ({ ...p, insuranceExpiry: e.target.value }))} /></div>
            <Button className="w-full" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
