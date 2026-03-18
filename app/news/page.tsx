'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Search,
  Eye,
  Calendar,
  Tag,
  TrendingUp,
  Newspaper,
  Loader2,
  ChevronRight,
  Star,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

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
  }
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'industry', label: 'Industry' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'community', label: 'Community' },
  { value: 'technology', label: 'Technology' },
]

const CATEGORY_STYLES: Record<string, string> = {
  industry: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  regulatory: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  community: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

function timeAgo(date: string | null): string {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchArticles = async (category: string, offset = 0, append = false) => {
    if (offset === 0) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({ limit: '12', offset: String(offset) })
      if (category !== 'all') params.set('category', category)

      const res = await fetch(`/api/news?${params}`)
      if (res.ok) {
        const data = await res.json()
        const newArticles: Article[] = data.articles || []
        if (append) {
          setArticles((prev) => [...prev, ...newArticles])
        } else {
          setArticles(newArticles)
        }
        setHasMore(data.total > offset + newArticles.length)
      }
    } catch {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(0)
    fetchArticles(activeCategory, 0, false)
  }, [activeCategory])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchArticles(activeCategory, nextPage * 12, true)
  }

  const filteredArticles = search
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.summary.toLowerCase().includes(search.toLowerCase())
      )
    : articles

  const featuredArticle = filteredArticles.find((a) => a.isFeatured)
  const regularArticles = filteredArticles.filter((a) => !a.isFeatured || a !== featuredArticle)

  // Popular articles (by views)
  const popularArticles = [...articles]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 5)

  // Collect all tags
  const allTags = Array.from(
    new Set(articles.flatMap((a) => (Array.isArray(a.tags) ? a.tags : [])))
  ).slice(0, 20)

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drone News & Updates</h1>
          <p className="text-muted-foreground mt-1">Stay informed on drone industry, regulations, and community news</p>
        </div>
        <Newspaper className="h-8 w-8 text-muted-foreground/50 hidden sm:block" />
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search articles..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList>
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="space-y-6 mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="text-center py-20">
                    <Newspaper className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">No articles found</h3>
                    <p className="text-muted-foreground mt-1">Check back soon for the latest news.</p>
                  </div>
                ) : (
                  <>
                    {/* Featured Banner */}
                    {featuredArticle && !search && (
                      <Link href={`/news/${featuredArticle.slug}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                          <div className="relative">
                            <div className="h-64 sm:h-80 bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center overflow-hidden">
                              {featuredArticle.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={featuredArticle.thumbnail}
                                  alt={featuredArticle.title}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <Newspaper className="h-20 w-20 text-muted-foreground/20" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-medium text-yellow-400">Featured</span>
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                                    CATEGORY_STYLES[featuredArticle.category] || 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {featuredArticle.category}
                                </span>
                              </div>
                              <h2 className="text-xl sm:text-2xl font-bold line-clamp-2">{featuredArticle.title}</h2>
                              <p className="text-sm text-white/80 mt-1 line-clamp-2">{featuredArticle.summary}</p>
                              <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
                                <span>{featuredArticle.author.fullName}</span>
                                <span>{timeAgo(featuredArticle.publishedAt)}</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {featuredArticle.viewsCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )}

                    {/* Article Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {regularArticles.map((article) => (
                        <Link key={article.id} href={`/news/${article.slug}`}>
                          <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group h-full">
                            <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
                              {article.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={article.thumbnail}
                                  alt={article.title}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <Newspaper className="h-12 w-12 text-muted-foreground/20" />
                              )}
                            </div>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                                    CATEGORY_STYLES[article.category] || 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {article.category}
                                </span>
                              </div>
                              <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{article.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={article.author.avatar || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {article.author.fullName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">{article.author.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-0.5">
                                    <Eye className="h-3 w-3" />
                                    {article.viewsCount}
                                  </span>
                                  <span>{timeAgo(article.publishedAt)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                          {loadingMore && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Load More
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Articles */}
          {popularArticles.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Popular</h3>
                </div>
                <div className="space-y-3">
                  {popularArticles.map((article, i) => (
                    <Link key={article.id} href={`/news/${article.slug}`}>
                      <div className="flex gap-2 group cursor-pointer">
                        <span className="text-2xl font-bold text-muted-foreground/20 leading-none w-6 flex-shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {article.viewsCount} views
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-muted transition-colors">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
