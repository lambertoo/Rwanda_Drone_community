"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, Info, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function ProviderBookingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
    if (!loading && user && user.role !== "service_provider" && user.role !== "admin") router.push("/")
  }, [user, loading, router])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" /> Bookings & Enquiries
        </h1>
        <p className="text-muted-foreground mt-1">Manage client bookings and service enquiries</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Coming Soon:</strong> An integrated booking system is planned for a future release.
          Clients will be able to request quotes and book your services directly through the platform.
          For now, clients contact you via the contact details listed on your services.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Process</CardTitle>
            <CardDescription>How clients currently reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Client finds your service</p>
                <p className="text-sm text-muted-foreground">Clients browse the services directory and view your listing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Client contacts you directly</p>
                <p className="text-sm text-muted-foreground">Via the phone, email, or website you listed on your service</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Client leaves a review</p>
                <p className="text-sm text-muted-foreground">After the job, clients can leave star ratings and reviews on your listing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Booking Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "In-platform booking request form for clients",
                "Quote request and negotiation thread",
                "Booking calendar integration",
                "Automated booking confirmation emails",
                "Payment integration (MTN Mobile Money / Stripe)",
                "Booking status tracking for clients",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/provider/services" className="flex-1">
            <Button variant="outline" className="w-full">Manage My Services</Button>
          </Link>
          <Link href="/provider/reviews" className="flex-1">
            <Button variant="outline" className="w-full">View Reviews</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
