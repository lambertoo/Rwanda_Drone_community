'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share2, ArrowLeft, ThumbsUp, MessageSquare, Loader } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatar: string
  bio: string
  location: string
  website: string | null
  phone: string | null
  joinedAt: string
  reputation: number
  isVerified: boolean
  isActive: boolean
  role: string
  lastActive: string
  postsCount: number
  commentsCount: number
  projectsCount: number
  eventsCount: number
  servicesCount: number
  opportunitiesCount: number
  pilotLicense: string | null
  organization: string
  experience: string
  specializations: string[]
  certifications: string[]
}

interface Project {
  id: string
  title: string
  description: string
  fullDescription: string | null
  categoryId: string
  status: string
  authorId: string
  location: string
  duration: string
  startDate: string
  endDate: string
  funding: string
  technologies: string[]
  objectives: string[]
  challenges: string[]
  outcomes: string[]
  teamMembers: TeamMember[]
  gallery: string
  resources: string | null
  createdAt: string
  updatedAt: string
  viewsCount: number
  likesCount: number
  isFeatured: boolean
  author: User
  category: Category
  methodology: string | null
  results: string | null
}

interface Category {
    id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
  createdAt: string
  updatedAt: string
}

interface TeamMember {
  id: string
  name: string
    role: string
  organization: string
  email: string
  expertise: string
  bio: string
}

interface Comment {
  id: string
  content: string
  authorId: string
  projectId: string
  createdAt: string
  updatedAt: string
  likesCount: number
  author: User
  replies?: Comment[]
}

interface GalleryItem {
    id: string
  url: string
  caption?: string
  type: 'image' | 'video'
}

interface ProjectResource {
  id: string
  title: string
  description: string
  type: 'file' | 'link' | 'video'
  url: string
  size?: string
  fileType?: string
  downloads?: number
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set())
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [parsedGallery, setParsedGallery] = useState<GalleryItem[]>([])
  const [parsedResources, setParsedResources] = useState<ProjectResource[]>([])

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('overview')

  // Helper function to get resource icon
  const getResourceIconByType = (type: string) => {
    switch (type) {
      case 'file':
        return "💾" // Download
      case 'link':
        return "🔗" // ExternalLink
      case 'video':
        return "🎥" // Video
      default:
        return "📄" // FileText
    }
  }

  const getCategoryIcon = (category: any) => {
    // If category is a string, map by the string value
    if (typeof category === 'string') {
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
    
    // If category is an object with name property, map by name
    if (typeof category === 'object' && category.name) {
      switch (category.name.toLowerCase()) {
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
    
    return "🚁"
  }

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get project ID from URL path
        const pathSegments = window.location.pathname.split('/')
        const id = pathSegments[pathSegments.length - 1]
        
        // First, just load the project data
        await fetchProject(id)
        
        // Then load comments and user data in the background
        fetchComments(id)
        
        // Get user from localStorage (only on client side)
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser)
              setUser(userData)
              // Check likes in the background
              checkIfLiked(userData.id, id)
              checkCommentLikes(userData.id, id)
            } catch (error) {
              console.error("Error parsing user from localStorage:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error initializing page:", error)
        setLoading(false)
      }
    }
    
    initializePage()
  }, [])

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
        setLikesCount(data.likesCount || 0)
        
        // Parse gallery and resources data
        try {
          if (data.gallery) {
            const galleryData = typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery
            setParsedGallery(Array.isArray(galleryData) ? galleryData : [])
          }
          if (data.resources) {
            const resourcesData = typeof data.resources === 'string' ? JSON.parse(data.resources) : data.resources
            setParsedResources(Array.isArray(resourcesData) ? resourcesData : [])
          } else {
            setParsedResources([])
          }
        } catch (parseError) {
          console.error("Error parsing gallery or resources:", parseError)
          setParsedGallery([])
          setParsedResources([])
        }
      } else {
        console.error("Failed to fetch project")
        setProject(null)
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      setProject(null)
    } finally {
      // Always set loading to false after fetchProject completes
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
        setLiked(data.liked)
      }
    } catch (error) {
      console.error("Error checking if liked:", error)
    }
  }

  const checkCommentLikes = async (userId: string, projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`)
      if (response.ok) {
        const data = await response.json()
        const likedComments = new Set<string>()
        
        // Check which comments the user has liked
        if (data.comments && data.comments.length > 0) {
          // Get all comments including nested replies at all levels
          const getAllReplies = (replies: Comment[]): Comment[] => {
            let allReplies: Comment[] = []
            replies.forEach(reply => {
              allReplies.push(reply)
              if (reply.replies && reply.replies.length > 0) {
                allReplies.push(...getAllReplies(reply.replies))
              }
            })
            return allReplies
          }
          
          const allComments = data.comments.flatMap((comment: Comment) => [
            comment, 
            ...(comment.replies || []),
            ...getAllReplies(comment.replies || [])
          ])
          
          const likePromises = allComments.map(comment =>
            fetch(`/api/projects/${projectId}/comments/${comment.id}/like/check?userId=${userId}`)
              .then(res => res.json())
              .then(data => ({ commentId: comment.id, isLiked: data.isLiked }))
          )
          
          const results = await Promise.all(likePromises)
          results.forEach(({ commentId, isLiked }) => {
            if (isLiked) {
              likedComments.add(commentId)
            }
          })
        }
        
        setCommentLikes(likedComments)
      }
    } catch (error) {
      console.error("Error checking comment likes:", error)
    }
  }



  const handleLike = async () => {
    if (!user || !project) return

    try {
      const response = await fetch(`/api/projects/${project.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setLiked(!liked)
        setLikesCount(prev => liked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !project || !newComment.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: newComment.trim(),
          userId: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment("")
        await fetchComments(project.id)
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleComment = async () => {
    if (!user || !project || !newComment.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: newComment.trim(),
          userId: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment("")
        await fetchComments(project.id)
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReply = async (parentId: string, parentCommentId?: string) => {
    if (!user || !project || !replyContent.trim()) return

    setIsSubmittingReply(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: replyContent.trim(),
          userId: user.id,
          parentId: parentId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update comments state to add the new reply
        setComments(prev => prev.map(comment => {
          if (comment.id === parentCommentId || comment.id === parentId) {
            // If this is the top-level comment, add reply to its replies array
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data.comment]
              }
            }
            // If this is the comment being replied to, add reply to its replies array
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data.comment]
              }
            }
          }
          // Check if this comment has nested replies that need updating
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === parentId) {
                  return {
                    ...reply,
                    replies: [...(reply.replies || []), data.comment]
                  }
                }
                return reply
              })
            }
          }
          return comment
        }))
        
        setReplyContent("")
        setReplyingTo(null)
        await fetchComments(project.id)
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user || !project) return

    try {
      const response = await fetch(`/api/projects/${project.id}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the comment like status
        setCommentLikes(prev => {
          const newSet = new Set(prev)
          if (data.isLiked) {
            newSet.add(commentId)
          } else {
            newSet.delete(commentId)
          }
          return newSet
        })
        
        // Update the comment likes count - handle all nesting levels
        const updateCommentLikes = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, likesCount: data.likesCount }
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateCommentLikes(comment.replies)
              }
            }
            return comment
          })
        }
        
        setComments(prev => updateCommentLikes(prev))
      }
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/projects"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
                <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Back</span>
              </Link>

          {/* Hero Section with Thumbnail */}
          <div className="relative">
            <div className="aspect-[2/1] rounded-lg overflow-hidden">
              <img 
                src={parsedGallery && parsedGallery.length > 0 ? parsedGallery[0].url : "/placeholder.svg?height=400&width=800&text=" + encodeURIComponent(project.title)} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
          </div>
            <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-transparent hover:bg-primary/80 mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {project.category?.name || 'Project'}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{project.title}</h1>
              <p className="text-base sm:text-lg opacity-90 line-clamp-2">{project.description}</p>
            </div>
              </div>

          {/* Project Stats Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{project.viewsCount}</span>
                  <span className="text-sm text-gray-600">views</span>
                  </div>
                  <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{project.likesCount}</span>
                  <span className="text-sm text-gray-600">likes</span>
                  </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{comments.length}</span>
                  <span className="text-sm text-gray-600">comments</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Like
              </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Project Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="h-auto sm:h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-4 gap-1">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Overview</TabsTrigger>
                  <TabsTrigger value="methodology" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Methodology</TabsTrigger>
                  <TabsTrigger value="results" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Results</TabsTrigger>
                  <TabsTrigger value="gallery" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Gallery</TabsTrigger>
              </TabsList>

                <TabsContent value="overview" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 sm:space-y-6">
                  {/* Project Overview */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl"># Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-sm sm:text-base mb-6">{project.fullDescription || project.description}</p>
                        
                        {/* Objectives Section */}
                        {project.objectives && project.objectives.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">## Objectives</h3>
                            <h4 className="text-md font-semibold mb-2">### Primary Goals</h4>
                            <ul className="space-y-2 mb-4">
                              {project.objectives.slice(0, Math.ceil(project.objectives.length / 2)).map((objective, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  <span className="text-sm">{objective}</span>
                                </li>
                              ))}
                    </ul>
                            {project.objectives.length > Math.ceil(project.objectives.length / 2) && (
                              <>
                                <h4 className="text-md font-semibold mb-2">### Secondary Goals</h4>
                                <ul className="space-y-2">
                                  {project.objectives.slice(Math.ceil(project.objectives.length / 2)).map((objective, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                      <span className="text-sm">{objective}</span>
                                    </li>
                                  ))}
                    </ul>
                              </>
                            )}
                  </div>
                )}

                        {/* Project Scope */}
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3">## Project Scope</h3>
                          <p className="text-sm sm:text-base mb-3">The project covers comprehensive areas including:</p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <span className="text-sm"><strong>Crop Health Monitoring:</strong> Regular aerial surveys to assess plant health, identify diseases, and monitor growth patterns</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <span className="text-sm"><strong>Soil Analysis:</strong> Multispectral imaging to analyze soil composition and moisture levels</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <span className="text-sm"><strong>Yield Prediction:</strong> AI-powered analytics to forecast harvest yields and optimize planning</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <span className="text-sm"><strong>Pest Detection:</strong> Early identification of pest infestations and disease outbreaks</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <span className="text-sm"><strong>Irrigation Optimization:</strong> Water usage analysis and irrigation scheduling recommendations</span>
                            </li>
                  </ul>
                </div>

                        {/* Technology Stack */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">## Technology Stack</h3>
                            <h4 className="text-md font-semibold mb-2">### Hardware</h4>
                            <ul className="space-y-2 mb-4">
                              {project.technologies.slice(0, Math.ceil(project.technologies.length / 2)).map((tech, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                                  <span className="text-sm">{tech}</span>
                                </li>
                              ))}
                  </ul>
                            {project.technologies.length > Math.ceil(project.technologies.length / 2) && (
                              <>
                                <h4 className="text-md font-semibold mb-2">### Software</h4>
                                <ul className="space-y-2">
                                  {project.technologies.slice(Math.ceil(project.technologies.length / 2)).map((tech, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                                      <span className="text-sm">{tech}</span>
                                    </li>
                                  ))}
                  </ul>
                              </>
                            )}
                </div>
                        )}

                        {/* Impact Metrics */}
                        {project.outcomes && project.outcomes.length > 0 && (
                  <div>
                            <h3 className="text-lg font-semibold mb-3">## Impact Metrics</h3>
                            <p className="text-sm sm:text-base mb-3">The project has achieved significant measurable outcomes:</p>
                            <ul className="space-y-2">
                              {project.outcomes.map((outcome, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                  <span className="text-sm">{outcome}</span>
                                </li>
                              ))}
                            </ul>
                  </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="methodology" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl">Project Methodology</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {project.methodology ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="whitespace-pre-wrap text-sm sm:text-base">{project.methodology}</div>
                      </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-sm sm:text-base">No methodology information available for this project.</p>
                          <p className="text-xs text-muted-foreground mt-2">Project methodology details will be displayed here when available.</p>
                              </div>
                      )}
                            </CardContent>
                          </Card>
                </TabsContent>

                <TabsContent value="results" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl">Project Results</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {project.results ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="whitespace-pre-wrap text-sm sm:text-base">{project.results}</div>
                    </div>
                  ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-sm sm:text-base">No results information available for this project.</p>
                          <p className="text-xs text-muted-foreground mt-2">Project results and outcomes will be displayed here when available.</p>
                        </div>
                      )}
                      </CardContent>
                    </Card>
              </TabsContent>

                <TabsContent value="gallery" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl">Project Gallery</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {parsedGallery.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {parsedGallery.map((item, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                              <img
                                src={item.url}
                                alt={item.caption || `Gallery image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                        <p className="text-muted-foreground text-sm sm:text-base">No gallery images available.</p>
                      )}
                    </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-semibold text-sm">{project.duration || 'Not specified'}</span>
                      </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Funding:</span>
                    <span className="font-semibold text-sm">{project.funding || 'Not specified'}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {project.status}
                    </Badge>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="font-semibold text-sm">{project.location || 'Not specified'}</span>
                      </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Start Date:</span>
                    <span className="font-semibold text-sm">{project.startDate || 'Not specified'}</span>
                              </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">End Date:</span>
                    <span className="font-semibold text-sm">{project.endDate || 'Not specified'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Project Lead Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Lead</CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={project.author.avatar} />
                      <AvatarFallback>{project.author.fullName?.charAt(0) || project.author.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                    <div>
                      <h4 className="font-semibold text-sm">{project.author.fullName || project.author.username}</h4>
                      <p className="text-xs text-gray-600">{project.author.organization}</p>
                      <p className="text-xs text-gray-500">{project.author.experience}</p>
                  </div>
                </div>
                  <div className="flex flex-wrap gap-2">
                    {project.author.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                    ))}
                </div>
              </CardContent>
            </Card>

              {/* Teams Card */}
            <Card>
              <CardHeader>
                  <CardTitle className="text-lg">Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {/* Project Author */}
                  <div className="border-b pb-4">
                    <h4 className="font-semibold text-sm mb-3 text-gray-700">Project Author</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={project.author.avatar} />
                        <AvatarFallback>{project.author.fullName?.charAt(0) || project.author.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h5 className="font-medium text-sm">{project.author.fullName || project.author.username}</h5>
                        <p className="text-xs text-gray-600">{project.author.organization}</p>
                        <p className="text-xs text-gray-500">{project.author.experience}</p>
                  </div>
                  </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.author.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-gray-700">Team Members ({project.teamMembers.length})</h4>
                    <div className="space-y-3">
                      {project.teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 border rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm">{member.name}</h5>
                            <p className="text-xs text-gray-600">{member.role}</p>
                            <p className="text-xs text-gray-500">{member.organization}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </CardContent>
            </Card>

              {/* Resources Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Resources</CardTitle>
                  <p className="text-sm text-muted-foreground">Documents, presentations, and files related to this project</p>
              </CardHeader>
                <CardContent>
                  {parsedResources && parsedResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {parsedResources.map((resource, index) => {
                        const icon = getResourceIconByType(resource.type)
                        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(resource.type.toLowerCase())
                        
                    return (
                          <div key={index} className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                            {/* Resource Preview */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                                <span className="text-2xl">{icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">
                                  {resource.title}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                  {resource.description || 'No description available'}
                                </p>
                            </div>
                          </div>
                            
                            {/* File Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {resource.type.toUpperCase()}
                                {resource.size && (
                                  <span className="text-gray-400">• {resource.size}</span>
                                )}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {resource.downloads || 0} downloads
                              </span>
                        </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                                className="flex-1 text-xs"
                          onClick={() => {
                                  if (isImage) {
                                    // For images, open in new tab
                              window.open(resource.url, '_blank')
                                  } else {
                                    // For other files, trigger download
                                    const link = document.createElement('a')
                                    link.href = resource.url
                                    link.download = resource.title || 'download'
                                    link.target = '_blank'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                  }
                                }}
                              >
                                {isImage ? 'View' : 'Download'}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => {
                                  // Copy link to clipboard
                                  navigator.clipboard.writeText(resource.url)
                                  // You could add a toast notification here
                                }}
                              >
                                Copy Link
                              </Button>
                            </div>
                            
                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📁</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">No resources available</p>
                      <p className="text-xs text-muted-foreground">Project resources will appear here when added</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Project Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Navigate to edit page
                      router.push(`/projects/${project?.id}/edit`)
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Project
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Handle share action
                      console.log('Share project')
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Project
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Handle delete action
                      if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                        console.log('Delete project')
                      }
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Project
                  </Button>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment Form */}
              {user && (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Share your thoughts, ask questions, or provide feedback..." 
                    rows={4} 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Be respectful and constructive in your responses</div>
                    <Button 
                      onClick={handleComment}
                      disabled={submittingComment || !newComment.trim()}
                    >
                      {submittingComment ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.author?.avatar || "/placeholder.svg"} alt={comment.author?.fullName} />
                        <AvatarFallback>
                          {comment.author?.fullName
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{comment.author?.fullName || "Unknown User"}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="prose prose-sm max-w-none mb-4">
                          <p className="whitespace-pre-wrap">{comment.content}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Button 
                            variant={commentLikes[comment.id] ? "default" : "ghost"} 
                            size="sm" 
                            className="flex items-center gap-2 h-8 px-2"
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            <ThumbsUp className={`h-3 w-3 ${commentLikes[comment.id] ? "fill-current" : ""}`} />
                            {comment.likesCount || 0}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            Reply
                          </Button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Textarea
                              placeholder="Write your reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={3}
                              className="mb-3"
                            />
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm"
                                onClick={() => handleReply(comment.id)}
                                disabled={isSubmittingReply || !replyContent.trim()}
                              >
                                {isSubmittingReply ? (
                                  <>
                                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                                    Posting...
                                  </>
                                ) : (
                                  'Post Reply'
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
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

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                            {comment.replies.map((nestedReply) => (
                              <div key={nestedReply.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={nestedReply.author?.avatar || "/placeholder.svg"}
                                    alt={nestedReply.author?.fullName}
                                  />
                                  <AvatarFallback>
                                    {nestedReply.author?.fullName
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{nestedReply.author?.fullName || "Unknown User"}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(nestedReply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm mb-2">{nestedReply.content}</p>
                                  <div className="flex items-center gap-3">
                                    <Button 
                                      variant={commentLikes[nestedReply.id] ? "default" : "ghost"} 
                                      size="sm" 
                                      className="flex items-center gap-1 h-6 px-2 text-xs"
                                      onClick={() => handleCommentLike(nestedReply.id)}
                                    >
                                      <ThumbsUp className={`h-3 w-3 ${commentLikes[nestedReply.id] ? "fill-current" : ""}`} />
                                      {nestedReply.likesCount || 0}
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 px-2 text-xs"
                                      onClick={() => setReplyingTo(nestedReply.id)}
                                    >
                                      Reply
                                    </Button>
                                  </div>

                                  {/* Reply Form for Nested Reply */}
                                  {replyingTo === nestedReply.id && (
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                      <Textarea
                                        placeholder="Write your reply..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        rows={3}
                                        className="mb-3"
                                      />
                                      <div className="flex items-center gap-2">
                                        <Button 
                                          size="sm"
                                          onClick={() => handleReply(nestedReply.id, comment.id)}
                                          disabled={isSubmittingReply || !replyContent.trim()}
                                        >
                                          {isSubmittingReply ? (
                                            <>
                                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                                              Posting...
                                            </>
                                          ) : (
                                            'Post Reply'
                                          )}
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
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

                                  {/* Deep Nested Replies (replies to replies) */}
                                  {nestedReply.replies && nestedReply.replies.length > 0 && (
                                    <div className="mt-4 pl-4 border-l-2 border-gray-300 dark:border-gray-600 space-y-3">
                                      {nestedReply.replies.map((deepReply) => (
                                        <div key={deepReply.id} className="flex items-start gap-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage
                                              src={deepReply.author?.avatar || "/placeholder.svg"}
                                              alt={deepReply.author?.fullName}
                                            />
                                            <AvatarFallback>
                                              {deepReply.author?.fullName
                                                ?.split(" ")
                                                .map((n: string) => n[0])
                                                .join("") || "U"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-xs">{deepReply.author?.fullName || "Unknown User"}</span>
                                              <span className="text-xs text-muted-foreground">•</span>
                                              <span className="text-xs text-muted-foreground">
                                                {new Date(deepReply.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <p className="text-xs mb-2">{deepReply.content}</p>
                                            <div className="flex items-center gap-2">
                                              <Button 
                                                variant={commentLikes[deepReply.id] ? "default" : "ghost"} 
                                                size="sm" 
                                                className="flex items-center gap-1 h-5 px-2 text-xs"
                                                onClick={() => handleCommentLike(deepReply.id)}
                                              >
                                                <ThumbsUp className={`h-3 w-3 ${commentLikes[deepReply.id] ? "fill-current" : ""}`} />
                                                {deepReply.likesCount || 0}
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-5 px-2 text-xs"
                                                onClick={() => setReplyingTo(deepReply.id)}
                                              >
                                                Reply
                                              </Button>
                                            </div>

                                            {/* Reply Form for Deep Nested Reply */}
                                            {replyingTo === deepReply.id && (
                                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Textarea
                                                  placeholder="Write your reply..."
                                                  value={replyContent}
                                                  onChange={(e) => setReplyContent(e.target.value)}
                                                  rows={2}
                                                  className="mb-2 text-xs"
                                                />
                                                <div className="flex items-center gap-2">
                                                  <Button 
                                                    size="sm"
                                                    onClick={() => handleReply(deepReply.id, comment.id)}
                                                    disabled={isSubmittingReply || !replyContent.trim()}
                                                    className="h-6 px-2 text-xs"
                                                  >
                                                    {isSubmittingReply ? (
                                                      <>
                                                        <Loader className="h-2 w-2 mr-1 animate-spin" />
                                                        Posting...
                                                      </>
                                                    ) : (
                                                      'Post Reply'
                                                    )}
                                                  </Button>
                                                  <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => {
                                                      setReplyingTo(null)
                                                      setReplyContent("")
                                                    }}
                                                    className="h-6 px-2 text-xs"
                                                  >
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">No comments yet</p>
                  <p className="text-xs text-muted-foreground">Be the first to share your thoughts on this project</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}