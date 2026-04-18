'use client'

import { useState, useEffect, use } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import EditProjectForm from "@/components/projects/edit-project-form"
import CollaborationPanel from "@/components/collaboration/collaboration-panel"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

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
  categoryId?: string
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

export default function EditProjectPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [access, setAccess] = useState<{ canEdit: boolean; role: 'owner' | 'collaborator' | 'none' } | null>(null)

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${params.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setProject(data)
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

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  // Check if user can edit this project (owner, admin, or accepted collaborator)
  useEffect(() => {
    const run = async () => {
      if (!project || !isAuthenticated || !user || authLoading) return
      if (user.role === 'admin' || user.id === project.author.id) {
        setAccess({ canEdit: true, role: 'owner' })
        return
      }
      try {
        const r = await fetch(`/api/collaborators/can-edit?contentType=PROJECT&contentId=${params.id}`)
        if (r.ok) {
          const data = await r.json()
          setAccess({ canEdit: !!data.canEdit, role: data.role })
          if (!data.canEdit) router.push(`/projects/${params.id}`)
        } else {
          router.push(`/projects/${params.id}`)
        }
      } catch {
        router.push(`/projects/${params.id}`)
      }
    }
    run()
  }, [project, isAuthenticated, user, authLoading, router, params.id])

  // Show loading state while authentication is being checked or project is being fetched
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-muted-foreground mt-2">{error || 'Project not found'}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if user can edit this project
  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  const isOwner = user.role === 'admin' || user.id === project.author.id
  // Let the async effect settle before rendering
  if (!isOwner && access === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  if (!isOwner && !access?.canEdit) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Project</h1>
            <p className="text-muted-foreground">
              Update your drone project information and share the latest developments with the community.
            </p>
            {access?.role === 'collaborator' && (
              <p className="mt-2 text-sm text-amber-700">
                You are editing as a collaborator. Only the owner can delete this project.
              </p>
            )}
          </div>
          {isOwner && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Users className="mr-2 h-4 w-4" /> Collaborators
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Collaborators</SheetTitle>
                  <SheetDescription>
                    Invite people to help edit this project. They can view and edit everything except delete.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <CollaborationPanel contentType="PROJECT" contentId={params.id} canManage bare />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <EditProjectForm
          projectId={params.id}
          initialData={project}
        />
      </div>
    </div>
  )
}
