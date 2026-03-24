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
  { id: "service-providers", label: "Service Providers", icon: Wrench },
  { id: "clubs", label: "Clubs", icon: Trophy },
  { id: "hobbyists", label: "Hobbyists", icon: UserCircle },
]

function DirectoryContent() {
  const [subTab, setSubTab] = useState("all")

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {DIRECTORY_SUB_TABS.map((tab) => {
          const Icon = tab.icon
          const active = subTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Sub-tab content */}
      {(subTab === "all" || subTab === "pilots" || subTab === "hobbyists") && <PilotsContent />}
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
