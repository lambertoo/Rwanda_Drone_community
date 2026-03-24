"use client"

import { Suspense } from "react"
import { HubLayout, type HubTab } from "@/components/hub-layout"
import { User, Settings, Bell, ClipboardList, BarChart3 } from "lucide-react"
import dynamic from "next/dynamic"
import { AuthGuard } from "@/components/auth-guard"

const ProfileContent = dynamic(() => import("@/app/profile/edit/page"), { loading: () => <TabLoading /> })
const SettingsContent = dynamic(() => import("@/app/settings/page"), { loading: () => <TabLoading /> })
const NotificationsContent = dynamic(() => import("@/app/notifications/page"), { loading: () => <TabLoading /> })
const FormsContent = dynamic(() => import("@/app/forms/page"), { loading: () => <TabLoading /> })

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

const TABS: HubTab[] = [
  { id: "profile", label: "Profile", icon: User, href: "/profile/edit" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/notifications" },
  { id: "forms", label: "Forms", icon: ClipboardList, href: "/forms" },
]

export default function AccountPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<TabLoading />}>
        <HubLayout title="My Account" tabs={TABS} defaultTab="profile">
          {(activeTab) => (
            <>
              {activeTab === "profile" && <ProfileContent />}
              {activeTab === "settings" && <SettingsContent />}
              {activeTab === "notifications" && <NotificationsContent />}
              {activeTab === "forms" && <FormsContent />}
            </>
          )}
        </HubLayout>
      </Suspense>
    </AuthGuard>
  )
}
