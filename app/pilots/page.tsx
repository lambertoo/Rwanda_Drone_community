"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Search, MapPin, Users, Star } from "lucide-react"

interface Pilot {
  id: string
  username: string
  fullName: string
  avatar?: string
  role: string
  location?: string
  bio?: string
  specializations?: string[]
  reputation: number
  joinedAt: string
  _count: { projects: number; posts: number; events: number }
}

const roleConfig: Record<string, { label: string; color: string }> = {
  pilot: { label: "Pilot", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  hobbyist: { label: "Hobbyist", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  service_provider: { label: "Service Provider", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  student: { label: "Student", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  regulator: { label: "Regulator", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  admin: { label: "Admin", color: "bg-muted text-foreground dark:bg-gray-900 dark:text-muted-foreground/50" },
}

const rwandaDistricts = [
  "KIGALI_NYARUGENGE","KIGALI_KICUKIRO","KIGALI_GASABO",
  "NORTH_MUSANZE","NORTH_GICUMBI","NORTH_RULINDO","NORTH_BURERA","NORTH_GAKENKE",
  "SOUTH_HUYE","SOUTH_NYAMAGABE","SOUTH_NYARUGURU","SOUTH_MUHANGA","SOUTH_KAMONYI","SOUTH_GISAGARA","SOUTH_NYANZA","SOUTH_RUHANGO",
  "EAST_KAYONZA","EAST_NGOMA","EAST_KIREHE","EAST_NYAGATARE","EAST_BUGESERA","EAST_RWAMAGANA","EAST_GATSIBO",
  "WEST_RUBAVU","WEST_RUSIZI","WEST_NYAMASHEKE","WEST_RUTSIRO","WEST_KARONGI","WEST_NGORORERO","WEST_NYABIHU",
]

function formatDistrict(d: string) {
  return d.replace(/_/g, " ").replace(/^(KIGALI|NORTH|SOUTH|EAST|WEST) /, "")
}

export default function PilotsPage() {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [location, setLocation] = useState("all")

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (role !== "all") params.set("role", role)
    if (location !== "all") params.set("location", location)
    fetch(`/api/pilots?${params}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setPilots(d.pilots || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, role, location])

  const roleCounts = pilots.reduce((acc, p) => { acc[p.role] = (acc[p.role] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Community Directory</h1>
        <p className="text-muted-foreground mt-1">Find pilots, hobbyists, service providers, and students across Rwanda</p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(roleCounts).map(([r, count]) => (
          <div key={r} className="flex items-center gap-1.5 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig[r]?.color || "bg-muted text-muted-foreground"}`}>{roleConfig[r]?.label || r}</span>
            <span className="text-muted-foreground">{count}</span>
          </div>
        ))}
        <span className="text-sm text-muted-foreground ml-auto">{pilots.length} total members</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or bio..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="pilot">Pilots</SelectItem>
            <SelectItem value="hobbyist">Hobbyists</SelectItem>
            <SelectItem value="service_provider">Service Providers</SelectItem>
            <SelectItem value="student">Students</SelectItem>
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-48"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {rwandaDistricts.map(d => <SelectItem key={d} value={d}>{formatDistrict(d)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : pilots.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No members found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pilots.map(pilot => {
            const specs = Array.isArray(pilot.specializations) ? pilot.specializations as string[] : []
            const rc = roleConfig[pilot.role] || { label: pilot.role, color: "bg-muted text-muted-foreground" }
            return (
              <Card key={pilot.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={pilot.avatar || ""} />
                      <AvatarFallback className="text-lg font-semibold">{pilot.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{pilot.fullName}</p>
                      <p className="text-sm text-muted-foreground">@{pilot.username}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${rc.color}`}>{rc.label}</span>
                    </div>
                  </div>
                  {pilot.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />{formatDistrict(pilot.location)}
                    </p>
                  )}
                  {pilot.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{pilot.bio}</p>}
                  {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {specs.slice(0, 3).map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                      {specs.length > 3 && <Badge variant="outline" className="text-xs">+{specs.length - 3}</Badge>}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{pilot._count.projects} projects</span>
                      <span>{pilot._count.posts} posts</span>
                    </div>
                    <Link href={`/profile/${pilot.username}`}>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </Link>
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
