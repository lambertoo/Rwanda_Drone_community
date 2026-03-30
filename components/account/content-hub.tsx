"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ClipboardList, MessageSquare, Camera, Calendar } from "lucide-react"

const FormsContent = dynamic(() => import("@/app/forms/page"), {
  loading: () => <SubTabLoading />,
})
const ForumContent = dynamic(
  () => import("@/app/forum/page"),
  { loading: () => <SubTabLoading /> }
)
const ProjectsContent = dynamic(
  () => import("@/app/projects/page").catch(() => ({ default: () => <p className="text-center py-12 text-muted-foreground">Projects page not available</p> })),
  { loading: () => <SubTabLoading /> }
)
const EventsContent = dynamic(
  () => import("@/app/events/page"),
  { loading: () => <SubTabLoading /> }
)

function SubTabLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  )
}

const SUB_TABS = [
  { id: "forms", label: "Forms", icon: ClipboardList },
  { id: "posts", label: "Posts", icon: MessageSquare },
  { id: "projects", label: "Projects", icon: Camera },
  { id: "events", label: "Events", icon: Calendar },
]

export default function ContentHub() {
  const [activeSubTab, setActiveSubTab] = useState("forms")

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 mb-4 overflow-x-auto">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === tab.id
                  ? "bg-background shadow-sm font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Sub-tab content */}
      {activeSubTab === "forms" && <FormsContent />}
      {activeSubTab === "posts" && <ForumContent />}
      {activeSubTab === "projects" && <ProjectsContent />}
      {activeSubTab === "events" && <EventsContent />}
    </div>
  )
}
