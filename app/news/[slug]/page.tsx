'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Eye,
  Calendar,
  User,
  Newspaper,
  Loader2,
  Share2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  thumbnail: string | null
  category: string
  tags: string[]
  isFeatured: boolean
  viewsCount: number
  publishedAt: string | null
  createdAt: string
  author: {
    id: string
    username: string
    fullName: string
    avatar: string | null
    role: string | null
    bio: string | null
  }
}

const CATEGORY_STYLES: Record<string, string> = {
  industry: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  regulatory: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  community: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-RW', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/news/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setArticle(data.article)
          // Fetch related articles
          const relRes = await fetch(`/api/news?category=${data.article.category}&limit=4`)
          if (relRes.ok) {
            const relData = await relRes.json()
            setRelatedArticles(
              (relData.articles || []).filter((a: Article) => a.slug !== slug).slice(0, 3)
            )
          }
        } else {
          toast.error('Article not found')
          router.push('/news')
        }
      } catch {
        toast.error('Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: article?.title, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!article) return null

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Back */}
      <div className="flex items-center gap-2">
        <Link href="/news">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-muted-foreground text-sm">Back to News</span>
      </div>

      <article className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                CATEGORY_STYLES[article.category] || 'bg-muted text-muted-foreground'
              }`}
            >
              {article.category}
            </span>
            {article.isFeatured && (
              <Badge className="text-xs">Featured</Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{article.title}</h1>
          <p className="text-lg text-muted-foreground">{article.summary}</p>

          <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={article.author.avatar || undefined} />
                <AvatarFallback>
                  {article.author.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${article.author.username}`} className="font-medium text-sm hover:underline">
                  {article.author.fullName}
                </Link>
                {article.author.role && (
                  <p className="text-xs text-muted-foreground capitalize">{article.author.role.replace('_', ' ')}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.viewsCount} views
              </span>
              <Button variant="ghost" size="sm" onClick={handleShare} className="h-7 px-2">
                <Share2 className="h-3.5 w-3.5 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {article.thumbnail && (
          <div className="rounded-xl overflow-hidden h-64 sm:h-96 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.thumbnail}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div
            className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap"
            style={{ lineHeight: '1.8' }}
          >
            {article.content}
          </div>
        </div>

        {/* Tags */}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Author bio */}
        {article.author.bio && (
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={article.author.avatar || undefined} />
                <AvatarFallback>
                  {article.author.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{article.author.fullName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{article.author.bio}</p>
                <Link href={`/profile/${article.author.username}`}>
                  <Button variant="link" size="sm" className="h-6 px-0 text-xs mt-1">
                    View Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold">Related Articles</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedArticles.map((ra) => (
              <Link key={ra.id} href={`/news/${ra.slug}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
                    {ra.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ra.thumbnail}
                        alt={ra.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Newspaper className="h-10 w-10 text-muted-foreground/20" />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium line-clamp-2">{ra.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ra.publishedAt || ra.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
