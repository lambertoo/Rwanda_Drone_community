"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Edit,
  Trash2,
  ArrowLeft,
  Heart,
  Share2,
  Download,
  FileText,
  Database,
  BookOpen,
  Smartphone,
  Eye,
  MessageSquare,
  Send,
  Copy
} from "lucide-react"
import Link from "next/link"
import { IfLoggedIn, IfAdmin } from "@/components/auth-guard"
import { AuthUser } from "@prisma/client"

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
  technologies?: string
  objectives?: string
  challenges?: string
  outcomes?: string
  teamMembers?: string
  gallery?: string
  createdAt: string
  viewsCount: number
  likesCount: number
  isFeatured: boolean
  author: {
    id: string
    fullName: string
    username: string
    avatar?: string
    role: string
    organization?: string
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  likesCount: number
  author: {
    id: string
    fullName: string
    avatar?: string
  }
  replies?: Comment[]
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({})
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const initializePage = async () => {
      const { id } = await params
      await fetchProject(id)
      await fetchComments(id)
      
      // Get user from localStorage
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          await checkIfLiked(userData.id, id)
          await checkCommentLikes(userData.id, id)
        } catch (error) {
          console.error("Error parsing user from localStorage:", error)
        }
      }
    }
    
    initializePage()
  }, [params])

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        console.error("Failed to fetch project")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const checkIfLiked = async (userId: string, projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/like/check?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like projects")
      return
    }

    setIsLiking(true)
    try {
      const { id } = await params
      const response = await fetch(`/api/projects/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setProject(prev => prev ? { ...prev, likesCount: data.likesCount } : null)
      }
    } catch (error) {
      console.error("Error liking project:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const checkCommentLikes = async (userId: string, projectId: string) => {
    try {
      const allComments = comments.flatMap(comment => [comment, ...(comment.replies || [])])
      const likePromises = allComments.map(comment =>
        fetch(`/api/comments/${comment.id}/like/check?userId=${userId}`)
          .then(res => res.json())
          .then(data => ({ commentId: comment.id, isLiked: data.isLiked }))
      )
      
      const results = await Promise.all(likePromises)
      const likesMap = results.reduce((acc, { commentId, isLiked }) => {
        acc[commentId] = isLiked
        return acc
      }, {} as Record<string, boolean>)
      
      setCommentLikes(likesMap)
    } catch (error) {
      console.error("Error checking comment likes:", error)
    }
  }

  const handleComment = async () => {
    if (!user) {
      alert("Please log in to comment")
      return
    }

    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const { id } = await params
      const response = await fetch(`/api/projects/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: newComment,
          userId: user.id 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment("")
        // Refresh comments to get updated structure
        await fetchComments(id)
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!user) {
      alert("Please log in to reply")
      return
    }

    if (!replyContent.trim()) return

    setIsSubmittingReply(true)
    try {
      const { id } = await params
      const response = await fetch(`/api/projects/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: replyContent,
          userId: user.id,
          parentId: parentId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReplyContent("")
        setReplyingTo(null)
        // Refresh comments to get updated structure
        await fetchComments(id)
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      alert("Please log in to like comments")
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setCommentLikes(prev => ({ ...prev, [commentId]: data.isLiked }))
        
        // Update the comment's like count in the state
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, likesCount: data.likesCount }
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId 
                  ? { ...reply, likesCount: data.likesCount }
                  : reply
              )
            }
          }
          return comment
        }))
      }
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = project?.title || "Check out this drone project"
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
      } catch (error) {
        console.error("Error copying to clipboard:", error)
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const { id } = await params
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/projects")
      } else {
        console.error("Failed to delete project")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const canEdit = user && (user.id === project?.author.id || user.role === "admin")
  const canDelete = user && (user.id === project?.author.id || user.role === "admin")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    )
  }

  const teamMembers = project.teamMembers ? JSON.parse(project.teamMembers) : []
  const gallery = project.gallery ? JSON.parse(project.gallery) : []

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return "bg-gray-100 text-gray-800"
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "planning": return "bg-yellow-100 text-yellow-800"
      case "on_hold": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusDisplay = (status: string | undefined | null) => {
    if (!status) return "Unknown"
    switch (status) {
      case "in_progress": return "In Progress"
      case "on_hold": return "On Hold"
      case "planning": return "Planning"
      case "completed": return "Completed"
      case "cancelled": return "Cancelled"
      default: return status
    }
  }

  const getCategoryIcon = (category: string | undefined | null) => {
    if (!category) return "🚁"
    switch (category.toLowerCase()) {
      case "agriculture": return "🌾"
      case "surveillance": return "🛡️"
      case "mapping": return "🗺️"
      case "delivery": return "📦"
      case "emergency": return "🚨"
      case "research": return "🔬"
      case "education": return "🎓"
      case "environmental": return "🌍"
      default: return "🚁"
    }
  }

  // Mock project resources for demonstration
  const projectResources = [
    {
      title: "Final Project Report",
      description: "Comprehensive 85-page report detailing methodology, results, and recommendations",
      size: "12.3 MB",
      type: "PDF",
      downloads: 89,
      icon: FileText
    },
    {
      title: "Dataset - Crop Yield Analysis",
      description: "Complete dataset with yield measurements, weather data, and drone imagery analysis",
      size: "245 MB",
      type: "CSV/ZIP",
      downloads: 34,
      icon: Database
    },
    {
      title: "Drone Flight Logs",
      description: "Detailed flight logs and metadata for all 156 survey missions",
      size: "8.7 MB",
      type: "JSON",
      downloads: 23,
      icon: BookOpen
    },
    {
      title: "Training Materials",
      description: "Farmer training guides and presentation materials in Kinyarwanda and English",
      size: "45 MB",
      type: "PDF/PPT",
      downloads: 67,
      icon: BookOpen
    },
    {
      title: "Software Tools",
      description: "Custom analysis tools and mobile applications developed for the project",
      size: "156 MB",
      type: "APK/EXE",
      downloads: 45,
      icon: Smartphone
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
            
            <IfLoggedIn fallback={null}>
              {canEdit && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
              {canDelete && (
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </IfLoggedIn>
          </div>

          {/* Project Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                <Badge variant="outline" className="text-sm">{project.category}</Badge>
                <Badge className={`text-sm ${getStatusColor(project.status)}`}>
                  {getStatusDisplay(project.status)}
                </Badge>
                {project.isFeatured && (
                  <Badge variant="secondary" className="text-sm">Featured</Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-4xl">{project.description}</p>

              {/* Project Meta */}
              <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground mb-6">
                {project.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
                      {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                    </span>
                  </div>
                )}
                {project.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span>{project.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Led by {project.author.fullName}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{project.viewsCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{project.likesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="methodology">Methodology</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {project.fullDescription && (
                  <div className="prose prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: project.fullDescription }} />
                  </div>
                )}
                
                {!project.fullDescription && (
                  <div className="prose prose-lg max-w-none">
                    <h2>Project Overview</h2>
                    <p>The {project.title} project represents a groundbreaking initiative to revolutionize practices in Rwanda through advanced drone technology and precision techniques.</p>
                    
                    <h3>Objectives</h3>
                    <h4>Primary Goals</h4>
                    <ul>
                      <li>Implement comprehensive monitoring system using drone technology</li>
                      <li>Provide real-time data analytics to improve decision-making</li>
                      <li>Increase efficiency by 25% through precision techniques</li>
                      <li>Train local operators in modern techniques</li>
                      <li>Establish sustainable monitoring protocols</li>
                    </ul>
                    
                    <h4>Secondary Goals</h4>
                    <ul>
                      <li>Create employment opportunities for local drone operators</li>
                      <li>Develop replicable model for other regions</li>
                      <li>Build partnerships with local cooperatives</li>
                      <li>Promote climate-smart practices</li>
                    </ul>
                    
                    <h3>Project Scope</h3>
                    <p>The project covers extensive areas and directly benefits numerous stakeholders. Our comprehensive approach includes:</p>
                    <ul>
                      <li><strong>Monitoring</strong>: Regular aerial surveys to assess conditions and identify issues</li>
                      <li><strong>Analysis</strong>: Multispectral imaging to analyze composition and levels</li>
                      <li><strong>Prediction</strong>: AI-powered analytics to forecast outcomes and optimize planning</li>
                      <li><strong>Detection</strong>: Early identification of problems and outbreaks</li>
                      <li><strong>Optimization</strong>: Usage analysis and scheduling recommendations</li>
                    </ul>
                    
                    <h3>Technology Stack</h3>
                    <h4>Hardware</h4>
                    <ul>
                      <li>12x DJI Matrice 300 RTK drones</li>
                      <li>Multispectral cameras (MicaSense RedEdge-MX)</li>
                      <li>Thermal imaging sensors</li>
                      <li>Ground control stations</li>
                      <li>Weather monitoring equipment</li>
                    </ul>
                    
                    <h4>Software</h4>
                    <ul>
                      <li>Custom data processing pipeline</li>
                      <li>Machine learning models for analysis</li>
                      <li>Mobile applications for users</li>
                      <li>Web-based dashboard for administrators</li>
                      <li>Integration with existing databases</li>
                    </ul>
                    
                    <h3>Impact Metrics</h3>
                    <p>The project has achieved significant measurable outcomes:</p>
                    <ul>
                      <li><strong>Efficiency Increase</strong>: Average 28% improvement in outcomes</li>
                      <li><strong>Resource Efficiency</strong>: 35% reduction in resource usage through optimization</li>
                      <li><strong>Early Detection</strong>: 90% success rate in early problem identification</li>
                      <li><strong>User Adoption</strong>: 85% of participating users continue using the system</li>
                      <li><strong>Cost Reduction</strong>: 20% decrease in input costs through precision application</li>
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="methodology" className="space-y-6 mt-6">
                <div className="prose prose-lg max-w-none">
                  <h2>Methodology</h2>
                  <p>Our comprehensive methodology combines cutting-edge drone technology with traditional expertise to deliver exceptional results.</p>
                  
                  <h3>Data Collection Process</h3>
                  <p>We employ a systematic approach to data collection using advanced drone technology:</p>
                  <ul>
                    <li><strong>Aerial Surveys</strong>: Regular drone flights capture high-resolution imagery</li>
                    <li><strong>Multispectral Imaging</strong>: Specialized cameras capture data across multiple wavelengths</li>
                    <li><strong>Ground Truthing</strong>: Field measurements validate aerial data</li>
                    <li><strong>Weather Integration</strong>: Real-time weather data enhances analysis accuracy</li>
                  </ul>
                  
                  <h3>Analysis Framework</h3>
                  <p>Our analysis framework processes collected data through multiple stages:</p>
                  <ol>
                    <li><strong>Preprocessing</strong>: Raw data is cleaned and calibrated</li>
                    <li><strong>Feature Extraction</strong>: Key indicators are identified and measured</li>
                    <li><strong>Machine Learning</strong>: AI models predict outcomes and identify patterns</li>
                    <li><strong>Validation</strong>: Results are cross-validated with ground data</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-6 mt-6">
                <div className="prose prose-lg max-w-none">
                  <h2>Results & Impact</h2>
                  <p>The project has delivered exceptional results that exceed initial expectations and demonstrate the transformative potential of drone technology.</p>
                  
                  <h3>Quantitative Results</h3>
                  <ul>
                    <li><strong>28% Improvement</strong> in overall efficiency</li>
                    <li><strong>35% Reduction</strong> in resource consumption</li>
                    <li><strong>90% Accuracy</strong> in early detection systems</li>
                    <li><strong>85% Adoption Rate</strong> among target users</li>
                    <li><strong>20% Cost Reduction</strong> in operational expenses</li>
                  </ul>
                  
                  <h3>Qualitative Impact</h3>
                  <p>Beyond the numbers, the project has created lasting positive change:</p>
                  <ul>
                    <li>Enhanced local capacity in drone technology</li>
                    <li>Improved decision-making processes</li>
                    <li>Strengthened community partnerships</li>
                    <li>Created new employment opportunities</li>
                    <li>Established sustainable monitoring protocols</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Project Team</h2>
                    <p className="text-muted-foreground mb-6">Meet the dedicated team behind this innovative project.</p>
                  </div>

                  {/* Project Lead */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Project Lead
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={project.author.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-lg">
                            {project.author.fullName.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{project.author.fullName}</h4>
                          <p className="text-sm text-blue-600 font-medium">{project.author.role || "Project Lead"}</p>
                          {project.author.organization && (
                            <p className="text-sm text-muted-foreground">{project.author.organization}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            Leading the project with expertise in drone technology and project management.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Members Grid */}
                  {teamMembers.length > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Team Members ({teamMembers.length})</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers.map((member: any, index: number) => (
                          <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="text-center">
                                <Avatar className="h-20 w-20 mx-auto mb-4">
                                  <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                                  <AvatarFallback className="text-xl">
                                    {member.name ? member.name.split(" ").map((n: string) => n[0]).join("") : "TM"}
                                  </AvatarFallback>
                                </Avatar>
                                <h4 className="font-semibold text-lg mb-1">{member.name || `Team Member ${index + 1}`}</h4>
                                <p className="text-sm text-blue-600 font-medium mb-2">{member.role || "Team Member"}</p>
                                {member.organization && (
                                  <p className="text-sm text-muted-foreground mb-3">{member.organization}</p>
                                )}
                                {member.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-muted-foreground">No additional team members listed</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6 mt-6">
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((image: any, index: number) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={image.url || image} 
                          alt={image.caption || `Project image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground">No gallery images available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Comment */}
                  {user && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Share your thoughts about this project..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleComment}
                          disabled={isSubmittingComment || !newComment.trim()}
                        >
                          {isSubmittingComment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Please log in to comment on this project.</p>
                      <Button asChild className="mt-2">
                        <Link href="/login">Log In</Link>
                      </Button>
                    </div>
                  )}

                  <Separator />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="space-y-3">
                          {/* Main Comment */}
                          <div className="flex gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={comment.author.avatar || "/placeholder-user.jpg"} />
                              <AvatarFallback>
                                {comment.author.fullName.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{comment.author.fullName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mb-2">{comment.content}</p>
                              
                              {/* Comment Actions */}
                              <div className="flex items-center gap-4 text-xs">
                                <button
                                  onClick={() => handleCommentLike(comment.id)}
                                  className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                                    commentLikes[comment.id] ? 'text-blue-600' : 'text-muted-foreground'
                                  }`}
                                >
                                  <Heart className={`h-3 w-3 ${commentLikes[comment.id] ? 'fill-current' : ''}`} />
                                  <span>{comment.likesCount}</span>
                                </button>
                                <button
                                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                  className="flex items-center gap-1 text-muted-foreground hover:text-blue-600 transition-colors"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  <span>Reply</span>
                                </button>
                              </div>

                              {/* Reply Form */}
                              {replyingTo === comment.id && (
                                <div className="mt-3 space-y-2">
                                  <Textarea
                                    placeholder="Write a reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="min-h-[80px] text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleReply(comment.id)}
                                      disabled={isSubmittingReply || !replyContent.trim()}
                                    >
                                      {isSubmittingReply ? (
                                        <>
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                          Posting...
                                        </>
                                      ) : (
                                        <>
                                          <Send className="h-3 w-3 mr-1" />
                                          Reply
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setReplyingTo(null)
                                        setReplyContent("")
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-14 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.author.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback className="text-xs">
                                      {reply.author.fullName.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-xs">{reply.author.fullName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm mb-2">{reply.content}</p>
                                    
                                    {/* Reply Actions */}
                                    <div className="flex items-center gap-4 text-xs">
                                      <button
                                        onClick={() => handleCommentLike(reply.id)}
                                        className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                                          commentLikes[reply.id] ? 'text-blue-600' : 'text-muted-foreground'
                                        }`}
                                      >
                                        <Heart className={`h-3 w-3 ${commentLikes[reply.id] ? 'fill-current' : ''}`} />
                                        <span>{reply.likesCount}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Lead */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={project.author.avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-lg">
                      {project.author.fullName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{project.author.fullName}</h4>
                    <p className="text-sm text-blue-600 font-medium">{project.author.role || "Project Lead"}</p>
                    {project.author.organization && (
                      <p className="text-sm text-muted-foreground">{project.author.organization}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.duration && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="text-sm font-medium">{project.duration}</span>
                  </div>
                )}
                
                {project.funding && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Funding:</span>
                    <span className="text-sm font-medium">{project.funding}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusDisplay(project.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Project Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectResources.map((resource, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <resource.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{resource.size} • {resource.type}</span>
                          <span>{resource.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
