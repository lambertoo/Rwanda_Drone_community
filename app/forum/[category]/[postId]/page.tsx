import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark, Flag, ThumbsUp, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    category: string
    postId: string
  }
}

export default async function ForumPostPage({ params }: PageProps) {
  const { category, postId } = await params

  // Fetch post data from database
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: true,
      category: true,
      comments: {
        include: {
          author: true,
          replies: {
            include: {
              author: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!post) {
    notFound()
  }

  // Parse tags from JSON string
  const tags = post.tags ? JSON.parse(post.tags) : []

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

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href={`/forum/${category}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to {category}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/forum" className="hover:text-foreground">
            Forum
          </Link>
          <span>/</span>
          <Link href={`/forum/${category}`} className="hover:text-foreground capitalize">
            {category}
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

            {/* Post Stats */}
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none mb-6">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>

          <Separator className="my-6" />

          {/* Post Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Heart className="h-4 w-4" />
                Like
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <MessageSquare className="h-4 w-4" />
                Reply
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
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
          <Textarea placeholder="Share your thoughts, ask questions, or provide additional information..." rows={4} />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Be respectful and constructive in your responses</div>
            <Button>Post Reply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Replies ({post.comments.length})</h2>
        {post.comments.map((comment) => (
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
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-2">
                      <ThumbsUp className="h-3 w-3" />
                      {comment.likesCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      Reply
                    </Button>
                  </div>

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
                            <p className="text-sm mb-2">{nestedReply.content}</p>
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 h-6 px-2 text-xs">
                                <ThumbsUp className="h-3 w-3" />
                                {nestedReply.likesCount}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
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
