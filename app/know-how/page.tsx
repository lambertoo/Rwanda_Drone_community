"use client"

import { Suspense } from "react"
import { HubLayout, type HubTab } from "@/components/hub-layout"
import { BookOpen, GraduationCap, Users, FileText } from "lucide-react"
import dynamic from "next/dynamic"

const CoursesContent = dynamic(() => import("@/app/learn/page"), { loading: () => <TabLoading /> })
const MyCoursesContent = dynamic(() => import("@/app/learn/my-courses/page"), { loading: () => <TabLoading /> })
const MentorshipContent = dynamic(() => import("@/app/mentorship/page"), { loading: () => <TabLoading /> })
const ResourcesContent = dynamic(() => import("@/app/resources/page"), { loading: () => <TabLoading /> })

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

const TABS: HubTab[] = [
  { id: "courses", label: "Courses", icon: BookOpen, href: "/learn" },
  { id: "my-courses", label: "My Courses", icon: GraduationCap, href: "/learn/my-courses" },
  { id: "mentorship", label: "Mentorship", icon: Users, href: "/mentorship" },
  { id: "resources", label: "Resources", icon: FileText, href: "/resources" },
]

export default function KnowHowPage() {
  return (
    <Suspense fallback={<TabLoading />}>
      <HubLayout title="Know-How" tabs={TABS} defaultTab="courses">
        {(activeTab) => (
          <>
            {activeTab === "courses" && <CoursesContent />}
            {activeTab === "my-courses" && <MyCoursesContent />}
            {activeTab === "mentorship" && <MentorshipContent />}
            {activeTab === "resources" && <ResourcesContent />}
          </>
        )}
      </HubLayout>
    </Suspense>
  )
}
