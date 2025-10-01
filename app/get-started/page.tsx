"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  BookOpen,
  MessageSquare,
  FolderKanban,
  Calendar,
  Briefcase,
  Lightbulb,
  FileText,
  Users,
  Shield,
  CheckCircle,
  PlayCircle,
  ArrowRight,
  Rocket,
  Settings,
  Image as ImageIcon,
} from "lucide-react"

export default function GetStartedPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  const getRoleFeatures = (role: string) => {
    const baseFeatures = [
      {
        icon: MessageSquare,
        title: "Forum Discussions",
        description: "Participate in community discussions, ask questions, and share knowledge",
        steps: [
          "Navigate to the Forum section from the sidebar",
          "Browse categories like General, Technical Support, or Best Practices",
          "Click on a post to read and comment",
          "Create your own post using the 'New Post' button",
          "Add relevant tags to help others find your content",
        ],
        link: "/forum",
        color: "text-blue-600",
      },
      {
        icon: FolderKanban,
        title: "Browse Projects",
        description: "Explore drone projects shared by the community",
        steps: [
          "Go to Projects section from the sidebar",
          "Use filters to find projects by category, status, or location",
          "Click on any project to view full details",
          "Like projects you find interesting",
          "Comment to provide feedback or ask questions",
        ],
        link: "/projects",
        color: "text-green-600",
      },
      {
        icon: Calendar,
        title: "Events & Workshops",
        description: "Discover and RSVP to drone-related events",
        steps: [
          "Visit the Events section",
          "Browse upcoming workshops, competitions, and meetups",
          "Click 'RSVP' to register for events",
          "Add events to your calendar",
          "Get reminders before event starts",
        ],
        link: "/events",
        color: "text-purple-600",
      },
      {
        icon: Lightbulb,
        title: "Browse Opportunities",
        description: "Find jobs, gigs, and collaboration opportunities",
        steps: [
          "Navigate to Opportunities section",
          "Filter by type (Jobs, Gigs, Collaborations)",
          "Click on opportunities to view details",
          "Save opportunities for later",
          "Apply directly through the platform",
        ],
        link: "/opportunities",
        color: "text-orange-600",
      },
    ]

    const roleSpecificFeatures: Record<string, any[]> = {
      pilot: [
        {
          icon: FolderKanban,
          title: "Create Projects",
          description: "Showcase your drone projects and achievements",
          steps: [
            "Click 'New Project' in the Projects section",
            "Fill in project details (title, description, category)",
            "Upload images to create a gallery",
            "Add team members and technologies used",
            "Publish to share with the community",
          ],
          link: "/projects/new",
          color: "text-green-600",
        },
        {
          icon: Calendar,
          title: "Organize Events",
          description: "Host workshops, training sessions, or community meetups",
          steps: [
            "Go to Events and click 'Create Event'",
            "Set event details (title, date, location, venue)",
            "Upload event flyer",
            "Add speakers and agenda",
            "Publish and manage RSVPs",
          ],
          link: "/events/new",
          color: "text-purple-600",
        },
      ],
      service_provider: [
        {
          icon: Briefcase,
          title: "List Your Services",
          description: "Offer professional drone services to the community",
          steps: [
            "Navigate to Services section",
            "Click 'Add Service' button",
            "Describe your services (aerial photography, mapping, etc.)",
            "Add contact information",
            "Upload portfolio images to showcase your work",
            "Set service area and pricing",
          ],
          link: "/services/new",
          color: "text-indigo-600",
        },
        {
          icon: ImageIcon,
          title: "Build Your Portfolio",
          description: "Showcase your best drone work",
          steps: [
            "Create or edit your service listing",
            "Upload high-quality images of your work",
            "Add captions describing each project",
            "Organize images by service type",
            "Update regularly with new work",
          ],
          link: "/services",
          color: "text-pink-600",
        },
        {
          icon: Lightbulb,
          title: "Post Opportunities",
          description: "Hire pilots or find collaborators for projects",
          steps: [
            "Go to Opportunities section",
            "Click 'Post Opportunity'",
            "Choose type (Job, Gig, Collaboration)",
            "Set requirements and compensation",
            "Review applications through your dashboard",
          ],
          link: "/opportunities/new",
          color: "text-orange-600",
        },
      ],
      student: [
        {
          icon: FileText,
          title: "Access Resources",
          description: "Learn from tutorials, guides, and documentation",
          steps: [
            "Visit the Resources section",
            "Browse by category (Tutorials, Regulations, etc.)",
            "Download study materials",
            "Bookmark useful resources",
            "Share helpful resources with classmates",
          ],
          link: "/resources",
          color: "text-teal-600",
        },
        {
          icon: Users,
          title: "Network & Learn",
          description: "Connect with experienced pilots and professionals",
          steps: [
            "Participate in forum discussions",
            "Attend workshops and training events",
            "Follow experienced pilots' projects",
            "Ask questions and seek mentorship",
            "Join study groups in your area",
          ],
          link: "/forum",
          color: "text-blue-600",
        },
      ],
      hobbyist: [
        {
          icon: FolderKanban,
          title: "Share Your Projects",
          description: "Document and share your drone adventures",
          steps: [
            "Create projects to showcase your flights",
            "Upload photos and videos from your flights",
            "Share tips and experiences",
            "Connect with other hobbyists",
            "Learn from the community",
          ],
          link: "/projects/new",
          color: "text-green-600",
        },
      ],
      admin: [
        {
          icon: Shield,
          title: "Manage Platform",
          description: "Admin dashboard and content moderation",
          steps: [
            "Access Admin Dashboard from profile menu",
            "Review pending content (posts, projects, events)",
            "Manage categories and settings",
            "Monitor user activity and statistics",
            "Handle user reports and moderation",
          ],
          link: "/admin",
          color: "text-red-600",
        },
        {
          icon: Users,
          title: "User Management",
          description: "Manage user accounts and permissions",
          steps: [
            "View all registered users",
            "Verify service providers",
            "Manage user roles and permissions",
            "Handle account issues",
            "Review user reports",
          ],
          link: "/admin/users",
          color: "text-red-600",
        },
      ],
    }

    return [...baseFeatures, ...(roleSpecificFeatures[role] || [])]
  }

  const features = user?.role ? getRoleFeatures(user.role) : []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Get Started</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Welcome to Rwanda Drone Community Platform! Learn how to make the most of all features available to you.
          </p>
          {user?.role && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Your Role: <span className="ml-1 font-semibold capitalize">{user.role.replace('_', ' ')}</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="features">
              <PlayCircle className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="tips">
              <CheckCircle className="h-4 w-4 mr-2" />
              Quick Tips
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>
                  Rwanda Drone Community Platform connects drone enthusiasts, pilots, service providers, and students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Who Can Join?
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Hobbyists:</strong> Recreational drone flyers</li>
                      <li>• <strong>Pilots:</strong> Licensed commercial operators</li>
                      <li>• <strong>Students:</strong> Learning drone technology</li>
                      <li>• <strong>Service Providers:</strong> Offering professional services</li>
                      <li>• <strong>Regulators:</strong> Government & aviation authorities</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-primary" />
                      What Can You Do?
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Join discussions in the community forum</li>
                      <li>• Showcase and discover drone projects</li>
                      <li>• Find and attend events & workshops</li>
                      <li>• Post or apply for opportunities</li>
                      <li>• Access learning resources</li>
                      <li>• Network with other drone enthusiasts</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Make sure your profile is complete to get the most out of the platform
                  </p>
                  <Link href="/profile/edit">
                    <Button size="sm">
                      Edit Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-primary/10`}>
                            <Icon className={`h-6 w-6 ${feature.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </div>
                        </div>
                        {feature.link && (
                          <Link href={feature.link}>
                            <Button size="sm" variant="outline">
                              Try Now
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                        Step-by-Step Guide
                      </h4>
                      <ol className="space-y-2">
                        {feature.steps.map((step: string, stepIndex: number) => (
                          <li key={stepIndex} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {stepIndex + 1}
                            </span>
                            <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Quick Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Complete your profile:</strong> Add bio, organization, and contact info</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Be respectful:</strong> Follow community guidelines in all interactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Share quality content:</strong> Post meaningful projects and discussions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Engage actively:</strong> Comment, like, and provide constructive feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Network:</strong> Connect with others in your region</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Stay updated:</strong> Check events and opportunities regularly</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Common Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/profile/edit">
                      <Button variant="outline" className="w-full justify-between">
                        Edit Profile
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/forum/new">
                      <Button variant="outline" className="w-full justify-between">
                        Create Forum Post
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    {user?.role === 'pilot' && (
                      <Link href="/projects/new">
                        <Button variant="outline" className="w-full justify-between">
                          Start New Project
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {user?.role === 'service_provider' && (
                      <Link href="/services/new">
                        <Button variant="outline" className="w-full justify-between">
                          List Your Service
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href="/events">
                      <Button variant="outline" className="w-full justify-between">
                        Browse Events
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/opportunities">
                      <Button variant="outline" className="w-full justify-between">
                        Find Opportunities
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  If you have questions or need assistance, we're here to help!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="text-sm">Ask questions in the <Link href="/forum" className="text-primary font-semibold hover:underline">Community Forum</Link></span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm">Check the <Link href="/resources" className="text-primary font-semibold hover:underline">Resources</Link> section for guides</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm">Contact platform administrators for technical support</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

