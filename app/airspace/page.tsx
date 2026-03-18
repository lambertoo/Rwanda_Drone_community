"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle, Info, MapPin, BookMarked, Phone,
  CheckCircle, XCircle, AlertCircle, Plane
} from "lucide-react"

const AirspaceMap = dynamic(() => import("@/components/airspace/airspace-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[480px] w-full rounded-lg" />,
})

const noFlyZones = [
  { name: "Kigali Intl Airport (HRYR)", type: "Airport", restriction: "5km full ban / 10km advisory", province: "Kigali", severity: "red" },
  { name: "Kamembe Airport (HRZA)", type: "Airport", restriction: "3km full ban / 5km advisory", province: "Western (Rusizi)", severity: "red" },
  { name: "Huye Airport", type: "Airport", restriction: "3km full ban", province: "Southern", severity: "red" },
  { name: "Presidential Palace", type: "VIP/Government", restriction: "Full restriction – no exceptions", province: "Kigali", severity: "red" },
  { name: "Rwanda Defence Force Installations", type: "Military", restriction: "Strictly prohibited", province: "All", severity: "red" },
  { name: "Volcanoes National Park", type: "Protected Area", restriction: "No-fly – wildlife protection", province: "Northern", severity: "orange" },
  { name: "Nyungwe Forest National Park", type: "Protected Area", restriction: "No-fly – wildlife protection", province: "Western/Southern", severity: "orange" },
  { name: "Akagera National Park", type: "Protected Area", restriction: "No-fly without RDB permit", province: "Eastern", severity: "orange" },
  { name: "Gishari Forest Reserve", type: "Protected Area", restriction: "Restricted – permit required", province: "Eastern", severity: "orange" },
  { name: "Kigali City Centre (CBD)", type: "Urban/Security", restriction: "Category A only below 120m AMSL", province: "Kigali", severity: "yellow" },
  { name: "Parliament / Gov't Complex", type: "Government", restriction: "Prior authorization required", province: "Kigali", severity: "yellow" },
]

const permittedZones = [
  { name: "Musanze Drone Corridor", description: "Rwanda's official drone testing and innovation corridor. Category B & C operations permitted with prior notification.", province: "Northern (Musanze)", contact: "Rwanda CAA" },
  { name: "Rural Open Areas", description: "Uncontrolled airspace below 400ft AGL, away from restricted zones. Category A operations generally permitted.", province: "Nationwide", contact: "No prior auth needed (Category A)" },
  { name: "Designated Photography Areas", description: "Open areas away from airports, military, and national parks. Visual line-of-sight only.", province: "Nationwide", contact: "Check local bylaws" },
]

const rules = [
  { rule: "Maximum altitude 400ft (120m) AGL for Category A operations", ok: true },
  { rule: "Stay within visual line-of-sight (VLOS) unless BVLOS permit obtained", ok: true },
  { rule: "Register all drones weighing 250g or more with Rwanda CAA", ok: true },
  { rule: "Obtain pilot certification for commercial operations", ok: true },
  { rule: "Do not fly over crowds, emergency operations, or moving vehicles", ok: true },
  { rule: "No night operations without a special permit", ok: true },
  { rule: "Mandatory third-party insurance for commercial flights", ok: true },
  { rule: "Do not interfere with manned aircraft or emergency services", ok: false },
  { rule: "Never fly in restricted zones without written authorization", ok: false },
  { rule: "Do not fly under the influence of alcohol or drugs", ok: false },
]

export default function AirspacePage() {
  const [selectedProvince, setSelectedProvince] = useState("All")

  const provinces = ["All", "Kigali", "Northern", "Southern", "Eastern", "Western"]
  const filtered = selectedProvince === "All" ? noFlyZones : noFlyZones.filter(z => z.province.includes(selectedProvince))

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" /> Rwanda Airspace Reference
        </h1>
        <p className="text-muted-foreground mt-1">Know before you fly — Rwanda no-fly zones and airspace rules</p>
      </div>

      <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          <strong>Always verify current restrictions with Rwanda CAA before flying.</strong> Airspace designations change. NOTAMs may impose temporary restrictions not shown here. This page is a reference guide only — it does not substitute for official pre-flight checks.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="map">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="zones">No-Fly Zones</TabsTrigger>
          <TabsTrigger value="permitted">Permitted Zones</TabsTrigger>
          <TabsTrigger value="rules">Key Rules</TabsTrigger>
          <TabsTrigger value="contacts">CAA Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-0">
          <AirspaceMap />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click on any zone for details. Zones are approximate — always verify with Rwanda CAA before flying.
          </p>
        </TabsContent>

        <TabsContent value="zones">
          <div className="flex gap-2 flex-wrap mb-4">
            {provinces.map(p => (
              <Button key={p} size="sm" variant={selectedProvince === p ? "default" : "outline"} onClick={() => setSelectedProvince(p)}>{p}</Button>
            ))}
          </div>

          <div className="mb-3 flex gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Full restriction</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Protected area</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Advisory / conditional</span>
          </div>

          <div className="space-y-3">
            {filtered.map((z, i) => (
              <Card key={i} className={`border-l-4 ${z.severity === "red" ? "border-l-red-500" : z.severity === "orange" ? "border-l-orange-500" : "border-l-yellow-500"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{z.name}</p>
                        <Badge variant="outline" className="text-xs">{z.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{z.restriction}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{z.province}</p>
                    </div>
                    <XCircle className={`h-5 w-5 shrink-0 mt-0.5 ${z.severity === "red" ? "text-red-500" : "text-orange-500"}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permitted">
          <div className="space-y-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Musanze Drone Corridor
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Official Test Zone</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Rwanda's dedicated drone testing corridor in Musanze district. Category B & C operations are permitted with prior CAA notification. Ideal for BVLOS testing, payload delivery trials, and advanced flight testing. Contact Rwanda CAA for corridor access procedures.</p>
                <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> Northern Province (Musanze)</p>
              </CardContent>
            </Card>
            {permittedZones.slice(1).map((z, i) => (
              <Card key={i} className="border-l-4 border-l-blue-400">
                <CardContent className="p-4">
                  <p className="font-semibold mb-1">{z.name}</p>
                  <p className="text-sm text-muted-foreground">{z.description}</p>
                  <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{z.province}</p>
                </CardContent>
              </Card>
            ))}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Interactive live airspace map with real-time NOTAMs coming soon. Once enabled by administrator, this page will display a live map layer. For now, always check <strong>Rwanda CAA NOTAM system</strong> before any flight.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <div className="space-y-2">
            {rules.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                {r.ok ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                <p className="text-sm">{r.rule}</p>
              </div>
            ))}
          </div>
          <Card className="mt-6">
            <CardHeader><CardTitle className="text-base">Categories of Operations</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <p className="font-semibold text-green-800 dark:text-green-300">Category A — Open (Low Risk)</p>
                <p className="text-muted-foreground mt-1">Hobby/recreational, below 400ft AGL, within VLOS, away from restricted areas. Registration required for drones ≥250g. No pilot certificate required for basic operations.</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <p className="font-semibold text-yellow-800 dark:text-yellow-300">Category B — Specific (Medium Risk)</p>
                <p className="text-muted-foreground mt-1">Commercial operations, surveys, photography for hire. RPAS pilot certificate required. Prior flight authorization from Rwanda CAA needed.</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <p className="font-semibold text-red-800 dark:text-red-300">Category C — Certified (High Risk)</p>
                <p className="text-muted-foreground mt-1">BVLOS operations, flights over people, critical infrastructure. Full certification, special authorization, and insurance mandatory. Very limited approvals.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" />Rwanda CAA</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Civil Aviation Authority of Rwanda — drone registration, licensing, permits</p>
                <p><strong>Website:</strong> caa.gov.rw</p>
                <p><strong>Email:</strong> info@caa.gov.rw</p>
                <p><strong>Phone:</strong> +250 788 177 000</p>
                <p><strong>Location:</strong> Kigali International Airport</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Emergency Contacts</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Emergency Services:</strong> 112</p>
                <p><strong>Rwanda National Police:</strong> 113</p>
                <p><strong>RwandAir Operations:</strong> +250 788 177 000</p>
                <p className="text-muted-foreground mt-2">If you witness a drone flying unsafely or in a restricted zone, report to Rwanda CAA immediately.</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link href="/logbook/new"><Button size="sm">Log a Flight</Button></Link>
                <Link href="/compliance"><Button size="sm" variant="outline">Check My Compliance</Button></Link>
                <Link href="/safety/report"><Button size="sm" variant="outline">Report Incident</Button></Link>
                <Link href="/equipment"><Button size="sm" variant="outline">My Drone Fleet</Button></Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
