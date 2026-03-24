"use client"

import { Suspense } from "react"
import { HubLayout, type HubTab } from "@/components/hub-layout"
import {
  MessageSquare,
  Camera,
  Calendar,
  Newspaper,
  Briefcase,
  Users,
} from "lucide-react"
import dynamic from "next/dynamic"

// Lazy-load tab content from existing pages
const ForumContent = dynamic(() => import("@/app/forum/page"), { loading: () => <TabLoading /> })
const ProjectsContent = dynamic(() => import("@/app/projects/page"), { loading: () => <TabLoading /> })
const EventsContent = dynamic(() => import("@/app/events/page"), { loading: () => <TabLoading /> })
const NewsContent = dynamic(() => import("@/app/news/page"), { loading: () => <TabLoading /> })
const OpportunitiesContent = dynamic(() => import("@/app/opportunities/page"), { loading: () => <TabLoading /> })
const PilotsContent = dynamic(() => import("@/app/pilots/page"), { loading: () => <TabLoading /> })

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
            {activeTab === "directory" && <PilotsContent />}
          </>
        )}
      </HubLayout>
    </Suspense>
  )
}
