'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star } from "lucide-react"

export default function EventDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            Competition
          </Badge>
          
          <h1 className="text-3xl font-bold mb-4">Drone Racing Championship 2024</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Join us for the most exciting drone racing event of the year! This championship brings together the best drone pilots from across Rwanda and the region for an action-packed day of high-speed racing, technical challenges, and community celebration.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The Rwanda Drone Racing Championship 2024 is the premier drone racing event in East Africa. This year's championship features multiple racing categories, from beginner-friendly courses to professional-level challenges that will test even the most skilled pilots.
                </p>
                
                <h4 className="font-semibold mb-2">What to expect:</h4>
                <ul className="space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Multiple racing categories (Beginner, Intermediate, Professional)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Technical challenges and obstacle courses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Live streaming and commentary
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Vendor booths showcasing the latest drone technology
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Networking opportunities with industry professionals
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Prizes worth over 500,000 RWF
                  </li>
                </ul>

                <h4 className="font-semibold mb-2">Requirements</h4>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Own drone (rentals available on-site)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Valid pilot license or beginner certification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Safety gear (provided if needed)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Registration 24 hours in advance
                  </li>
                </ul>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">#racing</Badge>
                    <Badge variant="outline">#competition</Badge>
                    <Badge variant="outline">#drones</Badge>
                    <Badge variant="outline">#technology</Badge>
                    <Badge variant="outline">#sports</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Event Info & Actions */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>3/15/2024</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>09:00 - 17:00</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>Kigali Convention Centre</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>150/200 attendees</span>
                  <span className="text-sm text-muted-foreground">(50 spots remaining)</span>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-2xl font-bold">Free</div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full">
                  Register Now
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RDRA</span>
                  </div>
                  <div>
                    <p className="font-medium">Rwanda Drone Racing Association</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-4">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-sm text-muted-foreground">4.8 (24 events)</span>
                </div>
                
                <Button variant="outline" className="w-full">
                  Contact Organizer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Message */}
        <div className="mt-8 p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✅ Event Details Page Test - No Client-Side Exceptions!
          </p>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            This is a simple hardcoded test page to verify the routing works correctly.
          </p>
        </div>
      </div>
    </div>
  )
} 