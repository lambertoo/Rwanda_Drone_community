"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  const [allPilots, setAllPilots] = useState<Pilot[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [locations, setLocations] = useState<string[]>([])
  const [districtOpen, setDistrictOpen] = useState(false)

  function toggleDistrict(d: string) {
    setLocations(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  // Fetch all users once for stable counts
  useEffect(() => {
    fetch("/api/pilots", { credentials: "include" })
      .then(r => r.json())
      .then(d => setAllPilots(d.pilots || []))
      .catch(() => {})
  }, [])

  // Fetch filtered results
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (role !== "all") params.set("role", role)
    if (locations.length === 1) params.set("location", locations[0])
    fetch(`/api/pilots?${params}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        let result = d.pilots || []
        // Client-side filter for multiple locations
        if (locations.length > 1) {
          result = result.filter((p: Pilot) => p.location && locations.includes(p.location))
        }
        setPilots(result)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, role, locations])

  // Counts from ALL users, not filtered
  const roleCounts = allPilots.reduce((acc, p) => { acc[p.role] = (acc[p.role] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Hero */}
      <div className="relative bg-brand-gradient rounded-2xl overflow-hidden px-8 py-12 md:py-16">
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-8 right-40 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-[#009FDA]">
              Find & Connect
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              Community Directory
            </h1>
            <p className="text-white/75 text-base md:text-lg max-w-xl">
              Find pilots, hobbyists, service providers, and students across Rwanda
            </p>
          </div>
        </div>
      </div>

      {/* Role pill tabs with counts */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { value: "all", label: "All", count: allPilots.length },
          { value: "pilot", label: "Pilots", count: roleCounts["pilot"] || 0 },
          { value: "hobbyist", label: "Hobbyists", count: roleCounts["hobbyist"] || 0 },
          { value: "student", label: "Students", count: roleCounts["student"] || 0 },
          { value: "service_provider", label: "Service Providers", count: roleCounts["service_provider"] || 0 },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRole(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              role === tab.value
                ? "bg-[#003366] text-white border-[#003366] shadow-sm"
                : "bg-background text-muted-foreground border-border/50 hover:border-[#009FDA]/50 hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                role === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + District filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or bio..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* District multi-select dropdown */}
        <div className="relative">
          <button
            onClick={() => setDistrictOpen(!districtOpen)}
            className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border/60 bg-background text-sm hover:bg-muted transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {locations.length === 0
              ? "All Districts"
              : locations.length === 1
                ? formatDistrict(locations[0])
                : `${locations.length} districts`}
            {locations.length > 0 && (
              <span className="bg-[#003366] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{locations.length}</span>
            )}
          </button>

          {districtOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDistrictOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-popover border rounded-lg shadow-xl max-h-72 overflow-y-auto">
                <div className="sticky top-0 bg-popover border-b px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Select districts</span>
                  {locations.length > 0 && (
                    <button onClick={() => setLocations([])} className="text-xs text-primary hover:underline">Clear all</button>
                  )}
                </div>
                <div className="p-1.5">
                  {["KIGALI", "NORTH", "SOUTH", "EAST", "WEST"].map(province => {
                    const provinceDistricts = rwandaDistricts.filter(d => d.startsWith(province))
                    return (
                      <div key={province}>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 pt-2 pb-1">{province}</p>
                        {provinceDistricts.map(d => (
                          <label
                            key={d}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={locations.includes(d)}
                              onChange={() => toggleDistrict(d)}
                              className="rounded border-border"
                            />
                            {formatDistrict(d)}
                          </label>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
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
