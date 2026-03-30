"use client"

import { Suspense, useState } from "react"
import { HubLayout, type HubTab } from "@/components/hub-layout"
import {
  MessageSquare,
  Camera,
  Calendar,
  Newspaper,
  Briefcase,
  Users,
  Wrench,
  Trophy,
  Plane,
  UserCircle,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Lazy-load tab content from existing pages
const ForumContent = dynamic(() => import("@/app/forum/page"), { loading: () => <TabLoading /> })
const ProjectsContent = dynamic(() => import("@/app/projects/page"), { loading: () => <TabLoading /> })
const EventsContent = dynamic(() => import("@/app/events/page"), { loading: () => <TabLoading /> })
const NewsContent = dynamic(() => import("@/app/news/page"), { loading: () => <TabLoading /> })
const OpportunitiesContent = dynamic(() => import("@/app/opportunities/page"), { loading: () => <TabLoading /> })
const PilotsContent = dynamic(() => import("@/app/pilots/page"), { loading: () => <TabLoading /> })
const ClubsContent = dynamic(() => import("@/app/clubs/page"), { loading: () => <TabLoading /> })
const ServicesContent = dynamic(() => import("@/app/services/page"), { loading: () => <TabLoading /> })

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

const TABS: HubTab[] = [
  { id: "forum", label: "Forum", icon: MessageSquare, href: "/forum" },
  { id: "projects", label: "Projects", icon: Camera, href: "/projects" },
  { id: "events", label: "Events", icon: Calendar, href: "/events" },
  { id: "news", label: "News", icon: Newspaper, href: "/news" },
  { id: "opportunities", label: "Opportunities", icon: Briefcase, href: "/opportunities" },
  { id: "directory", label: "Directory", icon: Users, href: "/pilots" },
]

// Directory sub-tabs
const DIRECTORY_SUB_TABS = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "pilots", label: "Pilots", icon: Plane },
  { id: "hobbyists", label: "Hobbyists", icon: UserCircle },
  { id: "students", label: "Students", icon: Users },
  { id: "service-providers", label: "Service Providers", icon: Wrench },
  { id: "clubs", label: "Clubs", icon: Trophy },
]

// Role mapping from tab id to API role value
const TAB_TO_ROLE: Record<string, string> = {
  pilots: "pilot",
  hobbyists: "hobbyist",
  students: "student",
  "service-providers": "service_provider",
}

function DirectoryContent() {
  const [subTab, setSubTab] = useState("all")

  // For people tabs, we load the pilots page which has its own filtering
  // For service-providers and clubs, we load their own pages
  const isPeopleTab = ["all", "pilots", "hobbyists", "students"].includes(subTab)

  return (
    <div>
      {/* Sub-tabs — pill style like opportunities */}
      <div className="flex flex-wrap gap-1.5 mb-6 px-4 sm:px-6 lg:px-8">
        {DIRECTORY_SUB_TABS.map((tab) => {
          const Icon = tab.icon
          const active = subTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                active
                  ? "bg-[#002674] text-white border-[#002674] shadow-sm"
                  : "bg-background text-muted-foreground border-border/50 hover:border-[#0096FC]/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Sub-tab content */}
      {isPeopleTab && <PilotsContent key={subTab} />}
      {subTab === "service-providers" && <ServicesContent />}
      {subTab === "clubs" && <ClubsContent />}
    </div>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<TabLoading />}>
      <HubLayout title="Community" tabs={TABS} defaultTab="forum">
        {(activeTab) => (
          <>
            {activeTab === "forum" && <ForumContent />}
            {activeTab === "projects" && <ProjectsContent />}
            {activeTab === "events" && <EventsContent />}
            {activeTab === "news" && <NewsContent />}
            {activeTab === "opportunities" && <OpportunitiesContent />}
            {activeTab === "directory" && <DirectoryContent />}
          </>
        )}
      </HubLayout>
    </Suspense>
  )
}
