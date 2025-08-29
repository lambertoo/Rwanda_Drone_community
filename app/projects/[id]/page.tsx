'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Briefcase,
  Target,
  AlertTriangle,
  Trophy,
  Code,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  ThumbsUp,
  MessageCircle,
  Loader2,
  Edit
} from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  fullDescription?: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  location?: string
  duration?: string
  startDate?: string
  endDate?: string
  funding?: string
  technologies?: any[]
  objectives?: any[]
  challenges?: any[]
  outcomes?: any[]
  methodology?: string
  results?: string
  teamMembers?: any[]
  gallery?: any[]
  resources?: any[]
  thumbnail?: string
  viewsCount: number
  likesCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    fullName: string
    avatar?: string
    role: string
  }
  category?: {
    id: string
    name: string
    color: string
    icon: string
  }
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    fullName: string
    avatar?: string
    role: string
  }
  createdAt: string
  likesCount: number
  replies: Comment[]
  isLiked?: boolean
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLiked, setIsLiked] = useState(false)

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${params.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setProject(data)
          
          // Check if user has liked this project
          if (isAuthenticated) {
            const likeResponse = await fetch(`/api/projects/${params.id}/like/check`, {
              credentials: 'include'
            })
            if (likeResponse.ok) {
              const likeData = await likeResponse.json()
              setIsLiked(likeData.isLiked)
            }
          }
        } else {
          setError(`Failed to fetch project: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setError(`Fetch error: ${error}`)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [params.id, isAuthenticated])

  // Fetch comments
  useEffect(() => {
    if (project && isAuthenticated) {
      const fetchComments = async () => {
        try {
          const response = await fetch(`/api/projects/${params.id}/comments`)
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              // Check like status for each comment and reply
              const commentsWithLikes = await Promise.all(
                data.comments.map(async (comment: Comment) => {
                  // Check main comment like status
                  const commentLikeResponse = await fetch(`/api/comments/${comment.id}/like/check`, {
                    credentials: 'include'
                  })
                  const commentLikeData = commentLikeResponse.ok ? await commentLikeResponse.json() : { isLiked: false }
                  
                  // Check reply like status
                  const repliesWithLikes = await Promise.all(
                    comment.replies.map(async (reply: Comment) => {
                      const replyLikeResponse = await fetch(`/api/comments/${reply.id}/like/check`, {
                        credentials: 'include'
                      })
                      const replyLikeData = replyLikeResponse.ok ? await replyLikeResponse.json() : { isLiked: false }
                      return { ...reply, isLiked: replyLikeData.isLiked }
                    })
                  )
                  
                  return {
                    ...comment,
                    isLiked: commentLikeData.isLiked,
                    replies: repliesWithLikes
                  }
                })
              )
              
              setComments(commentsWithLikes)
            }
          }
        } catch (error) {
          console.error('Error fetching comments:', error)
        }
      }
      fetchComments()
    } else if (project) {
      // If not authenticated, just fetch comments without like status
      const fetchComments = async () => {
        try {
          const response = await fetch(`/api/projects/${params.id}/comments`)
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setComments(data.comments)
            }
          }
        } catch (error) {
          console.error('Error fetching comments:', error)
        }
      }
      fetchComments()
    }
  }, [project, params.id, isAuthenticated])

  // Handle project like
  const handleProjectLike = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        if (project) {
          setProject(prev => prev ? {
            ...prev,
            likesCount: data.isLiked ? prev.likesCount + 1 : prev.likesCount - 1
          } : null)
        }
      }
    } catch (error) {
      console.error('Failed to update like:', error)
    }
  }

  // Refresh comments with like status
  const refreshComments = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && isAuthenticated) {
          // Check like status for each comment and reply
          const commentsWithLikes = await Promise.all(
            data.comments.map(async (comment: Comment) => {
              // Check main comment like status
              const commentLikeResponse = await fetch(`/api/comments/${comment.id}/like/check`, {
                credentials: 'include'
              })
              const commentLikeData = commentLikeResponse.ok ? await commentLikeResponse.json() : { isLiked: false }
              
              // Check reply like status
              const repliesWithLikes = await Promise.all(
                comment.replies.map(async (reply: Comment) => {
                  const replyLikeResponse = await fetch(`/api/comments/${reply.id}/like/check`, {
                    credentials: 'include'
                  })
                  const replyLikeData = replyLikeResponse.ok ? await replyLikeResponse.json() : { isLiked: false }
                  return { ...reply, isLiked: replyLikeData.isLiked }
                })
              )
              
              return {
                ...comment,
                isLiked: commentLikeData.isLiked,
                replies: repliesWithLikes
              }
            })
          )
          
          setComments(commentsWithLikes)
        } else {
          setComments(data.comments)
        }
      }
    } catch (error) {
      console.error('Error refreshing comments:', error)
    }
  }

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (!newComment.trim()) {
      alert("Please enter a comment")
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNewComment("")
          // Refresh comments to get the new comment with proper structure
          await refreshComments()
          alert("Comment posted successfully!")
        } else {
          alert(data.error || "Failed to post comment")
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to post comment")
      }
    } catch (error) {
      console.error('Comment submission error:', error)
      alert("Failed to post comment")
    }
  }

  // Handle reply submission
  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (!replyContent.trim()) {
      alert("Please enter a reply")
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId: parentId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReplyContent("")
          setReplyingTo(null)
          // Refresh comments to get the new reply with proper structure
          await refreshComments()
          alert("Reply posted successfully!")
        } else {
          alert(data.error || "Failed to post reply")
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to post reply")
      }
    } catch (error) {
      console.error('Reply submission error:', error)
      alert("Failed to post reply")
    }
  }

  // Handle comment like
  const handleCommentLike = async (commentId: string, isReply = false) => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (isReply) {
          setComments(prev => prev.map(comment => ({
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? { ...reply, isLiked: data.isLiked, likesCount: data.likesCount }
                : reply
            )
          })))
        } else {
          setComments(prev => prev.map(comment =>
            comment.id === commentId
              ? { ...comment, isLiked: data.isLiked, likesCount: data.likesCount }
              : comment
          ))
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to update like")
      }
    } catch (error) {
      console.error('Comment like error:', error)
      alert("Failed to update like")
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'planning':
        return 'outline'
      case 'on_hold':
        return 'destructive'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/80 text-white border-green-400/50 hover:bg-green-500'
      case 'in_progress':
        return 'bg-blue-500/80 text-white border-blue-400/50 hover:bg-blue-500'
      case 'planning':
        return 'bg-yellow-500/80 text-white border-yellow-400/50 hover:bg-yellow-500'
      case 'on_hold':
        return 'bg-orange-500/80 text-white border-orange-400/50 hover:bg-orange-500'
      case 'cancelled':
        return 'bg-red-500/80 text-white border-red-400/50 hover:bg-red-500'
      default:
        return 'bg-gray-500/80 text-white border-gray-400/50 hover:bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-muted-foreground mt-2">{error || 'Project not found'}</p>
            <Link href="/projects" className="mt-4 inline-block">
              <Button>Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8 relative overflow-hidden rounded-xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gradient-to-br from-green-800 to-blue-900"
            style={{
              backgroundImage: project.thumbnail && project.thumbnail !== "" && project.thumbnail !== "/placeholder.svg"
                ? `url('${project.thumbnail}')`
                : "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
              filter: "brightness(0.3)"
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              {project.category && (
                <Badge variant="secondary" className="text-sm bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {project.category.icon} {project.category.name}
                </Badge>
              )}
              <Badge className={`${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4 text-white">{project.title}</h1>
            <p className="text-xl text-white/90 mb-6 max-w-3xl">
              {project.description}
            </p>

            {/* Project Stats */}
            <div className="flex items-center gap-6 text-sm text-white/80 mb-6">
              {project.startDate && project.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/80" />
                  <span>{project.startDate} - {project.endDate}</span>
                </div>
              )}
              {project.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white/80" />
                  <span>{project.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white/80" />
                <span>
                  {(() => {
                    const projectLead = project.teamMembers?.find((member: any) => member.projectLead);
                    return projectLead ? `Led by ${projectLead.name}` : `Led by ${project.author.fullName}`;
                  })()}
                </span>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-white/80" />
                <span className="font-semibold text-white">{project.viewsCount}</span>
                <span className="text-white/80">views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-white/80" />
                <span className="font-semibold text-white">{project.likesCount}</span>
                <span className="text-white/80">likes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-white/80" />
                <span className="font-semibold text-white">{comments.length}</span>
                <span className="text-white/80">comments</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                className={`${isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white border-white/30`}
                onClick={handleProjectLike}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/20 hover:text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {/* Edit Button - Only show for admin or project author */}
              {isAuthenticated && (user?.role === 'admin' || user?.id === project.author.id) && (
                <Link href={`/projects/${project.id}/edit`}>
                  <Button variant="outline" className="text-white border-white/30 hover:bg-white/20 hover:text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="methodology">Methodology</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p className="text-muted-foreground mb-6">
                      {project.fullDescription || project.description}
                    </p>

                    <div className="space-y-6">
                      {project.objectives && project.objectives.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            Primary Goals
                          </h3>
                          <ul className="space-y-2 ml-6">
                            {project.objectives.map((objective: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="text-green-500">•</span>
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {project.technologies && project.technologies.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Code className="h-5 w-5 text-orange-500" />
                            Technology Stack
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Technologies Used</h4>
                              <ul className="space-y-1 text-sm">
                                {project.technologies.map((tech: string, index: number) => (
                                  <li key={index}>• {tech}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {project.challenges && project.challenges.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Challenges Faced
                          </h3>
                          <ul className="space-y-2 ml-6">
                            {project.challenges.map((challenge: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="text-red-500">•</span>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {project.outcomes && project.outcomes.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Key Outcomes
                          </h3>
                          <ul className="space-y-2 ml-6">
                            {project.outcomes.map((outcome: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="text-yellow-500">•</span>
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methodology" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Methodology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.methodology ? (
                      <div className="prose max-w-none">
                        {project.methodology}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Methodology details not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.results ? (
                      <div className="prose max-w-none">
                        {project.results}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Results not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.teamMembers && project.teamMembers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.teamMembers.map((member: any, index: number) => (
                          <div key={index} className={`flex items-center gap-3 p-3 border rounded-lg ${member.projectLead ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback>{member.name?.charAt(0) || "T"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.name}</p>
                                {member.projectLead && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                    Project Lead
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              {member.organization && (
                                <p className="text-xs text-muted-foreground">{member.organization}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Team information not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.gallery && project.gallery.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.gallery.map((image: any, index: number) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden">
                            <img 
                              src={image.url || image} 
                              alt={image.caption || `Project image ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Gallery images not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Resources</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Download project resources, documents, and materials
                    </p>
                  </CardHeader>
                  <CardContent>
                    {project.resources && project.resources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.resources.map((resource: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0">
                              <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{resource.title || `Resource ${index + 1}`}</p>
                              {resource.description && (
                                <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {resource.fileType || 'File'} • {resource.size ? `${(resource.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(resource.url, '_blank')}
                              className="flex-shrink-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No resources available for this project.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments & Discussion ({comments.length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Share your thoughts, ask questions, or discuss this project with the community.
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Comment Form */}
                  <div className="mb-6 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.fullName || "User"} />
                        <AvatarFallback>{user?.fullName ? user.fullName.split(" ").map((n: string) => n[0]).join("") : "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {!isAuthenticated ? (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground mb-3">Please log in to comment</p>
                            <Link href="/login">
                              <Button size="sm">Login to Comment</Button>
                            </Link>
                          </div>
                        ) : (
                          <>
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              rows={3}
                            />
                            <div className="flex justify-between items-center mt-3">
                              <div className="text-sm text-muted-foreground">
                                Press Ctrl+Enter to submit
                              </div>
                              <Button onClick={handleCommentSubmit} size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Post Comment
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3 p-4 border rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.fullName} />
                            <AvatarFallback>
                              {comment.author.fullName.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">{comment.author.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                              {comment.author.role === 'admin' && (
                                <Badge variant="outline" className="text-xs">Admin</Badge>
                              )}
                            </div>
                            <p className="text-sm mb-2">{comment.content}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <button
                                onClick={() => handleCommentLike(comment.id)}
                                className={`flex items-center gap-1 hover:text-primary ${comment.isLiked ? 'text-primary' : ''}`}
                              >
                                <ThumbsUp className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                                Like ({comment.likesCount})
                              </button>
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <MessageSquare className="h-3 w-3" />
                                Reply
                              </button>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === comment.id && (
                              <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-start gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.fullName || "User"} />
                                    <AvatarFallback>{user?.fullName ? user.fullName.split(" ").map((n: string) => n[0]).join("") : "U"}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <textarea
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder="Write a reply..."
                                      className="w-full p-2 border rounded-lg resize-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                      rows={2}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                      <Button
                                        onClick={() => handleReplySubmit(comment.id)}
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                      >
                                        Reply
                                      </Button>
                                      <Button
                                        onClick={() => setReplyingTo(null)}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies.length > 0 && (
                              <div className="mt-3 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-3 p-3 border rounded-lg ml-8 bg-gray-50">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.fullName} />
                                      <AvatarFallback>
                                        {reply.author.fullName.split(" ").map((n: string) => n[0]).join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-sm">{reply.author.fullName}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm mb-2">{reply.content}</p>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <button
                                          onClick={() => handleCommentLike(reply.id, true)}
                                          className={`flex items-center gap-1 hover:text-primary ${reply.isLiked ? 'text-primary' : ''}`}
                                        >
                                          <ThumbsUp className={`h-3 w-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                          Like ({reply.likesCount})
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No comments yet. Be the first to start the discussion!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Project Resources & Info */}
          <div className="space-y-6">
            {/* Project Resources */}
            {project.resources && project.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.resources.map((resource: any, index: number) => (
                    <div key={`${resource.id || index}-${resource.title}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{resource.title || `Resource ${index + 1}`}</p>
                          <p className="text-xs text-muted-foreground">
                            {resource.description || 'No description available'} • {resource.fileType || 'File'} • {resource.size ? `${(resource.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(resource.url, '_blank')}
                        className="flex-shrink-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.funding && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Funding: {project.funding}</span>
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Duration: {project.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Author: {project.author.fullName}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
