"use client"

import { Suspense } from "react"
import { HubLayout, type HubTab } from "@/components/hub-layout"
import { User, MessageSquare, FileText, Plane, Bell } from "lucide-react"
import dynamic from "next/dynamic"
import { AuthGuard } from "@/components/auth-guard"

const ProfileContent = dynamic(() => import("@/app/profile/edit/page"), { loading: () => <TabLoading /> })
const MessagesContent = dynamic(() => import("@/app/messages/page"), { loading: () => <TabLoading /> })
const ContentHub = dynamic(() => import("@/components/account/content-hub"), { loading: () => <TabLoading /> })
const NotificationsContent = dynamic(() => import("@/app/notifications/page"), { loading: () => <TabLoading /> })

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

const TABS: HubTab[] = [
  { id: "profile", label: "Profile", icon: User, href: "/profile/edit" },
  { id: "messages", label: "Messages", icon: MessageSquare, href: "/messages" },
  { id: "content", label: "My Content", icon: FileText, href: "/account?tab=content" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/notifications" },
]

export default function AccountPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<TabLoading />}>
        <HubLayout title="My Account" tabs={TABS} defaultTab="profile">
          {(activeTab) => (
            <>
              {activeTab === "profile" && <ProfileContent />}
              {activeTab === "messages" && <MessagesContent />}
              {activeTab === "content" && <ContentHub />}
              {activeTab === "notifications" && <NotificationsContent />}
            </>
          )}
        </HubLayout>
      </Suspense>
    </AuthGuard>
  )
}
