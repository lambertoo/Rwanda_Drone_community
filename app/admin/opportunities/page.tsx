"use client"

import { AdminOnly } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function OpportunitiesManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Opportunities Management</h1>
        <p className="text-muted-foreground">
          Manage job opportunities and listings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunities</CardTitle>
          <CardDescription>Manage and view all job opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Opportunities management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminOpportunitiesPage() {
  return (
    <AdminOnly>
      <OpportunitiesManagementPage />
    </AdminOnly>
  )
}
