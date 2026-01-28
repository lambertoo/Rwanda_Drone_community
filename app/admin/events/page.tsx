"use client"

import { AdminOnly } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function EventsManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Events Management</h1>
        <p className="text-muted-foreground">
          Manage community events and activities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>Manage and view all community events</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Events management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminEventsPage() {
  return (
    <AdminOnly>
      <EventsManagementPage />
    </AdminOnly>
  )
}
