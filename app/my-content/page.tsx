"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { AuthGuard } from "@/components/auth-guard"

const ContentHub = dynamic(() => import("@/components/account/content-hub"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
})

export default function MyContentPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30">
        <div className="bg-background border-b">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
            <h1 className="text-lg font-semibold">My Content</h1>
            <p className="text-sm text-muted-foreground">Manage your forms, posts, projects & events</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
          <Suspense>
            <ContentHub />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  )
}
