"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Award, Search, AlertTriangle, CheckCircle, Filter } from "lucide-react"
import Link from "next/link"
import { differenceInDays } from "date-fns"

interface PilotCompliance {
  id: string; username: string; fullName: string; email: string; role: string
  pilotLicense?: string; pilotLicenseExpiry?: string; pilotLicenseType?: string
  caaRegistrationNumber?: string; insuranceProvider?: string; insuranceExpiry?: string
  _count: { drones: number; flightLogs: number }
}

function complianceStatus(pilot: PilotCompliance) {
  const issues: string[] = []
  if (!pilot.pilotLicense) issues.push("No license on file")
  else if (pilot.pilotLicenseExpiry) {
    const d = differenceInDays(new Date(pilot.pilotLicenseExpiry), new Date())
    if (d < 0) issues.push("License expired")
    else if (d <= 30) issues.push(`License expires in ${d}d`)
  }
  if (!pilot.insuranceProvider) issues.push("No insurance on file")
  else if (pilot.insuranceExpiry) {
    const d = differenceInDays(new Date(pilot.insuranceExpiry), new Date())
    if (d < 0) issues.push("Insurance expired")
    else if (d <= 30) issues.push(`Insurance expires in ${d}d`)
  }
  if (issues.length === 0) return { status: "compliant", issues, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" }
  if (issues.some(i => i.includes("expired"))) return { status: "non-compliant", issues, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" }
  return { status: "attention", issues, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20" }
}

export default function RegulatorCompliancePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pilots, setPilots] = useState<PilotCompliance[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && user && user.role !== "regulator" && user.role !== "admin") router.push("/")
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/regulator/compliance", { credentials: "include" })
      .then(r => r.json()).then(d => setPilots(d.pilots || []))
      .catch(() => {}).finally(() => setFetching(false))
  }, [user])

  const filtered = pilots.filter(p => {
    const matchSearch = !search || p.fullName.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    const { status } = complianceStatus(p)
    if (filter === "compliant") return status === "compliant"
    if (filter === "issues") return status !== "compliant"
    if (filter === "expired") return status === "non-compliant"
    return true
  })

  const counts = { total: pilots.length, compliant: pilots.filter(p => complianceStatus(p).status === "compliant").length, issues: pilots.filter(p => complianceStatus(p).status !== "compliant").length }

  if (loading || fetching) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-primary" /> Compliance Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor pilot and operator compliance across the platform</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{counts.total}</p><p className="text-sm text-muted-foreground">Total Pilots</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{counts.compliant}</p><p className="text-sm text-muted-foreground">Compliant</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{counts.issues}</p><p className="text-sm text-muted-foreground">Need Attention</p></CardContent></Card>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search pilots..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pilots</SelectItem>
            <SelectItem value="compliant">Compliant Only</SelectItem>
            <SelectItem value="issues">Has Issues</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map(pilot => {
          const { status, issues, color, bg } = complianceStatus(pilot)
          return (
            <Card key={pilot.id} className={`${bg} border`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback>{pilot.fullName.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{pilot.fullName}</p>
                        <Badge variant="outline" className="text-xs capitalize">{pilot.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">@{pilot.username} · {pilot.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pilot._count.drones} drones · {pilot._count.flightLogs} flights logged</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`flex items-center gap-1 justify-end ${color}`}>
                      {status === "compliant" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      <span className="text-sm font-medium capitalize">{status}</span>
                    </div>
                    {issues.length > 0 && <div className="mt-1 space-y-0.5">{issues.map((issue, i) => <p key={i} className="text-xs text-muted-foreground">{issue}</p>)}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>No pilots match your filters</p></div>}
      </div>
    </div>
  )
}
