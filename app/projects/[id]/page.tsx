"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Download,
  ExternalLink,
  Heart,
  Share2,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { deleteProjectAction } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Project {
  id: string
  title: string
  description: string
  fullDescription?: string
  category: string
  status: string
  location?: string
  duration?: string
  startDate?: string
  endDate?: string
  funding?: string
  technologies: string
  objectives: string
  challenges: string
  outcomes: string
  teamMembers: string
  gallery: string
  viewsCount: number
  likesCount: number
  repliesCount: number
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  authorId: string
  author: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
  }
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) {
          router.push('/404')
          return
        }
        const data = await response.json()
        setProject(data.project)
      } catch (error) {
        console.error('Error fetching project:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Project not found</div>
  }

  // Parse JSON fields
  const technologies = project.technologies ? JSON.parse(project.technologies) : []
  const objectives = project.objectives ? JSON.parse(project.objectives) : []
  const challenges = project.challenges ? JSON.parse(project.challenges) : []
  const outcomes = project.outcomes ? JSON.parse(project.outcomes) : []
  const teamMembers = project.teamMembers ? JSON.parse(project.teamMembers) : []
  const gallery = project.gallery ? JSON.parse(project.gallery) : []

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "on_hold":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return
    }

    try {
      await deleteProjectAction(project.id)
      router.push('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <span>/</span>
          <span>Project Details</span>
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{project.category}</Badge>
                <Badge variant="secondary" className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{project.description}</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>
                    {project.startDate && formatDate(project.startDate)}
                    {project.endDate && ` - ${formatDate(project.endDate)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{project.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Led by {project.author.fullName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {project.viewsCount}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {project.likesCount}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  0
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Heart className="h-4 w-4" />
                  Like
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Link href={`/projects/${project.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  onClick={handleDelete}
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 bg-transparent text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Project Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{project.fullDescription || project.description}</div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{project.duration || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Funding:</span>
                  <span className="font-medium">{project.funding || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary" className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={project.author.avatar || "/placeholder.svg"} alt={project.author.fullName} />
                    <AvatarFallback>
                      {project.author.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{project.author.fullName}</h4>
                    <p className="text-sm text-blue-600 mb-1">Project Lead</p>
                    <p className="text-sm text-muted-foreground mb-2">{project.author.organization || 'Not specified'}</p>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <ExternalLink className="h-3 w-3" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methodology">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <p>Methodology details will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <p>Results and outcomes will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.length > 0 ? (
              gallery.map((item: any, index: number) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100">
                    <img src={item.url || "/placeholder.svg"} alt={item.caption || 'Gallery item'} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{item.caption || 'No caption'}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>No gallery items available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {teamMembers.length > 0 ? (
              teamMembers.map((member: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            ? member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                            : "TM"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{member.name || 'Unknown'}</h4>
                        <p className="text-blue-600 mb-1">{member.role || 'Team Member'}</p>
                        <p className="text-sm text-muted-foreground mb-2">{member.organization || 'Not specified'}</p>
                        <p className="text-sm font-medium mb-2">{member.expertise || 'Not specified'}</p>
                        <p className="text-sm leading-relaxed">{member.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>No team members available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Project Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Project Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No project resources available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
