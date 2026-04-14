"use client"

import dynamic from "next/dynamic"

const NotamsFeed = dynamic(() => import("@/components/notams/notams-feed"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
})

export default function NotamsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <NotamsFeed />
    </div>
  )
}
