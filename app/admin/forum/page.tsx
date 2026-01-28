"use client"

import { AdminOnly } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function ForumManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Forum Management</h1>
        <p className="text-muted-foreground">
          Manage forum categories, posts, and discussions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forum</CardTitle>
          <CardDescription>Manage and moderate forum content</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Forum management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminForumPage() {
  return (
    <AdminOnly>
      <ForumManagementPage />
    </AdminOnly>
  )
}
