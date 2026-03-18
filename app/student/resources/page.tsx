'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  BookOpen, Download, FileText, Search, Star, ExternalLink,
  GraduationCap, AlertCircle, CheckCircle, BookMarked
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: string
  fileSize?: string
  downloads: number
  isRegulation: boolean
  category: { id: string; name: string }
  uploadedBy: { username: string; fullName: string }
  uploadedAt: string
}

const STUDENT_TIPS = [
  'Start with the Rwanda CAA regulations to understand the legal framework.',
  'Download the official exam preparation guide before your CAA test.',
  'Practice flight planning using the provided templates.',
  'Review safety protocols — they are heavily tested in the CAA exam.',
  'Join the forum to ask questions from experienced pilots.',
]

export default function StudentResourcesPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/resources', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setResources(data.resources || data || [])
      }
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (resource: Resource) => {
    try {
      window.open(resource.fileUrl, '_blank')
      toast.success(`Downloading "${resource.title}"`)
    } catch {
      toast.error('Download failed')
    }
  }

  const filterByTab = (res: Resource[]) => {
    const q = search.toLowerCase()
    const filtered = res.filter(r =>
      r.title.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      r.category.name.toLowerCase().includes(q)
    )
    switch (activeTab) {
      case 'regulations':
        return filtered.filter(r => r.isRegulation)
      case 'flight':
        return filtered.filter(r =>
          r.category.name.toLowerCase().includes('flight') ||
          r.category.name.toLowerCase().includes('training')
        )
      case 'technical':
        return filtered.filter(r =>
          r.category.name.toLowerCase().includes('technical') ||
          r.category.name.toLowerCase().includes('maintenance') ||
          r.category.name.toLowerCase().includes('equipment')
        )
      case 'caa':
        return filtered.filter(r =>
          r.isRegulation ||
          r.title.toLowerCase().includes('caa') ||
          r.title.toLowerCase().includes('exam') ||
          r.title.toLowerCase().includes('certification')
        )
      default:
        return filtered
    }
  }

  const displayedResources = filterByTab(resources)

  const getFileTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'video': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'excel': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Learning Resources</h1>
              <p className="text-muted-foreground mt-1">
                Find materials for drone training and certification
              </p>
            </div>
          </div>
        </div>

        {/* Featured Card */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/15 rounded-lg mt-0.5">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-lg">
                    Rwanda CAA Exam Preparation
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Access official regulations, study guides, and practice materials for your
                    Civil Aviation Authority drone operator certification.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setActiveTab('caa')}
                className="shrink-0"
              >
                View Exam Materials
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Resources */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="regulations">Regulations</TabsTrigger>
                <TabsTrigger value="flight">Flight Training</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="caa">CAA Exam Prep</TabsTrigger>
              </TabsList>

              {['all', 'regulations', 'flight', 'technical', 'caa'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-4">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : displayedResources.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {search ? 'No resources match your search.' : 'No resources in this category yet.'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {displayedResources.map(resource => (
                        <Card key={resource.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="p-2 bg-muted rounded-lg shrink-0">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-medium text-foreground truncate">
                                      {resource.title}
                                    </h3>
                                    {resource.isRegulation && (
                                      <Badge variant="secondary" className="text-xs shrink-0">
                                        Official
                                      </Badge>
                                    )}
                                    <Badge
                                      className={`text-xs shrink-0 ${getFileTypeColor(resource.fileType)}`}
                                    >
                                      {resource.fileType}
                                    </Badge>
                                  </div>
                                  {resource.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {resource.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span>{resource.category.name}</span>
                                    {resource.fileSize && <span>{resource.fileSize}</span>}
                                    <span>{resource.downloads} downloads</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0"
                                onClick={() => handleDownload(resource)}
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Tips Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Student Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {STUDENT_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-primary" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/resources">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    All Resources Library
                  </Button>
                </Link>
                <Link href="/student/internships">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <GraduationCap className="h-3.5 w-3.5 mr-2" />
                    Internship Opportunities
                  </Button>
                </Link>
                <Link href="/mentorship">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <BookOpen className="h-3.5 w-3.5 mr-2" />
                    Find a Mentor
                  </Button>
                </Link>
                <Link href="/forum">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <AlertCircle className="h-3.5 w-3.5 mr-2" />
                    Ask in the Forum
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{resources.length}</p>
                    <p className="text-xs text-muted-foreground">Total Resources</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {resources.filter(r => r.isRegulation).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Official Docs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
