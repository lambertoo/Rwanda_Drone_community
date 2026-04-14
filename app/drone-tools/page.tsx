"use client"

import { Suspense } from "react"
import { HubLayout, type HubTab } from "@/components/hub-layout"
import { useAuth } from "@/lib/auth-context"
import { Plane, BookMarked, Map, CloudSun, AlertTriangle, Award, Route, ClipboardCheck, Battery, AlertOctagon } from "lucide-react"
import dynamic from "next/dynamic"

const FleetContent = dynamic(() => import("@/app/equipment/page"), { loading: () => <TabLoading /> })
const LogbookContent = dynamic(() => import("@/app/logbook/page"), { loading: () => <TabLoading /> })
const AirspaceContent = dynamic(() => import("@/app/airspace/page"), { loading: () => <TabLoading /> })
const MissionContent = dynamic(() => import("@/app/mission-planner/page"), { loading: () => <TabLoading /> })
const PreflightContent = dynamic(() => import("@/app/preflight/page"), { loading: () => <TabLoading /> })
const BatteriesContent = dynamic(() => import("@/app/batteries/page"), { loading: () => <TabLoading /> })
const NotamsContent = dynamic(() => import("@/app/notams/page"), { loading: () => <TabLoading /> })
const WeatherContent = dynamic(() => import("@/app/weather/page"), { loading: () => <TabLoading /> })
const SafetyContent = dynamic(() => import("@/app/safety/page"), { loading: () => <TabLoading /> })
const ComplianceContent = dynamic(() => import("@/app/compliance/page"), { loading: () => <TabLoading /> })

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

const ALL_TABS: (HubTab & { authOnly?: boolean })[] = [
  { id: "fleet", label: "My Fleet", icon: Plane, href: "/equipment", authOnly: true },
  { id: "logbook", label: "Logbook", icon: BookMarked, href: "/logbook", authOnly: true },
  { id: "airspace", label: "Airspace", icon: Map, href: "/airspace" },
  { id: "notams", label: "Notices", icon: AlertOctagon, href: "/notams" },
  { id: "mission", label: "Mission", icon: Route, href: "/mission-planner", authOnly: true },
  { id: "preflight", label: "Pre-flight", icon: ClipboardCheck, href: "/preflight", authOnly: true },
  { id: "batteries", label: "Batteries", icon: Battery, href: "/batteries", authOnly: true },
  { id: "weather", label: "Weather", icon: CloudSun, href: "/weather" },
  { id: "safety", label: "Safety", icon: AlertTriangle, href: "/safety" },
  { id: "compliance", label: "Compliance", icon: Award, href: "/compliance" },
]

export default function DroneToolsPage() {
  const { user } = useAuth()
  const tabs = ALL_TABS.filter((t) => !t.authOnly || user)
  const defaultTab = user ? "fleet" : "airspace"

  return (
    <Suspense fallback={<TabLoading />}>
      <HubLayout title="Drone Tools" tabs={tabs} defaultTab={defaultTab}>
        {(activeTab) => (
          <>
            {activeTab === "fleet" && <FleetContent />}
            {activeTab === "logbook" && <LogbookContent />}
            {activeTab === "airspace" && <AirspaceContent />}
            {activeTab === "notams" && <NotamsContent />}
            {activeTab === "mission" && <MissionContent />}
            {activeTab === "preflight" && <PreflightContent />}
            {activeTab === "batteries" && <BatteriesContent />}
            {activeTab === "weather" && <WeatherContent />}
            {activeTab === "safety" && <SafetyContent />}
            {activeTab === "compliance" && <ComplianceContent />}
          </>
        )}
      </HubLayout>
    </Suspense>
  )
}
