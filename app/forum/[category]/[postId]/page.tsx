"use client"
import { useState, useEffect, use } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark, Flag, ThumbsUp, Calendar, Eye, Send, Loader, Edit, X } from "lucide-react"
import Link from "next/link"
import { useNotification } from "@/components/ui/notification"
import { useAuth } from "@/lib/auth-context"
import { EditPostForm } from "@/components/forum/edit-post-form"

interface PageProps {
  params: Promise<{
    category: string
    postId: string
  }>
}

export default function ForumPostPage({ params }: PageProps) {
  const { category, postId } = use(params)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({})
  const [isEditing, setIsEditing] = useState(false)
  const { showNotification } = useNotification()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const initializePage = async () => {
      await fetchPost(postId)
      await fetchComments(postId)
      
      // Check likes after user is loaded
      if (user && !authLoading) {
        await checkIfLiked(postId)
        await checkCommentLikes(postId)
      }
    }
    
    initializePage()
  }, [postId, user, authLoading])

  const fetchPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        console.error("Failed to fetch post")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const checkIfLiked = async (postId: string) => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/forum/posts/${postId}/like/check`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const checkCommentLikes = async (postId: string) => {
    if (!user || comments.length === 0) return
    
    try {
      const allComments = comments.flatMap(comment => [comment, ...(comment.replies || [])])
      const likePromises = allComments.map(comment =>
        fetch(`/api/forum/comments/${comment.id}/like/check`)
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

  const handleLike = async () => {
    if (!user) {
      showNotification('error', 'Authentication Required', 'Please log in to like posts')
      return
    }

    try {
      const { postId } = await params
      const response = await fetch(`/api/forum/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setPost(prev => prev ? { ...prev, likesCount: data.likesCount } : null)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = async () => {
    if (!user) {
      showNotification('error', 'Authentication Required', 'Please log in to comment')
      return
    }

    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const { postId } = await params
      const response = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment("")
        await fetchComments(postId)
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!user) {
      showNotification('error', 'Authentication Required', 'Please log in to reply')
      return
    }

    if (!replyContent.trim()) return

    setIsSubmittingReply(true)
    try {
      const { postId } = await params
      const response = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: replyContent,
          parentId: parentId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReplyContent("")
        setReplyingTo(null)
        await fetchComments(postId)
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      showNotification('error', 'Authentication Required', 'Please log in to like comments')
      return
    }

    try {
      const response = await fetch(`/api/forum/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "Forum Post",
          text: post?.content || "Check out this forum post!",
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing post:", error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      showNotification('success', 'Success', 'Link copied to clipboard!')
    }
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    // Refresh the post data
    fetchPost(postId)
  }

  // Check if user can edit the post
  const canEdit = user && (user.id === post?.authorId || user.role === 'admin')

  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return formatDate(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
        <p className="text-muted-foreground">The post you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-6">
          <Link href="/forum">Back to Forum</Link>
        </Button>
      </div>
    )
  }

  // Handle tags - they are already JSON objects from the database
  const tags = Array.isArray(post.tags) ? post.tags : []

  // If editing, show the edit form
  if (isEditing) {
    return (
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 bg-transparent"
          >
            <X className="h-4 w-4" />
            Cancel Edit
          </Button>
        </div>

        {/* Edit Form */}
        <EditPostForm
          post={post}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href={`/forum/${post.category.slug}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to {post.category.name}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/forum" className="hover:text-foreground">
            Forum
          </Link>
          <span>/</span>
          <Link href={`/forum/${post.category.slug}`} className="hover:text-foreground capitalize">
            {post.category.name}
          </Link>
          <span>/</span>
          <span>Post</span>
        </div>
      </div>

      {/* Post Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{post.category.name}</Badge>
                {post.isPinned && <Badge className="bg-yellow-100 text-yellow-800">Pinned</Badge>}
                {tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.fullName} />
                  <AvatarFallback>
                    {post.author.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.author.fullName}</span>
                    {post.author.isVerified && <Badge className="text-xs bg-blue-100 text-blue-800">Verified</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    @{post.author.username} • {post.author.reputation} reputation • {post.author.postsCount} posts
                  </div>
                </div>
              </div>
            </div>

            {/* Post Stats and Edit Button */}
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.viewsCount}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {post.repliesCount}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {formatDate(post.createdAt)}
              </div>
              {/* Edit Button - Only visible to creator and admin */}
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 mt-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Post
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none mb-6">
            <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed max-w-full">
              {post.content}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Post Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {post.likesCount || 0} {isLiked ? "Liked" : "Like"}
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <MessageSquare className="h-4 w-4" />
                {post.repliesCount || 0} Replies
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 bg-transparent"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            id="new-comment"
            name="new-comment"
            placeholder="Share your thoughts, ask questions, or provide additional information..." 
            rows={4} 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Be respectful and constructive in your responses</div>
            <Button 
              onClick={handleComment}
              disabled={isSubmittingComment || !newComment.trim()}
            >
              {isSubmittingComment ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Reply'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Replies ({comments.length})</h2>
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.fullName} />
                  <AvatarFallback>
                    {comment.author.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{comment.author.fullName}</span>
                    <span className="text-sm text-muted-foreground">@{comment.author.username}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">{comment.content}</p>
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
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                      {comment.replies.map((nestedReply) => (
                        <div key={nestedReply.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={nestedReply.author.avatar || "/placeholder.svg"}
                              alt={nestedReply.author.fullName}
                            />
                            <AvatarFallback>
                              {nestedReply.author.fullName
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{nestedReply.author.fullName}</span>
                              <span className="text-xs text-muted-foreground">@{nestedReply.author.username}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(nestedReply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm mb-2 break-words overflow-wrap-anywhere leading-relaxed">{nestedReply.content}</p>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
