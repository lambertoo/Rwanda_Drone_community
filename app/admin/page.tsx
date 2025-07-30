import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageSquare,
  Calendar,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

export default function AdminPage() {
  const stats = [
    { label: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
    { label: "Forum Posts", value: "3,892", change: "+8%", icon: MessageSquare, color: "text-green-600" },
    { label: "Active Events", value: "12", change: "+3", icon: Calendar, color: "text-purple-600" },
    { label: "Job Listings", value: "28", change: "+5", icon: Briefcase, color: "text-orange-600" },
  ]

  const pendingApprovals = [
    {
      type: "Event",
      title: "Drone Racing Workshop - Butare",
      submitter: "SpeedDrone_RW",
      date: "2 hours ago",
      status: "pending",
    },
    {
      type: "Service",
      title: "Aerial Mapping Services - Nyagatare",
      submitter: "MapPro_Rwanda",
      date: "4 hours ago",
      status: "pending",
    },
    {
      type: "Job",
      title: "Construction Site Surveyor",
      submitter: "BuildTech_Ltd",
      date: "1 day ago",
      status: "pending",
    },
    {
      type: "Project",
      title: "Akagera Wildlife Monitoring",
      submitter: "WildlifeDrone",
      date: "2 days ago",
      status: "pending",
    },
  ]

  const reportedContent = [
    {
      type: "Forum Post",
      title: "Inappropriate drone usage discussion",
      reporter: "ConcernedUser",
      reason: "Violates safety guidelines",
      date: "1 hour ago",
      severity: "high",
    },
    {
      type: "Comment",
      title: "Spam comment on agricultural post",
      reporter: "ModeratorAlert",
      reason: "Spam content",
      date: "3 hours ago",
      severity: "medium",
    },
    {
      type: "Project",
      title: "Questionable flight location",
      reporter: "SafetyFirst",
      reason: "Possible no-fly zone violation",
      date: "6 hours ago",
      severity: "high",
    },
  ]

  const recentActivity = [
    { action: "New user registration", user: "PilotNewbie_RW", time: "5 minutes ago" },
    { action: "Event created", user: "DroneAcademy", time: "15 minutes ago" },
    { action: "Job posting approved", user: "TechCorp_RW", time: "1 hour ago" },
    { action: "Forum post reported", user: "System", time: "2 hours ago" },
    { action: "Service listing updated", user: "AerialPro", time: "3 hours ago" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the Rwanda Drone Community platform</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change} from last month</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="reports">Reported Content</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Approvals</h2>
            <Badge variant="secondary">{pendingApprovals.length} items</Badge>
          </div>

          <div className="space-y-4">
            {pendingApprovals.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted by {item.submitter} • {item.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reported Content</h2>
            <Badge variant="destructive">{reportedContent.length} reports</Badge>
          </div>

          <div className="space-y-4">
            {reportedContent.map((report, index) => (
              <Card key={index} className={report.severity === "high" ? "border-red-200 bg-red-50/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge variant={report.severity === "high" ? "destructive" : "secondary"}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {report.severity} priority
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">Reason: {report.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        Reported by {report.reporter} • {report.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Investigate
                      </Button>
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <h2 className="text-xl font-semibold">User Management</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Active This Month</span>
                  <span className="font-semibold">892</span>
                </div>
                <div className="flex justify-between">
                  <span>New This Week</span>
                  <span className="font-semibold">34</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified Pilots</span>
                  <span className="font-semibold">156</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Hobbyists</span>
                  <span className="font-semibold">623</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional Pilots</span>
                  <span className="font-semibold">298</span>
                </div>
                <div className="flex justify-between">
                  <span>Businesses</span>
                  <span className="font-semibold">187</span>
                </div>
                <div className="flex justify-between">
                  <span>Students</span>
                  <span className="font-semibold">139</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Platform Analytics</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Active Users</span>
                    <span className="font-semibold text-green-600">+12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forum Engagement</span>
                    <span className="font-semibold text-green-600">+18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Attendance</span>
                    <span className="font-semibold text-green-600">+25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Job Applications</span>
                    <span className="font-semibold text-green-600">+8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Forum Posts</span>
                    <span className="font-semibold">3,892</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Project Showcases</span>
                    <span className="font-semibold">234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Listings</span>
                    <span className="font-semibold">67</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resource Downloads</span>
                    <span className="font-semibold">12,456</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
